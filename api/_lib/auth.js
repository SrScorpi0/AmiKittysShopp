import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

export function signAdminToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAdmin(req) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
}
