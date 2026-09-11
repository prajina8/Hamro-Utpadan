import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ProductCard from '../components/ProductCard'
import LoadingCard from '../components/LoadingCard'

import localProducts from '../data/localProducts'
import { fetchApiProducts } from '../services/productApi'

const CATEGORIES = ['All', 'Fruit', 'Vegetable']

export default function Shop() {
  const [searchParams] = useSearchParams()

  const initialCategory =
    searchParams.get('category') || 'All'

  const [category, setCategory] =
    useState(initialCategory)

  const [query, setQuery] = useState('')

  const [apiProducts, setApiProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchApiProducts()
        setApiProducts(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load product images.')
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

  const filtered = useMemo(() => {
    return products.filter((product) => {

      const matchesCategory =
        category === 'All' ||
        product.category === category

      const search =
        query.trim().toLowerCase()

      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search) ||
        product.location.toLowerCase().includes(search) ||
        product.grower.toLowerCase().includes(search)

      return matchesCategory && matchesSearch
    })
  }, [products, category, query])

  return (
    <section className="section wrap shop-page">

      <div className="shop-hero">

        <span className="eyebrow">
          LOCAL MARKETPLACE
        </span>

        <h1 className="display">
          Fresh produce,
          <br />
          straight from growers.
        </h1>

        <p>
          Browse locally grown fruits and vegetables
          from farmers across Nepal.
        </p>

      </div>

      <div className="shop-controls">

        <div className="tabs">

          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? 'tab active'
                  : 'tab'
              }
              onClick={() => setCategory(item)}
            >
              {item === 'All'
                ? 'All produce'
                : item + 's'}
            </button>
          ))}

        </div>
        
        <input
          className="modern-search"
          type="search"
          placeholder="Search products, growers or locations..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />

      </div>

      {error && (
        <div className="api-warning">
          {error} The marketplace will still work with
          the local product information.
        </div>
      )}

      {loading ? (

        <div className="product-grid">

          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}

        </div>

      ) : filtered.length > 0 ? (

        <div className="product-grid">

          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      ) : (

        <div className="empty-note">
          No products found.
        </div>

      )}

    </section>
  )
}
