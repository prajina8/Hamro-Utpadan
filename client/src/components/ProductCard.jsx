import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const { addItem } = useCart()

  function handleAdd() {
    addItem(product, qty)

    setJustAdded(true)

    setTimeout(() => {
      setJustAdded(false)
    }, 1200)
  }

  const isLowStock = product.stock < 50

  return (
    <article className="product-card">
      <div className="product-image">

        {!imgFailed && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="image-fallback">
            {product.category === 'Fruit' ? '🍎' : '🥬'}
          </div>
        )}

        <span className="category-badge">
          {product.category}
        </span>

        <span className="farm-badge">
          FARM DIRECT
        </span>
      </div>

      <div className="product-content">

        <div className="product-title-row">
          <h3>{product.name}</h3>

          <span className="stock-dot">
            ●
          </span>
        </div>

        <p className="product-location">
          📍 {product.location}
        </p>

        <p className="product-grower">
          Grown by <strong>{product.grower}</strong>
        </p>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-price">
          <div>
            <strong>Rs {product.price}</strong>
            <span> / {product.unit}</span>
          </div>

          {isLowStock && (
            <small>Only {product.stock} left</small>
          )}
        </div>

        <div className="product-actions">

          <div className="qty-control">
            <button
              type="button"
              onClick={() =>
                setQty((q) => Math.max(1, q - 1))
              }
            >
              −
            </button>

            <span>{qty}</span>

            <button
              type="button"
              onClick={() =>
                setQty((q) =>
                  Math.min(product.stock, q + 1)
                )
              }
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="add-button"
            onClick={handleAdd}
          >
            {justAdded ? '✓ Added' : 'Add to cart'}
          </button>

        </div>

      </div>
    </article>
  )
}