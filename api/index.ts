import { app } from '../server/app';

// Vercel serverless function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}
