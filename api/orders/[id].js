import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';
import { Resend } from 'resend';

const ALLOWED_STATUS = new Set(['pending', 'approved', 'sent', 'cancelled']);
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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

    let emailSent = false;
    let emailError = '';
    const recipients = [process.env.ORDER_TO, updated.email].filter(Boolean);
    if (resend && recipients.length > 0) {
      try {
        const text = [
          `Pedido #${updated.id}`,
          `Estado actualizado: ${updated.status}`,
          '',
          `Total: $${updated.total}`,
          `Telefono: ${updated.phone}`,
          `Direccion: ${updated.address}`,
        ].join('\n');

        const htmlItems = updated.items
          .map((item) => `<li>${item.title} x${item.quantity} - $${item.price}</li>`)
          .join('');

        const html = `
          <h2>Pedido #${updated.id}</h2>
          <p><strong>Estado actualizado:</strong> ${updated.status}</p>
          <p><strong>Total:</strong> $${updated.total}</p>
          <p><strong>Telefono:</strong> ${updated.phone}</p>
          <p><strong>Direccion:</strong> ${updated.address}</p>
          <h3>Productos</h3>
          <ul>${htmlItems}</ul>
        `;

        await resend.emails.send({
          from: process.env.RESEND_FROM || 'AmiKittyShop <onboarding@resend.dev>',
          to: recipients,
          subject: `Estado actualizado - Pedido #${updated.id}`,
          text,
          html,
        });
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'No se pudo enviar el email';
      }
    }

    res.status(200).json({ ...updated, emailSent, emailError });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
