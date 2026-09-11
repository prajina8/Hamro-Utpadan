import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  const deliveryNote = subtotal > 0 ? 'Arranged directly with grower' : '—'

  return (
    <section className="section wrap">
      <div className="section-head">
        <div>
          <span className="eyebrow">Step 1 of 2</span>
          <h2 className="display">Your cart</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-note">
          Your cart is empty.{' '}
          <Link to="/shop" style={{ textDecoration: 'underline' }}>
            Browse the marketplace
          </Link>
          {' '}to add fruits and vegetables.
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div className="cart-line" key={item.id}>
                <div className="cart-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" />
                  ) : (
                    <span className="icon">{item.icon}</span>
                  )}
                </div>
                <div>
                  <div className="name">{item.name}</div>
                  <div className="from">
                    From {item.grower} &middot; Rs {item.price} / {item.unit}
                  </div>
                </div>
                <div className="qty-control">
                  <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>&minus;</button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div className="line-price">Rs {item.price * item.qty}</div>
                <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <Link to="/shop" className="btn ghost">Add more items</Link>
            </div>
          </div>

          <div className="summary-box">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)}</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs {subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryNote}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>Rs {subtotal}</span>
            </div>
            <button
              type="button"
              className="btn block"
              style={{ marginTop: 18 }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
