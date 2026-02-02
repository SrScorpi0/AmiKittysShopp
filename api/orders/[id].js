import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

const ALLOWED_STATUS = new Set(['pending', 'approved', 'sent', 'cancelled']);

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireAdmin(req);
    const { status } = await readJson(req);
    if (!status || !ALLOWED_STATUS.has(String(status))) {
      res.status(400).json({ error: 'Estado invalido' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: String(id) },
      data: { status: String(status) },
      include: { items: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
