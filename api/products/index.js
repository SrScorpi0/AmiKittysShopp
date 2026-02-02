import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId } : undefined;
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    res.status(200).json(
      products.map((product) => ({
        ...product,
        categoryName: product.category?.label || '',
      })),
    );
    return;
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const data = await readJson(req);
    if (!data?.title) {
      res.status(400).json({ error: 'Title es obligatorio' });
      return;
    }
    const created = await prisma.product.create({
      data: {
        id: data.id || data.title.toLowerCase().trim().replace(/\s+/g, '-'),
        title: data.title,
        image: data.image || '/img/Logo/Logo.png',
        images: data.images || [],
        price: data.price ?? 0,
        description: data.description || '',
        material: data.material || '',
        size: data.size || '',
        color: data.color || '',
        stock: data.stock ?? 0,
        categoryId: data.categoryId || 'todos',
      },
      include: { category: true },
    });
    res.status(201).json({
      ...created,
      categoryName: created.category?.label || '',
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
