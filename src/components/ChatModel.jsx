import { useEffect, useRef, useState } from 'react';

function navigateTo(path) {
  window.location.hash = path;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ChatModal({
  onAddToCart,
  onBuyNow,
  chatReady,
  isReplying,
  messages,
  onClose,
  onSend,
}) {
  const [draft, setDraft] = useState('');
  const conversationRef = useRef(null);

  useEffect(() => {
    if (!conversationRef.current) {
      return;
    }

    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, isReplying]);

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isReplying) {
      return;
    }

    onSend(trimmed);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
      <div className="chat-modal">
        <div className="chat-modal__header">
          <div>
            <p className="eyebrow">Store assistant</p>
            <h2>Active chatbot workspace</h2>
          </div>
          <button type="button" className="chat-modal__close" onClick={onClose} aria-label="Close chat">
            ×
          </button>
        </div>

        <div className="chat-modal__body">
          <div className="chat-thread" ref={conversationRef}>
            {messages.map((entry) => (
              <div
                key={entry.id}
                className={`chat-bubble chat-bubble--${entry.role}`}
              >
                <span className="eyebrow">
                  {entry.role === 'assistant' ? 'Assistant' : 'You'}
                </span>
                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                {entry.products?.length > 0 ? (
                  <div className="chat-product-list">
                    {entry.products.map((product) => (
                      <div key={product.id} className="chat-product-card">
                        <p className="eyebrow">
                          {product.brand} - {product.category}
                        </p>
                        <h4>{product.title}</h4>
                        <p className="chat-product-price">
                          {formatCurrency(product.newPrice)}
                        </p>
                        <div className="chat-product-actions">
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => onAddToCart(product)}
                          >
                            Add to cart
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                              onBuyNow(product);
                              onClose();
                              navigateTo('/cart');
                            }}
                          >
                            Buy now
                          </button>
                        </div>
                        <button
                          type="button"
                          className="chat-product-link"
                          onClick={() => {
                            onClose();
                            navigateTo(`/product/${product.id}`);
                          }}
                        >
                          View laptop details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isReplying ? (
              <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                <span className="eyebrow">Assistant</span>
                <p>Typing a reply...</p>
              </div>
            ) : null}
          </div>

          <div className="chat-composer">
            <textarea
              rows="1"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about specs or price"
            />
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Send message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
