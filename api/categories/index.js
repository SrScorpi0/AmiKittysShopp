import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({ orderBy: { label: 'asc' } });
    res.status(200).json(categories);
    return;
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const { id, label } = await readJson(req);
    if (!label) {
      res.status(400).json({ error: 'Label es obligatorio' });
      return;
    }
    const categoryId = id || label.toLowerCase().trim().replace(/\s+/g, '-');
    const created = await prisma.category.create({
      data: { id: categoryId, label },
    });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
