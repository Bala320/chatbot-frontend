import { useDeferredValue, useMemo, useState } from 'react';

const sortOptions = {
  featured: (left, right) => right.stars - left.stars || left.newPrice - right.newPrice,
  priceLow: (left, right) => left.newPrice - right.newPrice,
  priceHigh: (left, right) => right.newPrice - left.newPrice,
  reviews: (left, right) => right.reviewsCount - left.reviewsCount,
};

const categoryOptions = [
  'All',
  'Gaming',
  'Productivity',
  'Battery Life',
  'Highest Rated',
  'Best Offer',
];

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

function ProductCard({ onAddToCart, onAskAboutProduct, onViewProduct, product }) {
  const discount = calculateDiscount(product.newPrice, product.oldPrice);
  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const showPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? gallery.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === gallery.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <article className={`product-card accent-${product.accent}`}>
      <div className="product-media">
        <span className="product-badge">{product.badge}</span>
        <img src={gallery[activeImageIndex]} alt={`${product.title} view ${activeImageIndex + 1}`} />
        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              className="gallery-button gallery-button--left"
              onClick={showPreviousImage}
              aria-label={`Show previous image of ${product.title}`}
            >
              {'<'}
            </button>
            <button
              type="button"
              className="gallery-button gallery-button--right"
              onClick={showNextImage}
              aria-label={`Show next image of ${product.title}`}
            >
              {'>'}
            </button>
            <div className="gallery-indicators" aria-label={`${gallery.length} product images`}>
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`gallery-indicator ${index === activeImageIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show image ${index + 1} of ${product.title}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="product-copy">
        <div className="product-copy-top">
          <p className="eyebrow">
            {product.brand} - {product.category}
          </p>
          <button
            type="button"
            className="product-title-button"
            onClick={() => onViewProduct(product.id)}
          >
            {product.title}
          </button>
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
          <button type="button" className="primary-button" onClick={() => onAddToCart(product)}>
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

export default function Products({
  data,
  onAddToCart,
  onAskAboutProduct,
  onOpenCart,
  onViewProduct,
}) {
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const deferredQuery = useDeferredValue(query);
  const brands = useMemo(() => ['All', ...new Set(data.map((product) => product.brand))], [data]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return data
      .filter((product) => {
        const discount = calculateDiscount(product.newPrice, product.oldPrice);
        const matchesBrand =
          selectedBrand === 'All' || product.brand === selectedBrand;
        const matchesCategory =
          selectedCategory === 'All' ||
          product.category === selectedCategory ||
          (selectedCategory === 'Highest Rated' && product.stars >= 5) ||
          (selectedCategory === 'Best Offer' && discount >= 15);

        if (!normalizedQuery) {
          return matchesBrand && matchesCategory;
        }

        const searchText = [
          product.title,
          product.brand,
          product.category,
          ...product.specs,
          ...product.features,
        ]
          .join(' ')
          .toLowerCase();

        return matchesBrand && matchesCategory && searchText.includes(normalizedQuery);
      })
      .sort(sortOptions[sortBy]);
  }, [data, deferredQuery, selectedBrand, selectedCategory, sortBy]);

  const resultsLabel =
    filteredProducts.length === 1
      ? '1 laptop shortlist ready'
      : `${filteredProducts.length} laptops in your shortlist`;
  const topDeals = [...data]
    .sort(
      (left, right) =>
        calculateDiscount(right.newPrice, right.oldPrice) -
        calculateDiscount(left.newPrice, left.oldPrice),
    )
    .slice(0, 3);

  return (
    <main className="catalog-shell">
      <section className="catalog-hero">
        <div className="hero-copy">
          <div className="hero-copy__lead">
            <p className="eyebrow">Laptop buying guide</p>
            <h1>Find the right laptop faster, with clearer filters and smarter comparisons.</h1>
            <p className="hero-description">
              Explore a marketplace-style laptop page built for real buying decisions:
              compare brands, scan specs quickly, and narrow the shortlist by use case,
              ratings, and value.
            </p>
          </div>

          <div className="hero-highlights">
            <div className="hero-stat">
              <p className="panel-label">Live assortment</p>
              <strong>{data.length} laptop listings</strong>
            </div>
            <div className="hero-stat">
              <p className="panel-label">Top brands</p>
              <strong>{brands.length - 1} major brands compared</strong>
            </div>
            <div className="hero-stat">
              <p className="panel-label">Best offer</p>
              <strong>
                {Math.max(...data.map((product) =>
                  calculateDiscount(product.newPrice, product.oldPrice),
                ))}
                % off today
              </strong>
            </div>
            <div className="hero-stat">
              <p className="panel-label">Highest rated</p>
              <strong>{data.reduce((max, product) => Math.max(max, product.stars), 0)}/5 buyer score</strong>
            </div>
          </div>
        </div>

        <div className="hero-deals">
          <div className="hero-deals__header">
            <p className="eyebrow">Deal radar</p>
            <button type="button" className="topbar-link" onClick={onOpenCart}>
              View cart
            </button>
          </div>
          <div className="hero-deals__list">
            {topDeals.map((product) => (
              <article key={product.id} className={`deal-card accent-${product.accent}`}>
                <p className="panel-label">{product.brand}</p>
                <h3>{product.title}</h3>
                <p className="deal-price">{formatCurrency(product.newPrice)}</p>
                <p className="muted">
                  {calculateDiscount(product.newPrice, product.oldPrice)}% off - {product.category}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar__header">
            <p className="eyebrow">Refine picks</p>
            <h2>Filter laptops</h2>
          </div>

          <label className="search-field">
            <span>Search laptops</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by brand, model, use case, or spec"
            />
          </label>

          <div className="sidebar-group">
            <label>
              <span>Brand</span>
              <select
                value={selectedBrand}
                onChange={(event) => setSelectedBrand(event.target.value)}
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categoryOptions.map((category) => (
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

          <div className="sidebar-promo">
            <p className="panel-label">Buying note</p>
            <p className="muted">
              Keep `Data.js` growing with more brands, categories, ratings, and offer
              data. The sidebar is now ready for extra filters later too.
            </p>
          </div>
        </aside>

        <section className="catalog-results">
          <div className="results-header">
            <div>
              <p className="eyebrow">Laptop collection</p>
              <h2>{resultsLabel}</h2>
            </div>
            <p className="muted">Marketplace-style browsing with a left rail for fast narrowing, just like a more shopping-focused catalog.</p>
          </div>

          <div className="product-grid">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  onAddToCart={onAddToCart}
                  product={product}
                  onAskAboutProduct={onAskAboutProduct}
                  onViewProduct={onViewProduct}
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
      </section>
    </main>
  );
}
