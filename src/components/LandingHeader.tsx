import { Link } from 'react-router-dom';

type LandingHeaderProps = {
  onOpenMenu?: () => void;
};

export default function LandingHeader({ onOpenMenu }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#ff85a1]/20 bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto pl-4 pr-4 lg:pl-10 lg:pr-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3" aria-label="Ir al inicio">
              <img
                src="/img/Logo/Logo.png"
                alt="AmiKittyShop"
                className="h-20 w-20 rounded-full"
              />
              <h2 className="text-[#800e33] text-xl font-bold tracking-tight">AmiKittyShop</h2>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/productos"
              className="text-[#800e33]/80 hover:text-[#ff85a1] transition-colors text-sm font-semibold"
            >
              Productos
            </Link>
            <a
              href="#nosotros"
              className="text-[#800e33]/80 hover:text-[#ff85a1] transition-colors text-sm font-semibold"
            >
              Nosotros
            </a>
            <a
              href="#coleccion"
              className="text-[#800e33]/80 hover:text-[#ff85a1] transition-colors text-sm font-semibold"
            >
              Principales
            </a>
            <a
              href="#contacto"
              className="text-[#800e33]/80 hover:text-[#ff85a1] transition-colors text-sm font-semibold"
            >
              Contacto
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-[#fff5f7] rounded-xl px-4 py-2 border border-[#ff85a1]/20">
              <i className="bi bi-search text-[#800e33]/60" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-40 placeholder:text-[#800e33]/40 text-[#800e33] ml-2"
                placeholder="Buscar"
              />
            </div>
            <Link
              to="/carrito"
              className="p-2.5 rounded-xl bg-[#fff5f7] text-[#800e33] hover:bg-[#ff85a1]/20 transition-colors"
            >
              <i className="bi bi-bag" />
            </Link>
            <button
              className="md:hidden p-2.5 rounded-xl bg-[#ff85a1] text-white shadow-lg"
              type="button"
              onClick={onOpenMenu}
              aria-label="Abrir menú"
            >
              <i className="bi bi-list" />
            </button>
            <button className="hidden md:inline-flex p-2.5 rounded-xl bg-[#ff85a1] text-white shadow-lg">
              <i className="bi bi-person" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
