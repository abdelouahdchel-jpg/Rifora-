import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import {
  getDatabaseStatus,
  getAuthRecord,
  saveAuthRecord,
  getAllProducts,
  saveProduct,
  deleteProduct,
  resetProducts,
  getAllInquiries,
  saveInquiry,
  updateInquiryStatus,
  clearInquiries,
  getStoreSettings,
  saveStoreSettings,
  getStorePolicies,
  saveStorePolicies
} from './db';
import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  SessionPayload
} from './session';
import { uploadProductImage } from './blob';
import { Product, Inquiry, OwnerSettings } from '../src/types';

export const app = express();

const isProd = process.env.NODE_ENV === 'production';
const OWNER_EMAIL_CONFIG = (process.env.OWNER_EMAIL || 'abdelouahdchel@gmail.com').trim().toLowerCase();
const ADMIN_SETUP_SECRET = (process.env.ADMIN_SETUP_SECRET || process.env.ADMIN_SETUP_TOKEN || '').trim();

// Middleware
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(cookieParser());

// Rate Limiting for Login Attempts
interface AttemptRecord {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}
const loginRateLimits = new Map<string, AttemptRecord>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: SessionPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies['rifora_session'] ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in as store owner.' });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.clearCookie('rifora_session', { path: '/' });
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = payload;
  next();
}

/* ==========================================================================
   SYSTEM & HEALTH ENDPOINT
   ========================================================================== */

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await getDatabaseStatus();
  const auth = await getAuthRecord();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: isProd ? 'production' : 'development',
    serverless: true,
    database: dbStatus,
    blobStorageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    authInitialized: auth.initialized,
    setupSecretConfigured: Boolean(ADMIN_SETUP_SECRET)
  });
});

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

app.get('/api/auth/status', async (req: Request, res: Response) => {
  const auth = await getAuthRecord();
  const dbStatus = await getDatabaseStatus();

  const token = req.cookies['rifora_session'] ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  let isAuthenticated = false;
  let currentUser: string | null = null;

  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      isAuthenticated = true;
      currentUser = payload.email;
    }
  }

  res.json({
    initialized: auth.initialized,
    isAuthenticated,
    ownerEmail: auth.ownerEmail || OWNER_EMAIL_CONFIG,
    currentUser,
    requiresSetupSecret: Boolean(ADMIN_SETUP_SECRET),
    databaseType: dbStatus.type,
    databaseProvider: dbStatus.provider,
    blobStorageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  });
});

