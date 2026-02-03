import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { products as fallbackProducts, type Product } from '../data/products';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import LandingMenu from './LandingMenu';

export default function Home() {
  const images = useMemo(
    () => [
      '/img/Ceramicas/ceramica-01.jpg',
      '/img/Toallas/Toallon-01.jpg',
      '/img/Repasadores/repasador-01 .jpg',
    ],
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() =>
    fallbackProducts.slice(0, 4),
  );

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('No se pudo cargar el catalogo');
        const data = (await response.json()) as Product[];
        if (!isMounted) return;
        setFeaturedProducts(data.slice(0, 4));
      } catch {
        if (!isMounted) return;
        setFeaturedProducts(fallbackProducts.slice(0, 4));
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="landing-root w-full bg-white text-[#800e33]">
      <LandingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <LandingHeader onOpenMenu={() => setIsMenuOpen(true)} />

      <main>
        <section className="bg-white py--12 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="w-full lg:w-1/2">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-4 ring-[#ff85a1]/10 bg-white">
                  <div
                    className="flex h-full w-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {images.map((src, index) => (
                      <div key={`${src}-${index}`} className="h-full w-full flex-shrink-0">
                        <img src={src} alt={`Producto ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-[#ff85a1] shadow hover:bg-white"
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-[#ff85a1] shadow hover:bg-white"
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        index === activeIndex ? 'bg-[#ff85a1]' : 'bg-[#ffccd5]'
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-8 lg:w-1/2">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[#800e33] text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight">
                    Cosillas bellas de <span className="text-[#ff85a1] italic">Hello Kitty</span>
                  </h1>
                  <p className="text-[#800e33]/70 text-lg leading-relaxed max-w-md">
                    Descubre nuestra colección de cerámicas, toallones y detalles únicos.
                  </p>
                </div>
                <div className="flex flex-row flex-wrap gap-3">
                  <Link
                    to="/productos"
                    className="bg-[#ff85a1] text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-[#ff85a1]/30 transition-all flex items-center justify-center gap-2"
                  >
                    Ver nuestros productos
                    <i className="bi bi-arrow-right" />
                  </Link>
                  <a
                    href="#nosotros"
                    className="border-2 border-[#ff85a1]/30 text-[#800e33] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#ff85a1]/5 transition-colors"
                  >
                    Contacto
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="coleccion" className="bg-[#fff5f7] py-20 border-y border-[#ff85a1]/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-20">
            <div className="flex items-center justify-between pb-10">
              <h2 className="text-[#800e33] text-3xl font-bold tracking-tight">Nuestros mejorcitos</h2>
              <Link
                to="/productos"
                className="text-[#ff85a1] font-bold text-sm flex items-center gap-1 hover:underline"
              >
                Ver todos <i className="bi bi-box-arrow-up-right" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const image = product.image || product.images?.[0] || '/img/Logo/Logo.png';
                return (
                  <Link
                    key={product.id}
                    to={`/producto/${product.id}`}
                    className="flex flex-col gap-4 group"
                  >
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500 ring-1 ring-[#ff85a1]/10">
                      <img
                        src={image}
                        alt={product.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = '/img/Logo/Logo.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-[#ff85a1]/0 group-hover:bg-[#ff85a1]/10 transition-colors" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[#800e33] text-lg font-bold">{product.title}</h3>
                        <span className="text-[#ff85a1] font-bold">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="text-[#800e33]/50 text-sm font-medium">
                        {product.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="nosotros" className="bg-white py-12 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-20">
            <div className="bg-[#fff5f7] rounded-[2.5rem] p-8 lg:p-16 border border-[#ff85a1]/10 flex flex-col lg:flex-row gap-0 lg:gap-16 items-start">
              <div className="lg:w-1/2 flex flex-col gap-6">
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#800e33]">
                  Contactanos
                </h2>
                <p className="text-[#800e33]/70 text-lg leading-relaxed">
                  ¿Tienes alguna idea que quieras compartirnos?  
                  ¿O alguna duda? ¡Mandanos un mensaje!
                </p>
                <div className="flex flex-col gap-5 pt-4">
                  {/*
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#ff85a1] shadow-sm border border-[#ff85a1]/10">
                      <i className="bi bi-stars" />
                    </div>
                    <span className="font-bold text-sm text-[#800e33]/80">Asesoramiento personalizado</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#ff85a1] shadow-sm border border-[#ff85a1]/10">
                      <i className="bi bi-brush" />
                    </div>
                    <span className="font-bold text-sm text-[#800e33]/80">Materiales premium</span>
                  </div>
                  */}
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <form className="space-y-6 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#800e33]/50">
                        Nombre
                      </label>
                      <input
                        className="w-full bg-white border border-[#ff85a1]/10 rounded-xl p-4 focus:ring-2 focus:ring-[#ff85a1]/20 focus:border-[#ff85a1]/30 text-[#800e33] outline-none transition-all"
                        placeholder="Pedrito Pérez"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#800e33]/50">
                        Email
                      </label>
                      <input
                        className="w-full bg-white border border-[#ff85a1]/10 rounded-xl p-4 focus:ring-2 focus:ring-[#ff85a1]/20 focus:border-[#ff85a1]/30 text-[#800e33] outline-none transition-all"
                        placeholder="pedritoperez@gmail.com"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#800e33]/50">
                      Comentario
                    </label>
                    <textarea
                      className="w-full bg-white border border-[#ff85a1]/10 rounded-xl p-4 focus:ring-2 focus:ring-[#ff85a1]/20 text-[#800e33] outline-none transition-all"
                      placeholder="Dejanos tu mensaje por aqui..."
                      rows={4}
                    />
                  </div>
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      className="bg-[#ff85a1] text-white font-bold px-10 py-4 rounded-xl text-lg hover:shadow-xl hover:shadow-[#ff85a1]/30 transition-all active:scale-[0.98]"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </main>
    </div>
  );
}
