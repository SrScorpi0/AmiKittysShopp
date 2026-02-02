import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { items, total, phone, address, message, notes } = await readJson(req);
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'El carrito esta vacio.' });
    return;
  }
  if (!phone || !address) {
    res.status(400).json({ error: 'Faltan telefono o direccion.' });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.id}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.title}`);
        }
      }

      const order = await tx.order.create({
        data: {
          total,
          phone,
          address,
          message,
          notes,
          items: {
            create: items.map((item) => ({
              productId: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
  }
}
