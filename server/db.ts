import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, Inquiry, OwnerSettings, StorePolicies } from '../src/types';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts';
import { DEFAULT_POLICIES } from '../src/services/storage';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback local store paths
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface AuthRecord {
  initialized: boolean;
  ownerEmail: string;
  passwordHash: string;
  passwordSalt: string;
  updatedAt: string;
}

export interface DataStore {
  auth: AuthRecord;
  products: Product[];
  inquiries: Inquiry[];
  settings: OwnerSettings;
  policies: StorePolicies;
}

// Check database connection string
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pool: pg.Pool | null = null;
let isPostgresInitialized = false;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log('[RIFORA Database] PostgreSQL pool configured from environment.');
  } catch (err) {
    console.error('[RIFORA Database] Failed to initialize PostgreSQL pool:', err);
    pool = null;
  }
}

/**
 * Initialize PostgreSQL tables if connected
 */
async function initPostgresTables(): Promise<boolean> {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS rifora_auth (
          id VARCHAR(50) PRIMARY KEY,
          initialized BOOLEAN NOT NULL DEFAULT FALSE,
          owner_email VARCHAR(150) NOT NULL,
          password_hash TEXT NOT NULL DEFAULT '',
          password_salt TEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rifora_products (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rifora_inquiries (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rifora_settings (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rifora_policies (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed auth record if missing
      const authRes = await client.query('SELECT * FROM rifora_auth WHERE id = $1', ['owner']);
      if (authRes.rows.length === 0) {
        const ownerEmail = (process.env.OWNER_EMAIL || 'abdelouahdchel@gmail.com').trim().toLowerCase();
        await client.query(`
          INSERT INTO rifora_auth (id, initialized, owner_email, password_hash, password_salt, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, ['owner', false, ownerEmail, '', '']);
      }

      // Seed products if table is empty
      const prodRes = await client.query('SELECT count(*) as count FROM rifora_products');
      if (parseInt(prodRes.rows[0].count, 10) === 0) {
        for (const prod of INITIAL_PRODUCTS) {
          await client.query(`
            INSERT INTO rifora_products (id, data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [prod.id, JSON.stringify(prod)]);
        }
      }

      // Seed settings if missing
      const settRes = await client.query('SELECT * FROM rifora_settings WHERE id = $1', ['store_settings']);
      if (settRes.rows.length === 0) {
        const defaultSettings: OwnerSettings = {
          whatsappNumber: '+212638194995',
          contactEmail: 'abdelouahdchel@gmail.com',
          storeCurrency: 'MAD',
          defaultShippingCostMAD: null
        };
        await client.query(`
          INSERT INTO rifora_settings (id, data, updated_at)
          VALUES ($1, $2, NOW())
        `, ['store_settings', JSON.stringify(defaultSettings)]);
      }

      // Seed policies if missing
      const polRes = await client.query('SELECT * FROM rifora_policies WHERE id = $1', ['store_policies']);
      if (polRes.rows.length === 0) {
        await client.query(`
          INSERT INTO rifora_policies (id, data, updated_at)
          VALUES ($1, $2, NOW())
        `, ['store_policies', JSON.stringify(DEFAULT_POLICIES)]);
      }

      isPostgresInitialized = true;
      console.log('[RIFORA Database] PostgreSQL tables verified and seeded successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[RIFORA Database] Error initializing PostgreSQL tables:', err);
    return false;
  }
}

// Fallback File System Storage
function loadLocalStore(): DataStore {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading local store.json', e);
    }
  }

  const defaultSettings: OwnerSettings = {
    whatsappNumber: '+212638194995',
    contactEmail: 'abdelouahdchel@gmail.com',
    storeCurrency: 'MAD',
    defaultShippingCostMAD: null
  };

  const initialStore: DataStore = {
    auth: {
      initialized: false,
      ownerEmail: (process.env.OWNER_EMAIL || 'abdelouahdchel@gmail.com').trim().toLowerCase(),
      passwordHash: '',
      passwordSalt: '',
      updatedAt: new Date().toISOString()
    },
    products: INITIAL_PRODUCTS,
    inquiries: [],
    settings: defaultSettings,
    policies: DEFAULT_POLICIES
  };

  saveLocalStore(initialStore);
  return initialStore;
}

function saveLocalStore(store: DataStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write store.json', e);
  }
}

/* ==========================================================================
   PUBLIC DATABASE INTERFACES (Seamless Switch between Postgres and Local)
   ========================================================================== */

export async function getDatabaseStatus(): Promise<{ type: 'postgres' | 'local_file'; connected: boolean; provider: string }> {
  if (pool) {
    try {
      if (!isPostgresInitialized) {
        await initPostgresTables();
      }
      const res = await pool.query('SELECT NOW()');
      if (res.rows.length > 0) {
        return { type: 'postgres', connected: true, provider: 'Vercel Postgres / Neon' };
      }
    } catch {
      // Fallback
    }
  }
  return { type: 'local_file', connected: true, provider: 'Local File Store (Development Fallback)' };
}

export async function getAuthRecord(): Promise<AuthRecord> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT * FROM rifora_auth WHERE id = $1', ['owner']);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          initialized: Boolean(row.initialized),
          ownerEmail: row.owner_email,
          passwordHash: row.password_hash || '',
          passwordSalt: row.password_salt || '',
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
        };
      }
    } catch (err) {
      console.error('PostgreSQL getAuthRecord error:', err);
    }
  }
  const local = loadLocalStore();
  return local.auth;
}

