import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = requireAdmin(req);
    res.status(200).json({ user: payload });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
