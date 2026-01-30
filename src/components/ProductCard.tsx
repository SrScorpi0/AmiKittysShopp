import { useNavigate } from 'react-router-dom';
import type { Product } from '../data/products';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  stock: number;
  onUpdateStock: (productId: string, value: number) => void;
};

export default function ProductCard({
  product,
  onAddToCart,
  stock,
  onUpdateStock,
}: ProductCardProps) {
  const navigate = useNavigate();
  const isOutOfStock = stock <= 0;

  return (
    <div className="producto">
      <img
        className="producto-imagen producto-clickable"
        src={product.image}
        alt={product.title}
        onClick={() => navigate(`/producto/${product.id}`)}
      />
      <div className="producto-detalles">
        <h3
          className="producto-titulo producto-clickable"
          onClick={() => navigate(`/producto/${product.id}`)}
        >
          {product.title}
        </h3>
        <p className="producto-precio">${product.price}</p>
        <div className="producto-stock">
          <span className={`producto-stock-badge${isOutOfStock ? ' agotado' : ''}`}>
            {isOutOfStock ? 'Agotado' : `Stock: ${stock}`}
          </span>
          <label className="producto-stock-label">
            Stock
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => onUpdateStock(product.id, Number(event.target.value))}
              className="producto-stock-input"
            />
          </label>
        </div>
        <button
          className="producto-agregar"
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
