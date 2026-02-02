import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../data/products';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

type CartProps = {
  items: CartItem[];
  hasPurchased: boolean;
  onRemoveItem: (productId: string) => void;
  onClear: () => void;
  onPurchase: () => void;
};

export default function Cart({
  items,
  hasPurchased,
  onRemoveItem,
  onClear,
  onPurchase,
}: CartProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isEmpty = items.length === 0 && !hasPurchased;
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState<{ phone: boolean; address: boolean; email: boolean }>(
    {
      phone: false,
      address: false,
      email: false,
    },
  );

  const phoneError = useMemo(() => {
    if (!touched.phone) return '';
    if (!phone.trim()) return 'El telefono es obligatorio';
    if (phone.replace(/\D/g, '').length < 6) return 'Telefono invalido';
    return '';
  }, [phone, touched.phone]);

  const emailError = useMemo(() => {
    if (!touched.email) return '';
    if (!email.trim()) return 'El email es obligatorio';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return ok ? '' : 'Email invalido';
  }, [email, touched.email]);

  const addressError = useMemo(() => {
    if (!touched.address) return '';
    if (!address.trim()) return 'La direccion es obligatoria';
    return '';
  }, [address, touched.address]);

  const canSubmit =
    items.length > 0 &&
    !phoneError &&
    !emailError &&
    !addressError &&
    phone.trim() &&
    email.trim() &&
    address.trim();

  useEffect(() => {
    const stored = localStorage.getItem('kittyshop-checkout');
    if (stored) {
      try {
        const data = JSON.parse(stored) as {
          phone?: string;
          email?: string;
          address?: string;
          message?: string;
        };
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setMessage(data.message || '');
      } catch {
        // ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'kittyshop-checkout',
      JSON.stringify({ phone, email, address, message }),
    );
  }, [phone, email, address, message]);

  async function handleSubmitOrder() {
    if (!canSubmit) {
      setTouched({ phone: true, email: true, address: true });
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          phone,
          email,
          address,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Error al enviar el pedido');
      }

      setStatus('success');
      localStorage.removeItem('kittyshop-checkout');
      setPhone('');
      setEmail('');
      setAddress('');
      setMessage('');
      onPurchase();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar el pedido');
    }
  }

  return (
    <div className="cart-root min-h-screen bg-white text-[#1a1a1a]">
      <LandingHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-10 sm:px-12 md:pl-24 md:pr-16 py-12">
        {isEmpty && (
          <div className="rounded-2xl bg-[#fdf2f7] border border-[#f9e1ed] p-10 text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">Tu carrito esta vacio</h1>
            <p className="text-[#6b7280] mb-6">Explora nuestras piezas favoritas y agrega tus productos.</p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-[#ef3985] font-bold uppercase tracking-widest text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Continuar Comprando
            </Link>
          </div>
        )}

        {hasPurchased && (
          <div className="rounded-2xl bg-[#fdf2f7] border border-[#f9e1ed] p-10 text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">Gracias por tu compra</h1>
            <p className="text-[#6b7280] mb-6">Tu pedido fue enviado correctamente.</p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-[#ef3985] font-bold uppercase tracking-widest text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Seguir Comprando
            </Link>
          </div>
        )}

        {!isEmpty && !hasPurchased && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 bg-[#f4f0f2] border border-[#f9e1ed] rounded-2xl p-8 ml-3 md:ml-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-black tracking-tight">Tu Carrito</h1>
                <span className="text-[#6b7280] font-medium">
                  {items.length} articulos seleccionados
                </span>
              </div>

              <div className="space-y-0">
                {items.map((item) => (
                  <div key={item.id} className="py-8 border-b border-[#f9e1ed]">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={item.image || item.images?.[0] || '/img/Logo/Logo.png'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/img/Logo/Logo.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                            <p className="text-sm text-[#6b7280] leading-relaxed max-w-md">
                              {item.description}
                            </p>
                          </div>
                          <p className="text-xl font-black">
                            ${item.price.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                          <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-white">
                            <span className="w-8 text-center font-bold text-sm">
                              {item.quantity}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs font-bold text-[#6b7280] hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs font-bold text-[#6b7280] hover:text-red-500 uppercase tracking-widest"
                >
                  Vaciar carrito
                </button>
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 text-[#ef3985] font-bold uppercase tracking-widest text-sm"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Continuar Comprando
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 bg-[#fdf2f7] rounded-2xl p-8 border border-[#f9e1ed]">
                <h2 className="text-xl font-black mb-8 uppercase tracking-tight">
                  Resumen de Pedido
                </h2>
                <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6b7280]">Subtotal</span>
                    <span className="font-bold text-[#1a1a1a]">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6b7280]">Gastos de Envio</span>
                    <span className="font-bold text-[#1a1a1a]">$0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6b7280]">Impuestos Estimados</span>
                    <span className="font-bold text-[#1a1a1a]">$0</span>
                  </div>
                  <div className="pt-5 border-t border-[#f9e1ed] flex justify-between items-center">
                    <span className="font-black text-lg uppercase tracking-tight">Total</span>
                    <span className="font-black text-3xl text-[#ef3985]">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Telefono
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      placeholder="Tu telefono"
                      className="rounded-full border border-[#f9e1ed] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef3985]/30"
                    />
                    {phoneError && <span className="text-red-500 text-xs">{phoneError}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      placeholder="Tu email"
                      className="rounded-full border border-[#f9e1ed] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef3985]/30"
                    />
                    {emailError && <span className="text-red-500 text-xs">{emailError}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Direccion
                    <input
                      type="text"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                      placeholder="Tu direccion"
                      className="rounded-full border border-[#f9e1ed] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef3985]/30"
                    />
                    {addressError && <span className="text-red-500 text-xs">{addressError}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Mensaje
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Algo que quieras agregar"
                      className="rounded-2xl border border-[#f9e1ed] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef3985]/30"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={status === 'loading' || !canSubmit}
                    className={
                      status === 'loading' || !canSubmit
                        ? 'w-full bg-[#f9e1ed] text-[#6b7280] font-black py-4 rounded-full transition-all'
                        : 'w-full bg-[#ef3985] hover:bg-[#ef3985]/90 text-white font-black py-4 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#ef3985]/20'
                    }
                  >
                    {status === 'loading' ? 'Enviando...' : 'Continuar al Pago'}
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                  <p className="text-[11px] text-center text-[#ef3985]/70 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">shield_locked</span>
                    Pago 100% Seguro
                  </p>
                  {status === 'error' && (
                    <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                  )}
                  {status === 'success' && (
                    <p className="text-emerald-600 text-sm text-center">
                      Pedido enviado correctamente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
