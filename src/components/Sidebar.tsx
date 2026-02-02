import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { Category } from '../data/products';

type SidebarProps = {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  cartCount: number;
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  sortBy: 'recent' | 'price-asc' | 'price-desc';
  onSortByChange: (value: 'recent' | 'price-asc' | 'price-desc') => void;
};

export default function Sidebar({
  categories,
  activeCategoryId,
  onSelectCategory,
  cartCount,
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortByChange,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {isOpen && <div className="menu-overlay" onClick={onClose} />}
      <aside className={isOpen ? 'aside-visible' : ''}>
        <button className="close-menu" id="close-menu" type="button" onClick={onClose}>
          <i className="bi bi-x" />
        </button>
        <header>
          <img className="logo" src="/img/Logo/Logo.png" alt="AmiKittyShop" />
        </header>
        <nav>
          <ul className="menu">
            {categories.map((category) => {
              const isActive = activeCategoryId === category.id;
              const iconClass =
                category.id === 'todos' ? 'bi bi-hand-index-thumb-fill' : 'bi bi-hand-index-thumb';
              const buttonClass = `boton-menu boton-categoria${isActive ? ' active' : ''}`;

              if (isAdmin) {
                const adminMap: Record<string, { label: string; tab: string }> = {
                  ceramicas: { label: 'Categorias', tab: 'categories' },
                  toallones: { label: 'Precio y Stock', tab: 'pricing' },
                  repasadores: { label: 'Productos', tab: 'products' },
                };
                const adminConfig = adminMap[category.id];
                if (!adminConfig) return null;
                return (
                  <li key={category.id}>
                    <NavLink
                      className={({ isActive: linkIsActive }) =>
                        `boton-menu boton-categoria${linkIsActive ? ' active' : ''}`
                      }
                      to={`/admin/stock?tab=${adminConfig.tab}`}
                      onClick={onClose}
                    >
                      <i className={iconClass} />
                      {adminConfig.label}
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={category.id}>
                  <button
                    id={category.id}
                    className={buttonClass}
                    type="button"
                    onClick={() => {
                      onSelectCategory(category.id);
                      navigate('/productos');
                      onClose();
                    }}
                  >
                    <i className={iconClass} />
                    {category.label}
                  </button>
                </li>
              );
            })}
            <li>
              {isAdmin ? (
                <NavLink
                  className={({ isActive: linkIsActive }) =>
                    `boton-menu boton-carrito${linkIsActive ? ' active' : ''}`
                  }
                  to="/admin/stock?tab=orders"
                  onClick={onClose}
                >
                  <i className="bi bi-receipt-cutoff" />
                  Pedidos
                </NavLink>
              ) : (
                <NavLink
                  className={({ isActive: linkIsActive }) =>
                    `boton-menu boton-carrito${linkIsActive ? ' active' : ''}`
                  }
                  to="/carrito"
                  onClick={onClose}
                >
                  <i className="bi bi-cart-fill" />
                  Carrito <span id="numerito" className="numerito">{cartCount}</span>
                </NavLink>
              )}
            </li>
            <li>
              <NavLink
                className={({ isActive: linkIsActive }) =>
                  `boton-menu boton-home${linkIsActive ? ' active' : ''}`
                }
                to="/"
                onClick={onClose}
              >
                <i className="bi bi-house-door-fill" />
                Landing
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="filtros-mobile">
          <h4>Filtros</h4>
          <label>
            Buscar
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Buscar productos"
            />
          </label>
          <label>
            Precio min
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
            />
          </label>
          <label>
            Precio max
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
            />
          </label>
          <label>
            Ordenar
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SidebarProps['sortBy'])}
            >
              <option value="recent">Recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </label>
        </div>
        <footer>
          <p className="texto-footer">© 2025 Axel Rion</p>
        </footer>
      </aside>
    </>
  );
}
