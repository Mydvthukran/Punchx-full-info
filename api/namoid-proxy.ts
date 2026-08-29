import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleNamoidProxy } from './_utils/namoid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleNamoidProxy(req, res);
}
