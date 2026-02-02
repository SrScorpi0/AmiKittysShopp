import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    requireAdmin(req);
    const { label } = await readJson(req);
    if (!label) {
      res.status(400).json({ error: 'Label es obligatorio' });
      return;
    }
    const updated = await prisma.category.update({
      where: { id },
      data: { label },
    });
    res.status(200).json(updated);
    return;
  }

  if (req.method === 'DELETE') {
    requireAdmin(req);
    if (id === 'todos') {
      res.status(400).json({ error: 'No se puede eliminar la categoria por defecto' });
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: 'todos' },
      });
      await tx.category.delete({ where: { id } });
    });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
