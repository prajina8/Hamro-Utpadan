import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const { itemCount } = useCart()

  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <header className="modern-nav">

      <div className="nav-inner">

        <NavLink
          to="/"
          className="brand modern-brand"
          onClick={() => setOpen(false)}
        >
          <span className="brand-icon">
            🌱
          </span>

          <span>
            Local<span>Harvest</span>
          </span>
        </NavLink>

        <nav
          className={`modern-nav-links ${
            open ? 'open' : ''
          }`}
        >

          <NavLink
            to="/"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Marketplace
          </NavLink>

          <NavLink
            to="/cart"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Cart

            <span className="nav-cart-count">
              {itemCount}
            </span>
          </NavLink>

        </nav>

        <button
          className="nav-toggle modern-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() =>
            setOpen((value) => !value)
          }
        >
          <span />
          <span />
          <span />
        </button>

      </div>

    </header>
  )
}