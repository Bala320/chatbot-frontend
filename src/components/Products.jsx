import { useDeferredValue, useMemo, useState } from 'react';

const sortOptions = {
  featured: (left, right) => right.stars - left.stars || left.newPrice - right.newPrice,
  priceLow: (left, right) => left.newPrice - right.newPrice,
  priceHigh: (left, right) => right.newPrice - left.newPrice,
  reviews: (left, right) => right.reviewsCount - left.reviewsCount,
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateDiscount(newPrice, oldPrice) {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

function ProductCard({ product, onAskAboutProduct }) {
  const discount = calculateDiscount(product.newPrice, product.oldPrice);

  return (
    <article className={`product-card accent-${product.accent}`}>
      <div className="product-media">
        <span className="product-badge">{product.badge}</span>
        <img src={product.image} alt={product.title} />
      </div>

      <div className="product-copy">
        <div className="product-copy-top">
          <p className="eyebrow">{product.category}</p>
          <h3>{product.title}</h3>
          <div className="product-rating" aria-label={`${product.stars} star rating`}>
            <span>{'*'.repeat(product.stars)}</span>
            <span className="muted">{product.reviewsCount} reviews</span>
          </div>
          <p className="product-delivery">{product.delivery}</p>
        </div>

        <div className="product-tags">
          {product.specs.map((spec) => (
            <span key={spec}>{spec}</span>
          ))}
        </div>

        <ul className="product-features">
          {product.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="product-side">
        <div>
          <p className="price-now">{formatCurrency(product.newPrice)}</p>
          <p className="price-was">
            <s>{formatCurrency(product.oldPrice)}</s>
            <span>{discount}% off</span>
          </p>
        </div>

        <div className="product-actions">
          <button type="button" className="primary-button">
            Add to cart
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => onAskAboutProduct(`Tell me more about ${product.title}.`)}
          >
            Ask about this
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Products({ data, onAskAboutProduct }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const deferredQuery = useDeferredValue(query);
  const categories = useMemo(
    () => ['All', ...new Set(data.map((product) => product.category))],
    [data],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return data
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;

        if (!normalizedQuery) {
          return matchesCategory;
        }

        const searchText = [
          product.title,
          product.category,
          ...product.specs,
          ...product.features,
        ]
          .join(' ')
          .toLowerCase();

        return matchesCategory && searchText.includes(normalizedQuery);
      })
      .sort(sortOptions[sortBy]);
  }, [data, deferredQuery, selectedCategory, sortBy]);

  const resultsLabel =
    filteredProducts.length === 1
      ? '1 product curated for you'
      : `${filteredProducts.length} products curated for you`;

  return (
    <main className="catalog-shell">
      <section className="catalog-hero">
        <div className="hero-copy">
          <p className="eyebrow">Spring edit 2026</p>
          <h1>Build a product listing that feels shoppable, focused, and alive.</h1>
          <p className="hero-description">
            Browse a compact storefront with quick filters, strong hierarchy, and a
            lightweight assistant panel for product questions.
          </p>
        </div>

        <div className="hero-panel">
          <div>
            <p className="panel-label">Live assortment</p>
            <strong>{data.length} featured drops</strong>
          </div>
          <div>
            <p className="panel-label">Free shipping</p>
            <strong>On every highlighted pick</strong>
          </div>
          <div>
            <p className="panel-label">Best discount</p>
            <strong>
              {Math.max(...data.map((product) =>
                calculateDiscount(product.newPrice, product.oldPrice),
              ))}
              % off today
            </strong>
          </div>
        </div>
      </section>

      <section className="catalog-toolbar">
        <label className="search-field">
          <span>Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, use case, or feature"
          />
        </label>

        <div className="toolbar-controls">
          <label>
            <span>Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="catalog-results">
        <div className="results-header">
          <div>
            <p className="eyebrow">Collection</p>
            <h2>{resultsLabel}</h2>
          </div>
          <p className="muted">Thoughtful defaults, responsive layout, no utility CSS setup required.</p>
        </div>

        <div className="product-grid">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAskAboutProduct={onAskAboutProduct}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No matches found</h3>
              <p>Try a broader search or switch back to all categories.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
