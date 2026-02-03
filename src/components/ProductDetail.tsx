import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../data/products';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import LandingMenu from './LandingMenu';

type ProductDetailProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
  stockById: Record<string, number>;
};

export default function ProductDetail({
  products,
  onAddToCart,
  stockById,
}: ProductDetailProps) {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isZoomClosing, setIsZoomClosing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    return [product.image];
  }, [product]);

  const activeImage = gallery[activeImageIndex] ?? product?.image;

  useEffect(() => {
    let timer: number | undefined;
    if (isZoomClosing) {
      timer = window.setTimeout(() => {
        setIsZoomClosing(false);
        setIsZoomOpen(false);
      }, 200);
    }
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [isZoomClosing]);

  function openZoom() {
    setIsZoomOpen(true);
  }

  function closeZoom() {
    setIsZoomClosing(true);
  }

  function goPrev() {
    setIsImageTransitioning(true);
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  }

  function goNext() {
    setIsImageTransitioning(true);
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const currentX = event.touches[0]?.clientX ?? 0;
    touchDeltaX.current = currentX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    const delta = touchDeltaX.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        goPrev();
      } else {
        goNext();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  if (!product) {
    return (
      <div className="catalog-root min-h-screen bg-white text-[#181114]">
        <LandingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <LandingHeader onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="px-4 md:px-10 lg:px-20 py-12">
          <h2 className="text-2xl font-bold text-[#181114]">Producto no encontrado</h2>
          <p className="text-[#886372] mt-2">El producto que buscas no existe.</p>
          <Link
            className="inline-flex mt-6 rounded-full border-2 border-[#ea3e86] px-5 py-2 font-semibold text-[#ea3e86] transition hover:bg-[#ea3e86] hover:text-white"
            to="/productos"
          >
            Volver a la tienda
          </Link>
        </main>
        <LandingFooter />
      </div>
    );
  }

  const stock = stockById[product.id] ?? 0;
  const isOutOfStock = stock <= 0;
  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="catalog-root min-h-screen bg-white text-[#181114]">
      <LandingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <LandingHeader onOpenMenu={() => setIsMenuOpen(true)} />

      <main className="bg-white py-12 px-4 md:px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto" id="coleccion">
          <nav className="flex items-center gap-2 text-sm text-[#886372] mb-8">
            <Link className="hover:text-[#ea3e86] transition-colors" to="/productos">
              Shop
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#ea3e86] font-semibold">
              {product.categoryName || 'Productos'}
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#ea3e86] font-semibold">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex flex-col gap-6 items-center lg:items-start">
              <button
                type="button"
                onClick={openZoom}
                className="mx-auto w-full aspect-square rounded-2xl border border-[#ea3e86]/10 overflow-hidden shadow-sm bg-white max-w-[420px]"
              >
                <img
                  src={activeImage}
                  alt={product.title}
                  className={`h-full w-full object-cover${isImageTransitioning ? ' opacity-90' : ''}`}
                  onLoad={() => setIsImageTransitioning(false)}
                  onError={(event) => {
                    event.currentTarget.src = '/img/Logo/Logo.png';
                    setIsImageTransitioning(false);
                  }}
                />
              </button>
              <div
                className="grid grid-cols-4 gap-4 w-full max-w-[420px] mx-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {gallery.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => {
                      if (index !== activeImageIndex) {
                        setIsImageTransitioning(true);
                      }
                      setActiveImageIndex(index);
                    }}
                    className={
                      index === activeImageIndex
                        ? 'aspect-square rounded-xl border-2 border-[#ea3e86] bg-center bg-cover'
                        : 'aspect-square rounded-xl border border-[#ea3e86]/10 bg-center bg-cover hover:border-[#ea3e86]/50 transition-colors'
                    }
                    style={{ backgroundImage: `url(${src})` }}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-start lg:pt-2">
              <h1 className="text-4xl md:text-5xl font-black text-[#181114] leading-tight tracking-tight mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-[#ea3e86]">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                <div className="flex items-center gap-1 text-[#ea3e86]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={`star-${index}`} className="material-symbols-outlined fill-1">
                      star
                    </span>
                  ))}
                  <span className="text-sm text-[#886372] ml-1 font-medium">(48 reviews)</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[#ea3e86] mb-3">
                  The Artisan Story
                </h3>
                <p className="text-[#886372] text-lg leading-relaxed italic">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    className={
                      isOutOfStock
                        ? 'flex-1 flex items-center justify-center gap-3 bg-[#f4f0f2] text-[#886372] h-12 rounded-full font-bold text-lg cursor-not-allowed'
                        : 'flex-1 flex items-center justify-center gap-3 bg-[#ea3e86] text-white h-12 rounded-full font-bold text-lg shadow-lg shadow-[#ea3e86]/20 hover:bg-[#ea3e86]/90 hover:-translate-y-0.5 transition-all'
                    }
                    type="button"
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                  >
                    <span className="material-symbols-outlined">shopping_basket</span>
                    {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                  <Link
                    className="rounded-full border-2 border-[#ea3e86] px-5 py-2 font-semibold text-[#ea3e86] transition hover:bg-[#ea3e86] hover:text-white"
                    to="/productos"
                  >
                    Volver
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-[#886372]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ea3e86]">local_shipping</span>
                    <span>Envio gratis desde $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ea3e86]">verified_user</span>
                    <span>Edicion limitada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ea3e86]">inventory_2</span>
                    <span>{isOutOfStock ? 'Agotado' : `Stock: ${stock}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="nosotros" className="bg-[#ea3e86]/5 py-16 px-4 md:px-10 lg:px-20">
        <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold text-[#181114] mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ea3e86]">info</span>
              Product Details
            </h2>
            <ul className="space-y-4 text-[#886372] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-[#ea3e86] mt-2 shrink-0" />
                <span>Material: {product.material || 'Material artesanal'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-[#ea3e86] mt-2 shrink-0" />
                <span>Tamano: {product.size || 'Personalizado'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-[#ea3e86] mt-2 shrink-0" />
                <span>Color: {product.color || 'Unico'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-[#ea3e86] mt-2 shrink-0" />
                <span>Categoria: {product.categoryName || 'General'}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#181114] mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ea3e86]">favorite</span>
              Artisan Care
            </h2>
            <div className="bg-white/70 p-6 rounded-2xl border border-[#ea3e86]/10">
              <p className="text-[#886372] leading-relaxed mb-4">
                Para cuidar tus piezas artesanales, recomendamos limpieza suave y evitar altas temperaturas.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 text-center bg-white rounded-xl">
                  <span className="material-symbols-outlined text-[#ea3e86] mb-2">pan_tool_alt</span>
                  <span className="text-xs font-bold uppercase">Lavado a mano</span>
                </div>
                <div className="flex flex-col items-center p-3 text-center bg-white rounded-xl opacity-70">
                  <span className="material-symbols-outlined text-[#ea3e86] mb-2">microwave_gen</span>
                  <span className="text-xs font-bold uppercase">No microondas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-4 md:px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-[#181114]">Customers Also Loved</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2 rounded-full border border-[#ea3e86]/20 text-[#886372] hover:bg-[#ea3e86]/10 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="p-2 rounded-full border border-[#ea3e86]/20 text-[#ea3e86] hover:bg-[#ea3e86]/10 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/producto/${item.id}`} className="group">
                <div className="w-full aspect-square rounded-xl border border-[#ea3e86]/10 overflow-hidden mb-4 relative">
                  <img
                    src={item.image || item.images?.[0] || '/img/Logo/Logo.png'}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/img/Logo/Logo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-[#ea3e86]/0 group-hover:bg-[#ea3e86]/5 transition-colors" />
                </div>
                <h3 className="text-[#181114] font-bold mb-1">{item.title}</h3>
                <p className="text-[#ea3e86] font-bold">
                  ${item.price.toLocaleString('es-AR')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />

      {(isZoomOpen || isZoomClosing) && (
        <div
          className={`producto-zoom-overlay${isZoomClosing ? ' cerrando' : ' abierto'}`}
          role="dialog"
          aria-modal="true"
          onClick={closeZoom}
        >
          <img
            className="producto-zoom-imagen"
            src={activeImage}
            alt={product.title}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            className="producto-zoom-cerrar"
            type="button"
            onClick={closeZoom}
            aria-label="Cerrar imagen"
          >
            <i className="bi bi-x" />
          </button>
        </div>
      )}
    </div>
  );
}
