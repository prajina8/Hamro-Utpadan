import { useMemo, useState } from 'react'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Fruit', 'Vegetable']

export default function Shop() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.location.toLowerCase().includes(query.toLowerCase()) ||
        p.grower.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <section className="section wrap">
      <div className="section-head">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h2 className="display">Fruits &amp; vegetables</h2>
        </div>
        <div className="tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
              type="button"
            >
              {c === 'All' ? 'All produce' : `${c}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search by crop, grower, or village..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search listings"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-note">No listings match that search yet.</div>
      )}
    </section>
  )
}
