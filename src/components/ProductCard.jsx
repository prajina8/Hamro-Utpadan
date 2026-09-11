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
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="card">
      <div className="card-media">
        {!imgFailed && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="card-media-fallback">{product.icon}</div>
        )}
        <div className="stamp">
          Farm<br />Direct
        </div>
      </div>

      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="grower">
          Grown by <b>{product.grower}</b> &middot; {product.location}
        </div>

        <div className="price-row">
          <span className="price">Rs {product.price}</span>
          <span className="unit">per {product.unit}</span>
        </div>

        <div className="qty-row">
          <div className="qty-control">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              &minus;
            </button>
            <span>{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <button type="button" className="btn" onClick={handleAdd}>
            {justAdded ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
