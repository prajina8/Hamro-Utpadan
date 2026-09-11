import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="stamp-dot" />
          Local Products
        </NavLink>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop" className={linkClass} onClick={() => setOpen(false)}>Shop</NavLink>
          <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>
            <span className="cart-badge">
              Cart <span className="count">{itemCount}</span>
            </span>
          </NavLink>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
