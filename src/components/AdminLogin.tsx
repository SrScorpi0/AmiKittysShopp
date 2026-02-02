import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_TOKEN_KEY = 'kittyshop-admin-token';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      navigate('/admin/stock?tab=categories', { replace: true });
    }
  }, [navigate]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Error al iniciar sesion');
      }
      const data = await response.json();
      const token = data?.token || '';
      if (!token) {
        throw new Error('Token invalido');
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      navigate('/admin/stock?tab=categories', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h2 className="titulo-principal">Administrar stock</h2>
      <section className="admin-login">
        <h3>Ingresar al panel</h3>
        <form onSubmit={handleLogin} className="admin-login-form">
          <label>
            Email
            <input
              className="stock-admin-text"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </label>
          <label>
            Contrasena
            <input
              className="stock-admin-text"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="stock-admin-add" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
