import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category, Product } from '../data/products';

type StockAdminProps = {
  products: Product[];
  categories: Category[];
  stockById: Record<string, number>;
  onUpdateStock: (productId: string, value: number) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: () => void;
  onAddCategory: (label: string) => void;
  onUpdateCategory: (categoryId: string, label: string) => void;
  onDeleteCategory: (categoryId: string) => void;
};

type AdminTab = 'categories' | 'pricing' | 'products';
const ADMIN_TOKEN_KEY = 'kittyshop-admin-token';

export default function StockAdmin({
  products,
  categories,
  stockById,
  onUpdateStock,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: StockAdminProps) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>('pricing');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [pendingCategoryAdds, setPendingCategoryAdds] = useState<string[]>([]);
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});
  const [pendingCategoryDeletes, setPendingCategoryDeletes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [priceDraftById, setPriceDraftById] = useState<Record<string, number>>({});
  const [stockDraftById, setStockDraftById] = useState<Record<string, number>>({});
  const [productDraft, setProductDraft] = useState<Product | null>(null);
  const [productDraftImage, setProductDraftImage] = useState('');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !query || product.title.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === 'all' || product.categoryId === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;

  useEffect(() => {
    const tab = searchParams.get('tab') as AdminTab | null;
    if (tab === 'categories' || tab === 'pricing' || tab === 'products') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
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
      setAdminToken(token);
      setLoginPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesion');
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken('');
  }

  useEffect(() => {
    if (!selectedProductId) return;
    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProductId]);

  useEffect(() => {
    setCategoryDrafts(
      categories.reduce<Record<string, string>>((acc, category) => {
        acc[category.id] = category.label;
        return acc;
      }, {}),
    );
    setPendingCategoryDeletes({});
  }, [categories]);

  useEffect(() => {
    setPriceDraftById(
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.id] = product.price;
        return acc;
      }, {}),
    );
    setStockDraftById(
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.id] = stockById[product.id] ?? 0;
        return acc;
      }, {}),
    );
  }, [products, stockById]);

  useEffect(() => {
    if (!selectedProduct) {
      setProductDraft(null);
      setProductDraftImage('');
      return;
    }
    setProductDraft({ ...selectedProduct, images: [...(selectedProduct.images || [])] });
    setProductDraftImage('');
  }, [selectedProduct]);


  function handleAddCategorySubmit() {
    const label = newCategoryLabel.trim();
    if (!label) return;
    setPendingCategoryAdds((prev) => [...prev, label]);
    setNewCategoryLabel('');
  }

  function handleApplyCategories() {
    const currentMap = categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.label;
      return acc;
    }, {});

    Object.entries(categoryDrafts).forEach(([id, label]) => {
      if (currentMap[id] !== undefined && currentMap[id] !== label) {
        onUpdateCategory(id, label);
      }
    });

    pendingCategoryAdds.forEach((label) => {
      onAddCategory(label);
    });

    Object.entries(pendingCategoryDeletes).forEach(([id, marked]) => {
      if (marked && id !== 'todos') {
        onDeleteCategory(id);
      }
    });

    setPendingCategoryAdds([]);
    setPendingCategoryDeletes({});
  }

  function handleApplyPricing() {
    products.forEach((product) => {
      const nextPrice = priceDraftById[product.id];
      if (Number.isFinite(nextPrice) && nextPrice !== product.price) {
        onUpdateProduct(product.id, { price: nextPrice });
      }
      const nextStock = stockDraftById[product.id];
      const currentStock = stockById[product.id] ?? 0;
      if (Number.isFinite(nextStock) && nextStock !== currentStock) {
        onUpdateStock(product.id, nextStock);
      }
    });
  }

  function handleApplyProductDraft() {
    if (!productDraft) return;
    onUpdateProduct(productDraft.id, {
      title: productDraft.title,
      categoryId: productDraft.categoryId,
      image: productDraft.image,
      description: productDraft.description,
      images: productDraft.images,
    });
  }

  function handleDraftAddImage() {
    if (!productDraft) return;
    const value = productDraftImage.trim();
    if (!value) return;
    setProductDraft({
      ...productDraft,
      images: [...(productDraft.images || []), value],
    });
    setProductDraftImage('');
  }

  function handleDraftRemoveImage(src: string) {
    if (!productDraft) return;
    setProductDraft({
      ...productDraft,
      images: (productDraft.images || []).filter((item) => item !== src),
    });
  }

  return (
    <main>
      <h2 className="titulo-principal">Administrar stock</h2>
      {!adminToken && (
        <section className="admin-login">
          <h3>Ingresar al panel</h3>
          <form onSubmit={handleLogin} className="admin-login-form">
            <label>
              Email
              <input
                className="stock-admin-text"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </label>
            <label>
              Contraseña
              <input
                className="stock-admin-text"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </label>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="stock-admin-add">Entrar</button>
          </form>
        </section>
      )}
      {adminToken && (
        <div className="admin-toolbar admin-auth">
          <span className="admin-auth-status">Sesion activa</span>
          <button type="button" className="stock-admin-delete" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      )}
      {adminToken && (
        <>
          {activeTab === 'categories' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Categorias</h3>
            <div className="admin-inline-form">
              <input
                type="text"
                placeholder="Nueva categoria"
                value={newCategoryLabel}
                onChange={(event) => setNewCategoryLabel(event.target.value)}
                className="stock-admin-text"
              />
              <button type="button" className="stock-admin-add" onClick={handleAddCategorySubmit}>
                Agregar
              </button>
            </div>
            <button type="button" className="stock-admin-add" onClick={handleApplyCategories}>
              Aplicar cambios
            </button>
          </div>
          {pendingCategoryAdds.length > 0 && (
            <div className="admin-hint">
              Pendientes por agregar: {pendingCategoryAdds.join(', ')}
            </div>
          )}
          <div className="stock-admin">
            <table className="stock-admin-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>
                      <input
                        className="stock-admin-text"
                        type="text"
                        value={categoryDrafts[category.id] ?? category.label}
                        onChange={(event) =>
                          setCategoryDrafts((prev) => ({
                            ...prev,
                            [category.id]: event.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="stock-admin-delete"
                        onClick={() =>
                          setPendingCategoryDeletes((prev) => ({
                            ...prev,
                            [category.id]: !prev[category.id],
                          }))
                        }
                        disabled={category.id === 'todos'}
                      >
                        {pendingCategoryDeletes[category.id] ? 'Deshacer' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'pricing' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Precio y stock</h3>
            <button type="button" className="stock-admin-add" onClick={handleApplyPricing}>
              Aplicar cambios
            </button>
          </div>
          <div className="stock-admin">
            <table className="stock-admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock = stockById[product.id] ?? 0;
                  const isOut = stock <= 0;
                  return (
                    <tr key={product.id}>
                      <td className="stock-admin-product">
                        <img src={product.image} alt={product.title} />
                        <div>
                          <strong>{product.title}</strong>
                          <div className="stock-admin-sku">SKU: {product.id}</div>
                        </div>
                      </td>
                      <td>
                        <input
                          className="stock-admin-input"
                          type="number"
                          min="0"
                          value={priceDraftById[product.id] ?? product.price}
                          onChange={(event) =>
                            setPriceDraftById((prev) => ({
                              ...prev,
                              [product.id]: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="stock-admin-input"
                          type="number"
                          min="0"
                          value={stockDraftById[product.id] ?? stock}
                          onChange={(event) =>
                            setStockDraftById((prev) => ({
                              ...prev,
                              [product.id]: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <span className={`stock-admin-status${isOut ? ' agotado' : ''}`}>
                          {isOut ? 'Agotado' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'products' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Productos</h3>
            <button type="button" className="stock-admin-add" onClick={onAddProduct}>
              Agregar producto nuevo
            </button>
          </div>
          <div className="admin-toolbar">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="stock-admin-text"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="stock-admin-text"
            >
              <option value="all">Todas las categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {productDraft ? (
            <div ref={editorRef} className="admin-product-editor">
              <div className="admin-editor-header">
                <h4>Editar producto</h4>
                <div className="admin-editor-actions">
                  <button type="button" onClick={() => setSelectedProductId(null)}>
                    Cerrar
                  </button>
                  <button type="button" className="stock-admin-add" onClick={handleApplyProductDraft}>
                    Guardar cambios
                  </button>
                </div>
              </div>
              <div className="admin-editor-content">
                <div className="admin-editor-preview">
                  <img src={productDraft.image} alt={productDraft.title} />
                </div>
                <div className="admin-editor-fields">
                  <label>
                    Nombre
                    <input
                      className="stock-admin-text"
                      type="text"
                      value={productDraft.title}
                      onChange={(event) =>
                        setProductDraft({ ...productDraft, title: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      className="stock-admin-text"
                      value={productDraft.categoryId}
                      onChange={(event) =>
                        setProductDraft({ ...productDraft, categoryId: event.target.value })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Imagen principal
                    <input
                      className="stock-admin-text"
                      type="text"
                      value={productDraft.image}
                      onChange={(event) =>
                        setProductDraft({ ...productDraft, image: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Descripcion
                    <textarea
                      rows={4}
                      className="stock-admin-text"
                      value={productDraft.description}
                      onChange={(event) =>
                        setProductDraft({ ...productDraft, description: event.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="admin-editor-images">
                <h5>Galeria de imagenes</h5>
                <div className="stock-admin-image-list">
                  {(productDraft.images || []).map((src) => (
                    <div key={src} className="stock-admin-image-chip">
                      <span>{src}</span>
                      <button
                        type="button"
                        onClick={() => handleDraftRemoveImage(src)}
                        aria-label="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="stock-admin-image-add">
                  <input
                    className="stock-admin-text"
                    type="text"
                    placeholder="URL de imagen"
                    value={productDraftImage}
                    onChange={(event) =>
                      setProductDraftImage(event.target.value)
                    }
                  />
                  <button type="button" onClick={handleDraftAddImage}>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="admin-editor-hint">Selecciona un producto para editar.</p>
          )}
          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="admin-product-item"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProductId(product.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProductId(product.id);
                  }
                }}
              >
                <div className="admin-product-info">
                  <img src={product.image} alt={product.title} />
                  <div>
                    <strong>{product.title}</strong>
                    <div className="stock-admin-sku">SKU: {product.id}</div>
                  </div>
                </div>
                <div className="admin-product-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedProductId(product.id);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="stock-admin-delete"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteProduct(product.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>
      )}
        </>
      )}
    </main>
  );
}
