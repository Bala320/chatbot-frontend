export default function CartPage({
  cartItems,
  formatCurrency,
  onCheckout,
  onClearCart,
  onContinueShopping,
  onUpdateQuantity,
}) {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.newPrice * item.quantity,
    0,
  );

  return (
    <main className="cart-shell">
      <section className="cart-header">
        <div>
          <p className="eyebrow">Shopping cart</p>
          <h1>Your cart</h1>
        </div>
        <div className="cart-header__actions">
          <button type="button" className="secondary-button" onClick={onContinueShopping}>
            Continue shopping
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={onClearCart}
            disabled={!cartItems.length}
          >
            Clear cart
          </button>
        </div>
      </section>

      <section className="cart-layout">
        <div className="cart-list">
          {cartItems.length ? (
            cartItems.map((item) => (
              <article key={item.id} className="cart-item">
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.title}
                  className="cart-item__image"
                />
                <div className="cart-item__copy">
                  <p className="eyebrow">
                    {item.brand} - {item.category}
                  </p>
                  <h2>{item.title}</h2>
                  <p className="muted">{item.delivery}</p>
                </div>
                <div className="cart-item__meta">
                  <p className="price-now">{formatCurrency(item.newPrice)}</p>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h2>Your cart is empty</h2>
              <p>Add a few laptops from the catalog to start building the cart flow.</p>
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <p className="eyebrow">Order summary</p>
          <h2>{formatCurrency(subtotal)}</h2>
          <p className="muted">
            {cartItems.length
              ? 'This is the placeholder cart page. Session-driven persistence is already scaffolded.'
              : 'Once items are added, this panel is ready for tax, delivery, and checkout logic.'}
          </p>
          <button
            type="button"
            className="primary-button"
            disabled={!cartItems.length}
            onClick={onCheckout}
          >
            Proceed to checkout
          </button>
        </aside>
      </section>
    </main>
  );
}
