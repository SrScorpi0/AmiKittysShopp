import { useEffect, useMemo, useState } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import HeaderMobile from './components/HeaderMobile';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Home from './components/Home';
import StockAdmin from './components/StockAdmin';
import { products, type CartItem, type Product, type Category } from './data/products';
import { categories as initialCategories } from './data/categories';

const DEFAULT_CATEGORY = 'todos';
const CART_STORAGE_KEY = 'kittyshop-cart';
const STOCK_STORAGE_KEY = 'kittyshop-stock';
const PRODUCTS_STORAGE_KEY = 'kittyshop-products';
const CATEGORIES_STORAGE_KEY = 'kittyshop-categories';

export default function App() {
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORY);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Category[];
      }
    } catch {
      // ignore invalid data
    }
    return initialCategories;
  });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Product[];
      }
    } catch {
      // ignore invalid data
    }
    return products;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as CartItem[];
    } catch {
      return [];
    }
  });
  const [stockById, setStockById] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(STOCK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Record<string, number>;
      }
    } catch {
      // ignore invalid data
    }
    return catalogProducts.reduce<Record<string, number>>((acc, product) => {
      acc[product.id] = product.stock;
      return acc;
    }, {});
  });

  const visibleProducts = useMemo(() => {
    const base = activeCategoryId === DEFAULT_CATEGORY
      ? catalogProducts
      : catalogProducts.filter((product) => product.categoryId === activeCategoryId);

    const query = searchQuery.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    const filtered = base.filter((product) => {
      const matchesQuery = !query || product.title.toLowerCase().includes(query);
      const matchesMin = min === null || product.price >= min;
      const matchesMax = max === null || product.price <= max;
      return matchesQuery && matchesMin && matchesMax;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }, [activeCategoryId, searchQuery, minPrice, maxPrice, sortBy, catalogProducts]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(catalogProducts));
  }, [catalogProducts]);

  useEffect(() => {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockById));
  }, [stockById]);

  useEffect(() => {
    if (cartItems.length > 0) {
      setHasPurchased(false);
    }
  }, [cartItems]);

  useEffect(() => {
    setCategories((prev) => {
      const exists = prev.some((category) => category.id === DEFAULT_CATEGORY);
      if (exists) return prev;
      return [{ id: DEFAULT_CATEGORY, label: 'Todos los productos' }, ...prev];
    });
    setStockById((prev) => {
      const next: Record<string, number> = {};
      catalogProducts.forEach((product) => {
        const current = prev[product.id];
        next[product.id] = current ?? product.stock ?? 0;
      });
      return next;
    });
    setCartItems((prev) =>
      prev.filter((item) => catalogProducts.some((product) => product.id === item.id)),
    );
  }, [catalogProducts]);

  useEffect(() => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const available = stockById[item.id] ?? 0;
          if (available <= 0) return null;
          return { ...item, quantity: Math.min(item.quantity, available) };
        })
        .filter((item): item is CartItem => Boolean(item)),
    );
  }, [stockById]);

  function handleAddToCart(product: Product) {
    setCartItems((prev) => {
      const available = stockById[product.id] ?? 0;
      if (available <= 0) return prev;
      const existing = prev.find((item) => item.id === product.id);
      if (!existing) {
        return [...prev, { ...product, quantity: 1 }];
      }
      if (existing.quantity >= available) {
        return prev;
      }
      return prev.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
  }

  function handleRemoveFromCart(productId: string) {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function handleClearCart() {
    setCartItems([]);
  }

  function handlePurchase() {
    setStockById((prev) => {
      const next = { ...prev };
      cartItems.forEach((item) => {
        const current = next[item.id] ?? 0;
        next[item.id] = Math.max(0, current - item.quantity);
      });
      return next;
    });
    setCartItems([]);
    setHasPurchased(true);
  }

  function handleUpdateStock(productId: string, value: number) {
    const sanitized = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    setStockById((prev) => ({ ...prev, [productId]: sanitized }));
  }

  function handleUpdateProduct(productId: string, updates: Partial<Product>) {
    setCatalogProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;
        const next = { ...product, ...updates };
        if (updates.categoryId) {
          const category = categories.find((item) => item.id === updates.categoryId);
          if (category) {
            next.categoryName = category.label;
          }
        }
        return next;
      }),
    );
  }

  function handleDeleteProduct(productId: string) {
    setCatalogProducts((prev) => prev.filter((product) => product.id !== productId));
    setStockById((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function handleAddProduct() {
    const timestamp = Date.now();
    const defaultCategory = categories.find((category) => category.id === DEFAULT_CATEGORY);
    const newProduct: Product = {
      id: `producto-${timestamp}`,
      title: 'Nuevo producto',
      image: '/img/Logo/Logo.png',
      images: ['/img/Logo/Logo.png'],
      categoryId: DEFAULT_CATEGORY,
      categoryName: defaultCategory?.label ?? 'Todos los productos',
      price: 0,
      description: 'Descripcion pendiente.',
      material: '-',
      size: '-',
      color: '-',
      stock: 0,
    };
    setCatalogProducts((prev) => [newProduct, ...prev]);
    setStockById((prev) => ({ ...prev, [newProduct.id]: 0 }));
  }

  function slugifyCategory(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function handleAddCategory(label: string) {
    const base = slugifyCategory(label) || 'categoria';
    let id = base;
    let count = 1;
    while (categories.some((category) => category.id === id)) {
      id = `${base}-${count}`;
      count += 1;
    }
    setCategories((prev) => [...prev, { id, label }]);
  }

  function handleUpdateCategory(categoryId: string, label: string) {
    setCategories((prev) =>
      prev.map((category) => (category.id === categoryId ? { ...category, label } : category)),
    );
    setCatalogProducts((prev) =>
      prev.map((product) =>
        product.categoryId === categoryId ? { ...product, categoryName: label } : product,
      ),
    );
  }

  function handleDeleteCategory(categoryId: string) {
    if (categoryId === DEFAULT_CATEGORY) return;
    const fallback = categories.find((category) => category.id === DEFAULT_CATEGORY);
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    setCatalogProducts((prev) =>
      prev.map((product) =>
        product.categoryId === categoryId
          ? {
              ...product,
              categoryId: DEFAULT_CATEGORY,
              categoryName: fallback?.label ?? 'Todos los productos',
            }
          : product,
      ),
    );
  }

  function ShopLayout() {
    return (
      <div className="wrapper">
        <HeaderMobile onOpenMenu={() => setIsMenuOpen(true)} />
        <Sidebar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => {
            setActiveCategoryId(id);
            setIsMenuOpen(false);
          }}
          cartCount={cartCount}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
        <Outlet />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<ShopLayout />}>
        <Route
          path="/productos"
          element={
            <Main
              products={visibleProducts}
              onAddToCart={handleAddToCart}
              stockById={stockById}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          }
        />
        <Route
          path="/carrito"
          element={
            <Cart
              items={cartItems}
              hasPurchased={hasPurchased}
              onRemoveItem={handleRemoveFromCart}
              onClear={handleClearCart}
              onPurchase={handlePurchase}
            />
          }
        />
        <Route
          path="/producto/:id"
          element={
            <ProductDetail
              products={catalogProducts}
              onAddToCart={handleAddToCart}
              stockById={stockById}
            />
          }
        />
        <Route
          path="/admin/stock"
          element={
            <StockAdmin
              products={catalogProducts}
              categories={categories}
              stockById={stockById}
              onUpdateStock={handleUpdateStock}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={handleAddProduct}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          }
        />
      </Route>
    </Routes>
  );
}
