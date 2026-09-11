import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on delivery', hint: 'Pay the grower directly on pickup or drop-off' },
  { id: 'esewa', label: 'eSewa / Khalti', hint: 'Redirect to wallet at payment step (backend pending)' },
  { id: 'bank', label: 'Bank transfer', hint: 'Direct transfer to the grower or cooperative account' },
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [method, setMethod] = useState('cod')
  const [placed, setPlaced] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', role: 'Wholesaler', address: '', city: '', notes: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePlaceOrder(e) {
    e.preventDefault()
    // No backend yet — this simply confirms the order on-screen.
    setPlaced(true)
    clearCart()
  }

  if (items.length === 0 && !placed) {
    return (
      <section className="section wrap">
        <div className="empty-note">
          Your cart is empty.{' '}
          <Link to="/shop" style={{ textDecoration: 'underline' }}>
            Browse the marketplace
          </Link>{' '}
          before checking out.
        </div>
      </section>
    )
  }

  if (placed) {
    return (
      <section className="section wrap">
        <div className="confirm-box" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="mark">✓</div>
          <h2 className="display" style={{ fontSize: 30 }}>Order request sent</h2>
          <p style={{ color: 'var(--gray)', margin: '12px 0 0' }}>
            Thanks, {form.name || 'buyer'}. This is a frontend preview, so nothing
            was actually charged or delivered &mdash; once the backend and payment
            gateway are connected, this step will confirm the order with the
            grower and process payment via {PAYMENT_METHODS.find((m) => m.id === method)?.label}.
          </p>
          <div className="badge-note">
            No account was required to place this preview order.
          </div>
          <Link to="/shop" className="btn" style={{ marginTop: 20 }}>
            Continue browsing
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section wrap">
      <div className="section-head">
        <div>
          <span className="eyebrow">Step 2 of 2</span>
          <h2 className="display">Checkout</h2>
        </div>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        <div>
          <div className="form-block">
            <h3><span className="n">1</span> Buyer details</h3>
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name" type="text" required
                  value={form.name} onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Anil Shrestha"
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone" type="tel" required
                  value={form.phone} onChange={(e) => update('phone', e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="role">Buying as</label>
              <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option>Wholesaler</option>
                <option>Retailer</option>
                <option>Individual buyer</option>
              </select>
            </div>
          </div>

          <div className="form-block">
            <h3><span className="n">2</span> Delivery / pickup</h3>
            <div className="field">
              <label htmlFor="address">Address</label>
              <input
                id="address" type="text" required
                value={form.address} onChange={(e) => update('address', e.target.value)}
                placeholder="Street, ward, municipality"
              />
            </div>
            <div className="field">
              <label htmlFor="city">City / district</label>
              <input
                id="city" type="text" required
                value={form.city} onChange={(e) => update('city', e.target.value)}
                placeholder="e.g. Kathmandu"
              />
            </div>
            <div className="field">
              <label htmlFor="notes">Notes for the grower (optional)</label>
              <textarea
                id="notes" rows={3}
                value={form.notes} onChange={(e) => update('notes', e.target.value)}
                placeholder="Preferred pickup time, packaging, etc."
              />
            </div>
          </div>

          <div className="form-block">
            <h3><span className="n">3</span> Payment method</h3>
            <div className="pay-methods">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`pay-option ${method === m.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio" name="payment" value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{m.hint}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="badge-note">
              Payment gateway is not connected yet &mdash; placing an order here
              only simulates the request on the frontend.
            </div>
          </div>
        </div>

        <div className="summary-box">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.name} &times; {item.qty}</span>
              <span>Rs {item.price * item.qty}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs {subtotal}</span>
          </div>
          <button type="submit" className="btn block" style={{ marginTop: 18 }}>
            Place order
          </button>
          <button
            type="button"
            className="btn ghost block"
            style={{ marginTop: 10 }}
            onClick={() => navigate('/cart')}
          >
            Back to cart
          </button>
        </div>
      </form>
    </section>
  )
}
