import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    requireAdmin(req);
    const data = await readJson(req);
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        image: data.image,
        images: data.images,
        price: data.price,
        description: data.description,
        material: data.material,
        size: data.size,
        color: data.color,
        stock: data.stock,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
    res.status(200).json({
      ...updated,
      categoryName: updated.category?.label || '',
    });
    return;
  }

  if (req.method === 'DELETE') {
    requireAdmin(req);
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
