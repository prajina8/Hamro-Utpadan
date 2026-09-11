import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import ProductCard from '../components/ProductCard'
import LoadingCard from '../components/LoadingCard'

import localProducts from '../data/localProducts'
import { fetchApiProducts } from '../services/productApi'

export default function Home() {
  const [apiProducts, setApiProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchApiProducts()
        setApiProducts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const products = useMemo(() => {
    return localProducts.map((local, index) => ({
      ...local,

      image:
        apiProducts[index]?.images?.[0] ||
        apiProducts[index]?.thumbnail ||
        '',
    }))
  }, [apiProducts])

  const featured = products.slice(0, 4)

  const growerCount =
    new Set(products.map((p) => p.grower)).size

  return (
    <>
      {/* HERO */}

      <section className="modern-hero">

        <div className="hero-overlay" />

        <div className="modern-hero-content">

          <span className="hero-label">
             DIRECT FROM GROWERS
          </span>

          <h1>
            Fresh produce.
            <br />
            <span>Fair prices.</span>
          </h1>

          <p>
            Buy fruits and vegetables directly from local
            growers across Nepal. No unnecessary middlemen.
            Better prices for buyers and better income for farmers.
          </p>

          <div className="hero-buttons">
            <Link to="/shop" className="hero-primary">
              Explore marketplace →
            </Link>

            <Link to="/shop" className="hero-secondary">
              View today's harvest
            </Link>
          </div>

          <div className="hero-trust">
            <div>
              <strong>{products.length}+</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>{growerCount}+</strong>
              <span>Local growers</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Direct sourcing</span>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORY SECTION */}

      <section className="section wrap">

        <div className="section-head modern-head">
          <div>
            <span className="eyebrow">
              SHOP BY CATEGORY
            </span>

            <h2 className="display">
              Fresh from the farm
            </h2>
          </div>
        </div>

        <div className="category-grid">

          <Link
            to="/shop?category=Fruit"
            className="category-card fruit"
          >
            <div>
              <span>🍎</span>
              <h3>Fresh Fruits</h3>
              <p>Apples, bananas, oranges & more</p>
            </div>

            <strong>Explore →</strong>
          </Link>

          <Link
            to="/shop?category=Vegetable"
            className="category-card vegetable"
          >
            <div>
              <span>🥬</span>
              <h3>Fresh Vegetables</h3>
              <p>Farm-grown vegetables from Nepal</p>
            </div>

            <strong>Explore →</strong>
          </Link>

        </div>

      </section>

      {/* FEATURED */}

      <section className="section wrap">

        <div className="section-head modern-head">

          <div>
            <span className="eyebrow">
              THIS WEEK
            </span>

            <h2 className="display">
              Featured produce
            </h2>
          </div>

          <Link to="/shop" className="outline-button">
            View all →
          </Link>

        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </section>

      {/* HOW IT WORKS */}

      <section className="process-section">

        <div className="wrap">

          <div className="process-heading">
            <span className="eyebrow">
              SIMPLE PROCESS
            </span>

            <h2>
              From farm to buyer
            </h2>
          </div>

          <div className="process-grid">

            <div className="process-card">
              <span>01</span>
              <div className="process-icon">🌱</div>
              <h3>Growers list</h3>
              <p>
                Local farmers list their fresh harvest,
                available quantity and price.
              </p>
            </div>

            <div className="process-card">
              <span>02</span>
              <div className="process-icon">🛒</div>
              <h3>Buyers order</h3>
              <p>
                Wholesalers, retailers and buyers browse
                products and place an order.
              </p>
            </div>

            <div className="process-card">
              <span>03</span>
              <div className="process-icon">🤝</div>
              <h3>Direct connection</h3>
              <p>
                Buyers and growers connect directly without
                unnecessary middlemen.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="cta-section">

        <div className="wrap cta-inner">

          <div>
            <span className="eyebrow">
              LOCAL • FAIR • DIRECT
            </span>

            <h2>
              Know where your food comes from.
            </h2>

            <p>
              Support local growers while getting fresh
              products at fair prices.
            </p>
          </div>

          <Link to="/shop" className="hero-primary">
            Start shopping →
          </Link>

        </div>

      </section>
    </>
  )
}