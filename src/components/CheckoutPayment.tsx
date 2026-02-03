import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { CartItem } from '../data/products';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import LandingMenu from './LandingMenu';

type CheckoutPaymentProps = {
  items: CartItem[];
  onPurchase: () => void;
};

export default function CheckoutPayment({ items, onPurchase }: CheckoutPaymentProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutData, setCheckoutData] = useState<{
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
    message: string;
  }>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('kittyshop-checkout');
    if (stored) {
      try {
        const data = JSON.parse(stored) as Partial<typeof checkoutData>;
        setCheckoutData((prev) => ({
          ...prev,
          ...data,
        }));
      } catch {
        // ignore invalid data
      }
    }
  }, []);

  const canSubmit = useMemo(() => {
    if (!items.length) return false;
    if (!checkoutData.phone.trim()) return false;
    if (!checkoutData.email.trim()) return false;
    if (!checkoutData.address.trim()) return false;
    if (!checkoutData.city.trim()) return false;
    if (!checkoutData.postalCode.trim()) return false;
    return true;
  }, [checkoutData, items.length]);

  async function handleConfirmPurchase() {
    if (!canSubmit) {
      setStatus('error');
      setErrorMessage('Completa los datos de envio antes de confirmar la compra.');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      const addressLine = `${checkoutData.address}, ${checkoutData.city}, CP ${checkoutData.postalCode}`;
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          phone: checkoutData.phone,
          email: checkoutData.email,
          address: addressLine,
          message: checkoutData.message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Error al enviar el pedido');
      }

      setStatus('success');
      localStorage.removeItem('kittyshop-checkout');
      onPurchase();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar el pedido');
    }
  }

  return (
    <div className="cart-root min-h-screen bg-[#fffafa] text-[#181114]">
      <LandingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <LandingHeader onOpenMenu={() => setIsMenuOpen(true)} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto py-12 px-6">
        <div className="w-full max-w-[800px] mx-auto mb-12">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#ef3985] font-bold text-sm tracking-wide uppercase">Paso 3: Pago</p>
            <p className="text-[#ef3985]/70 font-medium text-sm">100%</p>
          </div>
          <div className="relative h-2 w-full bg-[#fce7f0] rounded-full">
            <div className="absolute top-0 left-0 h-full bg-[#ef3985] rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#ef3985]/10">
              <h1 className="text-[#181114] text-2xl font-bold mb-6">Datos de Pago</h1>
              <div className="space-y-4 text-[#6b7280]">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#181114]">Banco</span>
                  <span>MercadoPago</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#181114]">Titular</span>
                  <span>Azul Rion</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#181114]">CBU</span>
                  <span>25555544449</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#181114]">CUIT</span>
                  <span>20-12345678-9</span>
                </div>
              </div>
              <div className="mt-8 rounded-2xl border border-[#ef3985]/10 bg-[#fdf2f7] p-5 text-sm text-[#6b7280] leading-relaxed">
                Una vez realizado el pago, envia el comprobante a
                <span className="font-semibold text-[#ef3985]"> axelrion168@gmail.com</span> junto
                al numero de orden para poder identificar el pago con el pedido.
              </div>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={status === 'loading' || !canSubmit}
                  className={
                    status === 'loading' || !canSubmit
                      ? 'w-full bg-[#f9e1ed] text-[#6b7280] font-black py-4 rounded-full transition-all'
                      : 'w-full bg-[#ef3985] hover:bg-[#ef3985]/90 text-white font-black py-4 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#ef3985]/20'
                  }
                >
                  {status === 'loading' ? 'Enviando...' : 'Confirmar compra'}
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </button>
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
            <div className="flex items-center gap-4">
              <Link
                to="/carrito/envio"
                className="text-[#ef3985] font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform duration-200"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                Volver a Envio
              </Link>
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