export async function saveAuthRecord(auth: AuthRecord): Promise<void> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query(`
        INSERT INTO rifora_auth (id, initialized, owner_email, password_hash, password_salt, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          initialized = EXCLUDED.initialized,
          owner_email = EXCLUDED.owner_email,
          password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          updated_at = NOW()
      `, ['owner', auth.initialized, auth.ownerEmail, auth.passwordHash, auth.passwordSalt]);
      return;
    } catch (err) {
      console.error('PostgreSQL saveAuthRecord error:', err);
    }
  }
  const local = loadLocalStore();
  local.auth = auth;
  saveLocalStore(local);
}

export async function getAllProducts(): Promise<Product[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT data FROM rifora_products ORDER BY updated_at DESC');
      if (res.rows.length > 0) {
        return res.rows.map(r => r.data as Product);
      }
    } catch (err) {
      console.error('PostgreSQL getAllProducts error:', err);
    }
  }
  const local = loadLocalStore();
  return local.products;
}

export async function saveProduct(product: Product): Promise<Product[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query(`
        INSERT INTO rifora_products (id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW()
      `, [product.id, JSON.stringify(product)]);
      return await getAllProducts();
    } catch (err) {
      console.error('PostgreSQL saveProduct error:', err);
    }
  }
  const local = loadLocalStore();
  const idx = local.products.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    local.products[idx] = product;
  } else {
    local.products = [product, ...local.products];
  }
  saveLocalStore(local);
  return local.products;
}

export async function deleteProduct(productId: string): Promise<Product[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query('DELETE FROM rifora_products WHERE id = $1', [productId]);
      return await getAllProducts();
    } catch (err) {
      console.error('PostgreSQL deleteProduct error:', err);
    }
  }
  const local = loadLocalStore();
  local.products = local.products.filter(p => p.id !== productId);
  saveLocalStore(local);
  return local.products;
}

export async function resetProducts(): Promise<Product[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query('DELETE FROM rifora_products');
      for (const prod of INITIAL_PRODUCTS) {
        await pool.query(`
          INSERT INTO rifora_products (id, data, updated_at)
          VALUES ($1, $2, NOW())
        `, [prod.id, JSON.stringify(prod)]);
      }
      return await getAllProducts();
    } catch (err) {
      console.error('PostgreSQL resetProducts error:', err);
    }
  }
  const local = loadLocalStore();
  local.products = INITIAL_PRODUCTS;
  saveLocalStore(local);
  return INITIAL_PRODUCTS;
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT data FROM rifora_inquiries ORDER BY created_at DESC');
      return res.rows.map(r => r.data as Inquiry);
    } catch (err) {
      console.error('PostgreSQL getAllInquiries error:', err);
    }
  }
  const local = loadLocalStore();
  return local.inquiries;
}

export async function saveInquiry(inquiry: Inquiry): Promise<Inquiry[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query(`
        INSERT INTO rifora_inquiries (id, data, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data
      `, [inquiry.id, JSON.stringify(inquiry)]);
      return await getAllInquiries();
    } catch (err) {
      console.error('PostgreSQL saveInquiry error:', err);
    }
  }
  const local = loadLocalStore();
  local.inquiries = [inquiry, ...local.inquiries];
  saveLocalStore(local);
  return local.inquiries;
}

export async function updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'completed'): Promise<Inquiry[]> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT data FROM rifora_inquiries WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const inq = res.rows[0].data as Inquiry;
        inq.status = status;
        await pool.query('UPDATE rifora_inquiries SET data = $1 WHERE id = $2', [JSON.stringify(inq), id]);
      }
      return await getAllInquiries();
    } catch (err) {
      console.error('PostgreSQL updateInquiryStatus error:', err);
    }
  }
  const local = loadLocalStore();
  local.inquiries = local.inquiries.map(i => i.id === id ? { ...i, status } : i);
  saveLocalStore(local);
  return local.inquiries;
}

export async function clearInquiries(): Promise<void> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query('DELETE FROM rifora_inquiries');
      return;
    } catch (err) {
      console.error('PostgreSQL clearInquiries error:', err);
    }
  }
  const local = loadLocalStore();
  local.inquiries = [];
  saveLocalStore(local);
}

export async function getStoreSettings(): Promise<OwnerSettings> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT data FROM rifora_settings WHERE id = $1', ['store_settings']);
      if (res.rows.length > 0) {
        return res.rows[0].data as OwnerSettings;
      }
    } catch (err) {
      console.error('PostgreSQL getStoreSettings error:', err);
    }
  }
  const local = loadLocalStore();
  return local.settings;
}

export async function saveStoreSettings(settings: OwnerSettings): Promise<OwnerSettings> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query(`
        INSERT INTO rifora_settings (id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW()
      `, ['store_settings', JSON.stringify(settings)]);
      return settings;
    } catch (err) {
      console.error('PostgreSQL saveStoreSettings error:', err);
    }
  }
  const local = loadLocalStore();
  local.settings = settings;
  saveLocalStore(local);
  return settings;
}

export async function getStorePolicies(): Promise<StorePolicies> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      const res = await pool.query('SELECT data FROM rifora_policies WHERE id = $1', ['store_policies']);
      if (res.rows.length > 0) {
        return res.rows[0].data as StorePolicies;
      }
    } catch (err) {
      console.error('PostgreSQL getStorePolicies error:', err);
    }
  }
  const local = loadLocalStore();
  return local.policies;
}

export async function saveStorePolicies(policies: StorePolicies): Promise<StorePolicies> {
  if (pool) {
    try {
      if (!isPostgresInitialized) await initPostgresTables();
      await pool.query(`
        INSERT INTO rifora_policies (id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW()
      `, ['store_policies', JSON.stringify(policies)]);
      return policies;
    } catch (err) {
      console.error('PostgreSQL saveStorePolicies error:', err);
    }
  }
  const local = loadLocalStore();
  local.policies = policies;
  saveLocalStore(local);
  return policies;
}
