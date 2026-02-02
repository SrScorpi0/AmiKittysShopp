import bcrypt from 'bcryptjs';
import { prisma } from '../_lib/prisma.js';
import { readJson } from '../_lib/body.js';
import { signAdminToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password } = await readJson(req);
  if (!email || !password) {
    res.status(400).json({ error: 'Email y password son obligatorios' });
    return;
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Credenciales invalidas' });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Credenciales invalidas' });
    return;
  }

  const token = signAdminToken({ sub: user.id, email: user.email });
  res.status(200).json({ token, user: { id: user.id, email: user.email } });
}
