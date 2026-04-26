import { useState } from 'react';

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

export default function ProductDetailPage({
  onAddToCart,
  onAskAboutProduct,
  onBuyNow,
  product,
}) {
  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const discount = calculateDiscount(product.newPrice, product.oldPrice);

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
    <main className="product-view-shell">
      <section className={`product-view-card accent-${product.accent}`}>
        <div className="product-view-gallery">
          <div className="product-view-image">
            <span className="product-badge">{product.badge}</span>
            <img
              src={gallery[activeImageIndex]}
              alt={`${product.title} detailed view ${activeImageIndex + 1}`}
            />
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
              </>
            ) : null}
          </div>

          <div className="product-view-thumbs">
            {gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`product-thumb ${index === activeImageIndex ? 'is-active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={image} alt={`${product.title} thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-view-copy">
          <p className="eyebrow">
            {product.brand} - {product.category}
          </p>
          <h1 className="product-view-title">{product.title}</h1>
          <div className="product-rating" aria-label={`${product.stars} star rating`}>
            <span>{'*'.repeat(product.stars)}</span>
            <span className="muted">{product.reviewsCount} reviews</span>
          </div>
          <p className="product-delivery">{product.delivery}</p>

          <div className="product-view-pricing">
            <p className="price-now">{formatCurrency(product.newPrice)}</p>
            <p className="price-was">
              <s>{formatCurrency(product.oldPrice)}</s>
              <span>{discount}% off</span>
            </p>
          </div>

          <div className="product-view-actions">
            <button type="button" className="primary-button" onClick={() => onBuyNow(product)}>
              Buy now
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onAddToCart(product)}
            >
              Add to cart
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onAskAboutProduct(`Tell me more about ${product.title}.`)}
            >
              Ask about this laptop
            </button>
          </div>

          <div className="product-view-section">
            <h2>Core specs</h2>
            <div className="product-tags">
              {product.specs.map((spec) => (
                <span key={spec}>{spec}</span>
              ))}
            </div>
          </div>

          <div className="product-view-section">
            <h2>Why it stands out</h2>
            <ul className="product-features">
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