app.post('/api/auth/setup', async (req: Request, res: Response) => {
  const auth = await getAuthRecord();

  if (auth.initialized) {
    return res.status(403).json({ error: 'Owner account has already been initialized. Please log in.' });
  }

  const { email, password, setupSecret } = req.body;

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  // Security Verification: If ADMIN_SETUP_SECRET is configured, require exact match
  if (ADMIN_SETUP_SECRET) {
    if (!setupSecret || setupSecret !== ADMIN_SETUP_SECRET) {
      return res.status(403).json({
        error: 'Invalid or missing owner setup secret key. Verify the ADMIN_SETUP_SECRET variable set in your Vercel project.'
      });
    }
  } else if (isProd) {
    // In production on Vercel without ADMIN_SETUP_SECRET, return a clear warning
    console.warn('[RIFORA Security] ADMIN_SETUP_SECRET is not configured in Vercel environment.');
  }

  const targetEmail = (email && typeof email === 'string' && email.includes('@'))
    ? email.trim().toLowerCase()
    : OWNER_EMAIL_CONFIG;

  const { salt, hash } = hashPassword(password);

  await saveAuthRecord({
    initialized: true,
    ownerEmail: targetEmail,
    passwordHash: hash,
    passwordSalt: salt,
    updatedAt: new Date().toISOString()
  });

  // Issue stateless HMAC-signed session token
  const token = createSessionToken(targetEmail);

  res.cookie('rifora_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });

  return res.json({
    success: true,
    message: 'Owner account initialized successfully.',
    email: targetEmail,
    token
  });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();

  let rateRecord = loginRateLimits.get(ip);
  if (rateRecord) {
    if (rateRecord.lockedUntil && now < rateRecord.lockedUntil) {
      const waitMinutes = Math.ceil((rateRecord.lockedUntil - now) / 60000);
      return res.status(429).json({
        error: `Too many failed login attempts. Temporarily locked for security. Please try again in ${waitMinutes} minute(s).`
      });
    }

    if (now - rateRecord.firstAttempt > LOGIN_WINDOW_MS) {
      loginRateLimits.delete(ip);
      rateRecord = undefined;
    }
  }

  const auth = await getAuthRecord();

  if (!auth.initialized) {
    return res.status(400).json({
      error: 'Owner account has not been initialized yet. Please complete initial setup first.'
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const isEmailMatch = cleanEmail === auth.ownerEmail.toLowerCase();
  const isPasswordMatch = isEmailMatch && verifyPassword(String(password), auth.passwordSalt, auth.passwordHash);

  if (!isEmailMatch || !isPasswordMatch) {
    const currentRecord = loginRateLimits.get(ip) || { attempts: 0, firstAttempt: now };
    currentRecord.attempts += 1;
    if (currentRecord.attempts >= MAX_LOGIN_ATTEMPTS) {
      currentRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
    loginRateLimits.set(ip, currentRecord);

    const attemptsRemaining = Math.max(0, MAX_LOGIN_ATTEMPTS - currentRecord.attempts);

    return setTimeout(() => {
      res.status(401).json({
        error: 'Invalid email or password.',
        attemptsRemaining
      });
    }, 400);
  }

  loginRateLimits.delete(ip);

  // Issue stateless HMAC-signed session token
  const token = createSessionToken(auth.ownerEmail);

  res.cookie('rifora_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });

  return res.json({
    success: true,
    email: auth.ownerEmail,
    token
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('rifora_session', { path: '/' });
  res.json({ success: true, message: 'Signed out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    authenticated: true,
    email: req.user?.email
  });
});

/* ==========================================================================
   PRODUCTS ENDPOINTS (Strict Public vs Admin Privacy Boundary)
   ========================================================================== */

/**
 * Public Products Endpoint:
 * STRIPS purchaseCostMAD and all internal supplier details.
 */
app.get('/api/products', async (_req: Request, res: Response) => {
  const products = await getAllProducts();

  const customerSafe = products.map(product => {
    const { purchaseCostMAD, ...safeData } = product;
    return safeData;
  });

  res.json(customerSafe);
});

/**
 * Protected Admin Products Endpoint:
 * Returns full product details INCLUDING purchaseCostMAD for authenticated owner.
 */
app.get('/api/admin/products', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const products = await getAllProducts();
  res.json(products);
});

app.post('/api/admin/products', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const newProduct: Product = req.body;
  if (!newProduct.id || !newProduct.name?.en) {
    return res.status(400).json({ error: 'Product ID and English name are required.' });
  }

  const products = await saveProduct(newProduct);
  res.json({ success: true, product: newProduct, products });
});

app.put('/api/admin/products/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentProducts = await getAllProducts();
  const existing = currentProducts.find(p => p.id === id);

  if (!existing) {
    return res.status(404).json({ error: `Product ${id} not found.` });
  }

  const updated: Product = {
    ...existing,
    ...req.body,
    id
  };

  const products = await saveProduct(updated);
  res.json({ success: true, product: updated, products });
});

app.delete('/api/admin/products/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const products = await deleteProduct(id);
  res.json({ success: true, products });
});

app.post('/api/admin/products/reset', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const products = await resetProducts();
  res.json({ success: true, products });
});

/**
 * Protected: Upload Product Photo to Vercel Blob (Persistent Object Storage)
 */
app.post('/api/admin/upload', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { dataUrl, filename } = req.body;
  const result = await uploadProductImage(dataUrl, filename);

  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to upload photo.' });
  }

  res.json(result);
});

/* ==========================================================================
   INQUIRIES & STORE SETTINGS
   ========================================================================== */

app.post('/api/inquiries', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.customerName || !data.email || !data.destinationCountry) {
    return res.status(400).json({ error: 'Name, email, and destination country are required.' });
  }

  const newInquiry: Inquiry = {
    id: 'inq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    customerName: String(data.customerName).slice(0, 80),
    email: String(data.email).slice(0, 100),
    phone: data.phone ? String(data.phone).slice(0, 30) : undefined,
    destinationCountry: String(data.destinationCountry).slice(0, 60),
    productId: String(data.productId || 'general').slice(0, 50),
    productName: String(data.productName || 'General Inquiry').slice(0, 120),
    quantity: Math.max(1, Math.min(100, Math.floor(Number(data.quantity) || 1))),
    notes: data.notes ? String(data.notes).slice(0, 500) : undefined,
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  await saveInquiry(newInquiry);
  res.json({ success: true, inquiry: newInquiry });
});

app.get('/api/admin/inquiries', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const inquiries = await getAllInquiries();
  res.json(inquiries);
});

app.put('/api/admin/inquiries/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['new', 'contacted', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be new, contacted, or completed.' });
  }

  const inquiries = await updateInquiryStatus(id, status);
  res.json({ success: true, inquiries });
});

app.delete('/api/admin/inquiries', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  await clearInquiries();
  res.json({ success: true, inquiries: [] });
});

app.get('/api/settings', async (_req: Request, res: Response) => {
  const settings = await getStoreSettings();
  res.json(settings);
});

app.put('/api/admin/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = await getStoreSettings();
  const updated: OwnerSettings = {
    ...current,
    ...req.body
  };
  const saved = await saveStoreSettings(updated);
  res.json({ success: true, settings: saved });
});

app.get('/api/policies', async (_req: Request, res: Response) => {
  const policies = await getStorePolicies();
  res.json(policies);
});

app.put('/api/admin/policies', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = await getStorePolicies();
  const updated = {
    ...current,
    ...req.body
  };
  const saved = await saveStorePolicies(updated);
  res.json({ success: true, policies: saved });
});
