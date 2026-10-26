import crypto from 'crypto';

// Secret used to sign session cookies across serverless instances
const SESSION_SECRET = (process.env.SESSION_SECRET || 'rifora_dev_fallback_secret_change_in_production_32chars').trim();

export interface SessionPayload {
  email: string;
  role: 'owner';
  iat: number;
  exp: number;
  jti: string; // unique random identifier for token uniqueness
}

/**
 * Creates a cryptographically signed, stateless session token
 * suitable for multi-region serverless invocations.
 */
export function createSessionToken(email: string, durationMs = 7 * 24 * 60 * 60 * 1000): string {
  const now = Date.now();
  const payload: SessionPayload = {
    email: email.toLowerCase(),
    role: 'owner',
    iat: now,
    exp: now + durationMs,
    jti: crypto.randomBytes(16).toString('hex')
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies and decodes a session token across any serverless invocation.
 * Returns null if expired, tampered with, or invalid.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadString, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadString)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadString, 'base64url').toString('utf-8'));

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Cryptographic Password Hashing Utilities using scrypt
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}
