import type { Category, Product } from '../data/products';
import { Link } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

type MainProps = {
  products: Product[];
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onAddToCart: (product: Product) => void;
  stockById: Record<string, number>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  sortBy: 'recent' | 'price-asc' | 'price-desc';
  onSortByChange: (value: 'recent' | 'price-asc' | 'price-desc') => void;
};

export default function Main({
  products,
  categories,
  activeCategoryId,
  onSelectCategory,
  onAddToCart,
  stockById,
  searchQuery,
  onSearchQueryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortByChange,
}: MainProps) {
  const filteredProducts = products;

  return (
    <div className="catalog-root min-h-screen bg-[#f8f6f7] text-[#181114]">
      <LandingHeader />

      <main>
        <section id="coleccion" className="bg-[#ea3e86]/10 py-12 md:py-20 px-4 md:px-10 lg:px-20">
          <div className="max-w-[960px] mx-auto text-center">
            <h1 className="text-[#ea3e86] text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-4">
              De AmiKitty para el mundo
            </h1>
            <p className="text-[#886372] text-base md:text-lg font-medium max-w-xl mx-auto">
              Descubre piezas limitadas hechas con amor.
            </p>
          </div>
        </section>

        <section className="bg-white py-8 border-b border-[#ea3e86]/5 px-4 md:px-10 lg:px-20">
          <div className="max-w-[960px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-3 flex-wrap">
                {categories.map((category) => {
                  const isActive = category.id === activeCategoryId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onSelectCategory(category.id)}
                      className={
                        isActive
                          ? 'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#ea3e86] text-white px-6 font-semibold shadow-md shadow-[#ea3e86]/20 transition-transform active:scale-95'
                          : 'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white border border-[#ea3e86]/20 text-[#181114] px-6 font-medium hover:border-[#ea3e86] transition-colors'
                      }
                    >
                      {category.id === 'todos' ? 'Todos' : category.label}
                    </button>
                  );
                })}
              </div>
              <div className="text-sm font-medium text-[#886372]">
                Mostrando {filteredProducts.length} productos
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-[#181114]">Buscar</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  placeholder="Buscar productos"
                  className="rounded-full border border-[#ea3e86]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ea3e86]/20"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#181114]">Precio min</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => onMinPriceChange(event.target.value)}
                  placeholder="0"
                  className="rounded-full border border-[#ea3e86]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ea3e86]/20"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#181114]">Precio max</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => onMaxPriceChange(event.target.value)}
                  placeholder="10000"
                  className="rounded-full border border-[#ea3e86]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ea3e86]/20"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-[#181114]">Ordenar</span>
                <select
                  value={sortBy}
                  onChange={(event) => onSortByChange(event.target.value as MainProps['sortBy'])}
                  className="rounded-full border border-[#ea3e86]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ea3e86]/20"
                >
                  <option value="recent">Recientes</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 px-4 md:px-10 lg:px-20">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const stock = stockById[product.id] ?? 0;
              const isOutOfStock = stock <= 0;
              const image = product.image || product.images?.[0] || '/img/Logo/Logo.png';

              return (
                <div key={product.id} className="flex flex-col gap-4 group">
                  <Link
                    to={`/producto/${product.id}`}
                    className="w-full aspect-square rounded-xl border border-[#ea3e86]/10 overflow-hidden relative"
                  >
                    <img
                      src={image}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = '/img/Logo/Logo.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-[#ea3e86]/0 group-hover:bg-[#ea3e86]/5 transition-colors" />
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 rounded-full bg-[#181114] text-white text-xs font-semibold px-3 py-1">
                        Agotado
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between items-start">
                      <Link to={`/producto/${product.id}`} className="text-[#181114] text-lg font-bold">
                        {product.title}
                      </Link>
                      <span className="text-[#ea3e86] font-bold text-lg">
                        ${product.price.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <p className="text-[#886372] text-sm font-normal mb-3">
                      {product.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      disabled={isOutOfStock}
                      className={
                        isOutOfStock
                          ? 'w-full flex items-center justify-center gap-2 rounded-full h-11 bg-[#f4f0f2] text-[#886372] text-sm font-bold cursor-not-allowed'
                          : 'w-full flex items-center justify-center gap-2 rounded-full h-11 bg-[#ea3e86] text-white text-sm font-bold shadow-lg shadow-[#ea3e86]/20 hover:bg-[#ea3e86]/90 transition-all'
                      }
                    >
                      <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                      {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-[#886372] mt-6">
              No hay productos que coincidan con la busqueda.
            </p>
          )}
        </section>
        {/*
        <section id="nosotros" className="bg-[#ea3e86]/10 py-16 px-4 md:px-10 lg:px-20">
          <div className="max-w-[960px] mx-auto">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-[#181114] text-3xl font-bold mb-2">Featured Artisans</h2>
              <div className="h-1 w-20 bg-[#ea3e86] rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl flex items-center gap-6 border border-[#ea3e86]/5 shadow-sm">
                <div
                  className="size-24 rounded-full bg-center bg-no-repeat bg-cover border-2 border-[#ea3e86]"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6RElQHbpK2BP0uh7yP0h_NvlD0STnqlD0Q4SvRK5x6lvtwe9_Pw0PnoW8ZJyHkBjar8AxRihQOIK1ocQwvDtKPwesC5cOFz9alp40bO4C5e7nlz2FynN4v_U3yct6WnnXyKE-oKQTYtQSS8vNCrd1dbyoXyfVx3-lUUW4mOyX1y4B2tlXvlbt9QlEVaC9pzFjekNR2-ry4CBVwVcL-0qN68CjKzzmaGP568le7gOEtk2_9kqbieh28oIP9ncmbIliwyHq39svVPX")',
                  }}
                />
                <div>
                  <h4 className="text-[#181114] font-bold text-lg">Hana Kimura</h4>
                  <p className="text-[#ea3e86] font-medium text-sm mb-2">Master Ceramicist</p>
                  <p className="text-[#886372] text-sm leading-relaxed">
                    Especialista en tecnicas tradicionales con un toque kawaii.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl flex items-center gap-6 border border-[#ea3e86]/5 shadow-sm">
                <div
                  className="size-24 rounded-full bg-center bg-no-repeat bg-cover border-2 border-[#ea3e86]"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpEypbur0tCmJlmMGSJMnrqLOB1J2OPGZ4WPKSisbrhbTbmi89V6BsaRpbmt08u2YnXM4tjLKu6cMuoAsXSQvnJQdVbujO8PS7I9JEot2Jbc3mcngzgiNkZ4DqwVe5fc0AY7vbzUaIE6crsYE2EWOJIIkmt7wFQDKTJtpA48faXNENsNneftGCpLnpaYvYPlmrpf7pD_3TDASsMk9uiTXu5yeEsc_4w3AAXTcWdz1zIj_CociuwKaZZaj0gN5CFhrfPzcx8euocHz8")',
                  }}
                />
                <div>
                  <h4 className="text-[#181114] font-bold text-lg">Elena Rossi</h4>
                  <p className="text-[#ea3e86] font-medium text-sm mb-2">Textile Designer</p>
                  <p className="text-[#886372] text-sm leading-relaxed">
                    Bordados delicados para textiles de cocina unicos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        */}
      </main>

      <LandingFooter />
    </div>
  );
}
