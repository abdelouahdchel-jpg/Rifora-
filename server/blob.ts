import { put } from '@vercel/blob';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads');

export interface UploadResult {
  success: boolean;
  url?: string;
  storageType: 'vercel_blob' | 'local_disk' | 'data_url';
  error?: string;
  warning?: string;
}

/**
 * Uploads an image either to Vercel Blob (persistent cloud object storage)
 * or local disk with fallback.
 */
export async function uploadProductImage(dataUrl: string, originalFilename?: string): Promise<UploadResult> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return {
      success: false,
      storageType: 'data_url',
      error: 'Invalid or missing image data URL'
    };
  }

  const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches) {
    return {
      success: false,
      storageType: 'data_url',
      error: 'Malformed image data'
    };
  }

  const extRaw = matches[1].toLowerCase();
  const ext = extRaw === 'jpeg' ? 'jpg' : extRaw.replace('+xml', '');
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const safeBase = (originalFilename || 'rifora_piece')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const uniqueName = `products/${safeBase}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;

  // 1. Try Vercel Blob if token is configured
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blob = await put(uniqueName, buffer, {
        access: 'public',
        token: blobToken,
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
      });
      console.log('[RIFORA Storage] Image saved to Vercel Blob:', blob.url);
      return {
        success: true,
        url: blob.url,
        storageType: 'vercel_blob'
      };
    } catch (err: any) {
      console.error('[RIFORA Storage] Vercel Blob upload failed:', err);
    }
  }

  // 2. Try writing to local disk in dev environment
  try {
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
      fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }
    const filenameOnly = path.basename(uniqueName);
    const localFilePath = path.join(LOCAL_UPLOADS_DIR, filenameOnly);
    fs.writeFileSync(localFilePath, buffer);
    return {
      success: true,
      url: `/uploads/${filenameOnly}`,
      storageType: 'local_disk',
      warning: blobToken ? undefined : 'Running on local disk. Add BLOB_READ_WRITE_TOKEN in Vercel for permanent cloud object storage.'
    };
  } catch (err: any) {
    console.warn('[RIFORA Storage] Local disk write failed (expected on serverless read-only filesystem):', err?.message);
  }

  // 3. Fallback: Return optimized data URL directly
  return {
    success: true,
    url: dataUrl,
    storageType: 'data_url',
    warning: 'Uploaded as inline data URL. Connect Vercel Blob (BLOB_READ_WRITE_TOKEN) for optimal CDN storage.'
  };
}
