import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      requireAdmin(req);
      const { dateFrom, dateTo, status } = req.query;
      const where = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
        }
      }
      if (status && status !== 'all') {
        where.status = String(status);
      }
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      res.status(200).json(orders);
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { items, total, phone, email, address, message } = await readJson(req);
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'El carrito esta vacio.' });
    return;
  }
  if (!phone || !email || !address) {
    res.status(400).json({ error: 'Faltan telefono, email o direccion.' });
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
          email,
          address,
          message,
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

    let emailSent = false;
    let emailError = '';

    const recipients = [process.env.ORDER_TO, result.email].filter(Boolean);
    if (resend && recipients.length > 0) {
      try {
        const lines = result.items
          .map((item) => `${item.title} x${item.quantity} - $${item.price}`)
          .join('\n');

        const text = [
          `Nuevo pedido #${result.id}`,
          '',
          `Productos:\n${lines}`,
          '',
          `Total: $${result.total}`,
          `Telefono: ${result.phone}`,
          `Direccion: ${result.address}`,
          `Mensaje: ${result.message || '-'}`,
        ].join('\n');

        const htmlItems = result.items
          .map((item) => `<li>${item.title} x${item.quantity} - $${item.price}</li>`)
          .join('');

        const html = `
          <h2>Nuevo pedido #${result.id}</h2>
          <p><strong>Total:</strong> $${result.total}</p>
          <p><strong>Telefono:</strong> ${result.phone}</p>
          <p><strong>Direccion:</strong> ${result.address}</p>
          <p><strong>Mensaje:</strong> ${result.message || '-'}</p>
        <h3>Productos</h3>
        <ul>${htmlItems}</ul>
      `;

        await resend.emails.send({
          from: process.env.RESEND_FROM || 'AmiKittyShop <onboarding@resend.dev>',
          to: recipients,
          subject: `Nuevo pedido - AmiKittyShop #${result.id}`,
          text,
          html,
        });
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'No se pudo enviar el email';
      }
    }

    res.status(201).json({ ...result, emailSent, emailError });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
  }
}
