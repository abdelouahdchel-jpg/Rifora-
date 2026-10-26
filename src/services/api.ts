import { Product, Inquiry, OwnerSettings, StorePolicies } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

export interface AuthStatusResponse {
  initialized: boolean;
  isAuthenticated: boolean;
  ownerEmail: string;
  currentUser: string | null;
  requiresSetupSecret: boolean;
  databaseType?: 'postgres' | 'local_file';
  databaseProvider?: string;
  blobStorageConfigured?: boolean;
}

export interface SetupPayload {
  email?: string;
  password: string;
  setupSecret?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Check Authentication & Initialization Status
 */
export async function getAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch('/api/auth/status', {
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    });
    if (!res.ok) {
      throw new Error(`Failed to check auth status (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('getAuthStatus error:', err);
    return {
      initialized: false,
      isAuthenticated: false,
      ownerEmail: 'abdelouahdchel@gmail.com',
      currentUser: null,
      requiresSetupSecret: false
    };
  }
}

/**
 * Initial Owner Account Setup (One-Time)
 */
export async function setupOwnerAccount(payload: SetupPayload): Promise<{ success: boolean; error?: string; email?: string }> {
  try {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to initialize owner account' };
    }
    return { success: true, email: data.email };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during setup' };
  }
}

/**
 * Owner Sign In
 */
export async function loginOwner(payload: LoginPayload): Promise<{ success: boolean; error?: string; email?: string; attemptsRemaining?: number }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed',
        attemptsRemaining: data.attemptsRemaining
      };
    }
    return { success: true, email: data.email };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during sign in' };
  }
}

/**
 * Owner Sign Out
 */
export async function logoutOwner(): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

/**
 * Public: Fetch Products (Strictly without purchaseCostMAD)
 */
export async function fetchPublicProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Falling back to initial products:', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Protected: Fetch Admin Products (Includes purchaseCostMAD)
 */
export async function fetchAdminProducts(): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/products', {
      credentials: 'same-origin'
    });
    if (res.status === 401) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }
    if (!res.ok) {
      return { success: false, error: `Error ${res.status}: Failed to fetch admin products.` };
    }
    const products = await res.json();
    return { success: true, products };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Save/Update Product
 */
export async function saveAdminProduct(product: Product): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const isNew = !product.id || product.id.startsWith('new_');
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(product.id)}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = isNew
      ? { ...product, id: 'rifora-' + Date.now().toString(36) }
      : product;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to save product' };
    }
    return { success: true, products: data.products };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Delete Product
 */
export async function deleteAdminProduct(productId: string): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete product' };
    }
    return { success: true, products: data.products };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Reset Products to Workshop 10
 */
export async function resetAdminProducts(): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/products/reset', {
      method: 'POST',
      credentials: 'same-origin'
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to reset products' };
    }
    return { success: true, products: data.products };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Upload Product Photo
 */
export async function uploadAdminImage(dataUrl: string, filename?: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ dataUrl, filename })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to upload image' };
    }
    return { success: true, url: data.url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Fetch Inquiries
 */
export async function fetchAdminInquiries(): Promise<{ success: boolean; inquiries?: Inquiry[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/inquiries', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    const inquiries = await res.json();
    return { success: true, inquiries };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Update Inquiry Status
 */
export async function updateAdminInquiryStatus(id: string, status: 'new' | 'contacted' | 'completed'): Promise<{ success: boolean; inquiries?: Inquiry[]; error?: string }> {
  try {
    const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return { success: true, inquiries: data.inquiries };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Protected: Clear Inquiries
 */
export async function clearAdminInquiries(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/inquiries', {
      method: 'DELETE',
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Failed to clear inquiries');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Public: Submit Inquiry
 */
export async function submitCustomerInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; inquiry?: Inquiry; error?: string }> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to submit inquiry' };
    }
    return { success: true, inquiry: data.inquiry };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Settings API
 */
export async function fetchStoreSettings(): Promise<OwnerSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch {
    return {
      whatsappNumber: '+212638194995',
      contactEmail: 'abdelouahdchel@gmail.com',
      storeCurrency: 'MAD'
    };
  }
}

export async function saveAdminSettings(settings: OwnerSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Store Policies API
 */
export async function fetchStorePolicies(): Promise<StorePolicies | null> {
  try {
    const res = await fetch('/api/policies');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveAdminPolicies(policies: StorePolicies): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(policies)
    });
    if (!res.ok) throw new Error('Failed to save policies');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
