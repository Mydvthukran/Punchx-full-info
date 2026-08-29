import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleNamoidProxy } from '../_utils/namoid.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleNamoidProxy(req, res);
}
