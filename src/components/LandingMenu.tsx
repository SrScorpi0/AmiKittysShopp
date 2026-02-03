import { Link } from 'react-router-dom';

type LandingMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LandingMenu({ isOpen, onClose }: LandingMenuProps) {
  return (
    <>
      {isOpen && <div className="menu-overlay" onClick={onClose} />}
      <aside className={`landing-menu${isOpen ? ' landing-menu-visible' : ''}`}>
        <button
          className="close-menu"
          type="button"
          aria-label="Cerrar menu"
          onClick={onClose}
        >
          <i className="bi bi-x" />
        </button>
        <nav className="landing-menu-links">
          <Link to="/" className="landing-menu-link" onClick={onClose}>
            Home
          </Link>
          <Link to="/productos" className="landing-menu-link" onClick={onClose}>
            Productos
          </Link>
          <a href="#nosotros" className="landing-menu-link" onClick={onClose}>
            Nosotros
          </a>
          <a href="#contacto" className="landing-menu-link" onClick={onClose}>
            Contacto
          </a>
        </nav>
      </aside>
    </>
  );
}
