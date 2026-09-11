import { Link } from 'react-router-dom'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const featured = products.slice(0, 4)
  const heroStrip = products.slice(4, 7)
  const growerCount = new Set(products.map((p) => p.grower)).size

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">No. 01 &middot; Grower to Wholesaler</span>
            <h1 className="display">
              Skip the<br />middleman.
            </h1>
            <p className="lede">
              Local Products lets villagers and small growers list the fruits
              and vegetables they've cultivated and sell them straight to
              wholesalers and buyers &mdash; so the profit stays with the
              people who did the work.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn">Browse the marketplace</Link>
              <Link to="/shop" className="btn ghost">See today's harvest</Link>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-strip">
              {heroStrip.map((p) => (
                <div className="hero-strip-item" key={p.id}>
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
              ))}
            </div>
            <div className="eyebrow" style={{ margin: '16px 0 10px' }}>Current listings</div>
            <div className="cycle">
              <div><b>01</b> Fruits &amp; vegetables only</div>
              <div><b>02</b> Priced by the grower</div>
              <div><b>03</b> Bought straight from the farm</div>
              <div><b>04</b> No commission layer</div>
            </div>
          </div>
        </div>

        <div className="wrap" style={{ paddingBottom: 32 }}>
          <div className="hero-stats">
            <div>
              <div className="num">{products.length}</div>
              <div className="label">Active listings</div>
            </div>
            <div>
              <div className="num">{growerCount}</div>
              <div className="label">Growers on board</div>
            </div>
            <div>
              <div className="num">0%</div>
              <div className="label">Middleman cut</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">No. 02 &middot; Process</span>
            <h2 className="display">How it works</h2>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <div className="idx">01</div>
            <h3>Grower lists produce</h3>
            <p>
              A villager posts what they've harvested &mdash; crop, quantity,
              and their own price. (Posting arrives with the grower login,
              coming soon.)
            </p>
          </div>
          <div className="step">
            <div className="idx">02</div>
            <h3>Buyer browses &amp; orders</h3>
            <p>
              Wholesalers and everyday buyers browse fruits and vegetables
              without needing an account, and add what they need to cart.
            </p>
          </div>
          <div className="step">
            <div className="idx">03</div>
            <h3>Deal made directly</h3>
            <p>
              Checkout connects the buyer straight to the grower's listing
              &mdash; no middleman markup taken along the way.
            </p>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">No. 03 &middot; Fresh in</span>
            <h2 className="display">Featured this week</h2>
          </div>
          <Link to="/shop" className="btn ghost">View all listings</Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  )
}
