import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CartItem } from '../data/products';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import LandingMenu from './LandingMenu';

type CheckoutShippingProps = {
  items: CartItem[];
};

export default function CheckoutShipping({ items }: CheckoutShippingProps) {
  const navigate = useNavigate();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState({
    fullName: false,
    address: false,
    city: false,
    postalCode: false,
    phone: false,
    email: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('kittyshop-checkout');
    if (stored) {
      try {
        const data = JSON.parse(stored) as {
          fullName?: string;
          address?: string;
          city?: string;
          postalCode?: string;
          phone?: string;
          email?: string;
          message?: string;
        };
        setFullName(data.fullName || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setPostalCode(data.postalCode || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setMessage(data.message || '');
      } catch {
        // ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'kittyshop-checkout',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        phone,
        email,
        message,
      }),
    );
  }, [fullName, address, city, postalCode, phone, email, message]);

  const fullNameError = useMemo(() => {
    if (!touched.fullName) return '';
    if (!fullName.trim()) return 'El nombre es obligatorio';
    return '';
  }, [fullName, touched.fullName]);

  const addressError = useMemo(() => {
    if (!touched.address) return '';
    if (!address.trim()) return 'La direccion es obligatoria';
    return '';
  }, [address, touched.address]);

  const cityError = useMemo(() => {
    if (!touched.city) return '';
    if (!city.trim()) return 'La ciudad es obligatoria';
    return '';
  }, [city, touched.city]);

  const postalError = useMemo(() => {
    if (!touched.postalCode) return '';
    if (!postalCode.trim()) return 'El codigo postal es obligatorio';
    return '';
  }, [postalCode, touched.postalCode]);

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

  const canContinue =
    items.length > 0 &&
    !fullNameError &&
    !addressError &&
    !cityError &&
    !postalError &&
    !phoneError &&
    !emailError &&
    fullName.trim() &&
    address.trim() &&
    city.trim() &&
    postalCode.trim() &&
    phone.trim() &&
    email.trim();

  function handleContinue() {
    setTouched({
      fullName: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      email: true,
    });
    if (!canContinue) return;
    navigate('/carrito/pago');
  }

  return (
    <div className="cart-root min-h-screen bg-[#fffafa] text-[#181114]">
      <LandingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <LandingHeader onOpenMenu={() => setIsMenuOpen(true)} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto py-12 px-6">
        <div className="w-full max-w-[800px] mx-auto mb-12">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#ef3985] font-bold text-sm tracking-wide uppercase">Paso 2: Envio</p>
            <p className="text-[#ef3985]/70 font-medium text-sm">66%</p>
          </div>
          <div className="relative h-2 w-full bg-[#fce7f0] rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-[#ef3985] rounded-full transition-all duration-500"
              style={{ width: '66%' }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: '66%' }}>
              <div className="bg-white border-2 border-[#ef3985] p-1.5 rounded-full shadow-md">
                <span className="material-symbols-outlined text-[#ef3985] text-[18px] block leading-none">
                  pets
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#ef3985]/10">
              <h1 className="text-[#181114] text-2xl font-bold mb-8">Datos de Entrega</h1>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Nombre Completo</span>
                    <input
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 text-base"
                      placeholder="Cosme Fulanito"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                    />
                    {fullNameError && <span className="text-red-500 text-xs">{fullNameError}</span>}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Direccion de Envio</span>
                    <div className="relative">
                      <input
                        className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 pl-12 text-base"
                        placeholder="Calle Falsa 123"
                        type="text"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#ef3985]/50">
                        location_on
                      </span>
                    </div>
                    {addressError && <span className="text-red-500 text-xs">{addressError}</span>}
                  </label>
                </div>
                <div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Ciudad</span>
                    <input
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 text-base"
                      placeholder="Rosario"
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                    />
                    {cityError && <span className="text-red-500 text-xs">{cityError}</span>}
                  </label>
                </div>
                <div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Codigo Postal</span>
                    <input
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 text-base"
                      placeholder="00000"
                      type="text"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, postalCode: true }))}
                    />
                    {postalError && <span className="text-red-500 text-xs">{postalError}</span>}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Telefono</span>
                    <input
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 text-base"
                      placeholder="341 123 4567"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    />
                    {phoneError && <span className="text-red-500 text-xs">{phoneError}</span>}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Email</span>
                    <input
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 h-14 px-5 text-base"
                      placeholder="cosmefulanito@gmail.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    />
                    {emailError && <span className="text-red-500 text-xs">{emailError}</span>}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#181114] text-sm font-semibold ml-1">Mensaje</span>
                    <textarea
                      className="form-input w-full rounded-2xl border-[#e6dbe0] text-[#181114] focus:ring-0 px-5 py-4 text-base"
                      rows={3}
                      placeholder="Algo que quieras agregar"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </label>
                </div>
              </form>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
              <Link
                to="/carrito"
                className="text-[#ef3985] font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform duration-200"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                Volver al Carrito
              </Link>
              <button
                className="w-full md:w-auto bg-[#ef3985] hover:bg-[#ef3985]/90 text-white font-bold py-5 px-12 rounded-full shadow-lg shadow-[#ef3985]/20 transition-all flex items-center justify-center gap-3 group"
                type="button"
                onClick={handleContinue}
              >
                Continuar al Pago
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="bg-[#fceef4] rounded-[2rem] p-8 border border-[#ef3985]/10">
              <h3 className="text-[#181114] text-lg font-bold mb-6">Resumen de Compra</h3>
              <div className="space-y-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="size-20 rounded-2xl bg-white overflow-hidden border border-[#ef3985]/10 shadow-sm flex-shrink-0">
                      <img
                        alt={item.title}
                        className="w-full h-full object-cover"
                        src={item.image || item.images?.[0] || '/img/Logo/Logo.png'}
                        onError={(event) => {
                          event.currentTarget.src = '/img/Logo/Logo.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#181114] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#896172] mt-1">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-6 border-t border-[#ef3985]/10 mt-6">
                <div className="flex justify-between text-[#896172]">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-[#896172]">
                  <span>Envio</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#ef3985]/10">
                  <span className="text-[#181114] font-bold text-lg">Total</span>
                  <span className="text-[#ef3985] font-bold text-2xl tracking-tight">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
              <div className="mt-8 bg-white/40 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ef3985]">verified_user</span>
                <p className="text-xs text-[#896172] leading-relaxed">
                  Compra protegida y segura. Tu informacion esta cifrada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
