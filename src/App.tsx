import { useEffect, useMemo, useState } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import HeaderMobile from './components/HeaderMobile';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Home from './components/Home';
import { products, type CartItem, type Product } from './data/products';

const DEFAULT_CATEGORY = 'todos';
const CART_STORAGE_KEY = 'kittyshop-cart';
const STOCK_STORAGE_KEY = 'kittyshop-stock';

export default function App() {
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORY);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
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
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.id] = product.stock;
      return acc;
    }, {});
  });

  const visibleProducts = useMemo(() => {
    const base = activeCategoryId === DEFAULT_CATEGORY
      ? products
      : products.filter((product) => product.categoryId === activeCategoryId);

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
  }, [activeCategoryId, searchQuery, minPrice, maxPrice, sortBy]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockById));
  }, [stockById]);

  useEffect(() => {
    if (cartItems.length > 0) {
      setHasPurchased(false);
    }
  }, [cartItems]);

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

  function ShopLayout() {
    return (
      <div className="wrapper">
        <HeaderMobile onOpenMenu={() => setIsMenuOpen(true)} />
        <Sidebar
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
              onUpdateStock={handleUpdateStock}
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
              products={products}
              onAddToCart={handleAddToCart}
              stockById={stockById}
            />
          }
        />
      </Route>
    </Routes>
  );
}
