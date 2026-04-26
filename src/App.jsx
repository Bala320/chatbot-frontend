import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Data from './components/Data';
import CartPage from './components/CartPage';
import ChatInput from './components/ChatInput';
import ChatModal from './components/ChatModel';
import ProductDetailPage from './components/ProductDetailPage';
import Products from './components/Products';
import { initializeChatSession, sendChatMessage } from './services/chatbot';

const SESSION_STORAGE_KEY = 'catalog-session-id';

function getSessionId() {
  const existingId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existingId) {
    return existingId;
  }

  const nextId =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `session-${Date.now()}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextId);
  return nextId;
}

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';

  if (hash === '/cart') {
    return { page: 'cart' };
  }

  if (hash.startsWith('/product/')) {
    const productId = Number(hash.split('/')[2]);
    return { page: 'product', productId };
  }

  return { page: 'home' };
}

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

function CartButton({ count, onClick }) {
  return (
    <button type="button" className="cart-button" onClick={onClick} aria-label="Open cart">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.7L22 7H7.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="19" r="1.6" fill="currentColor" />
        <circle cx="18" cy="19" r="1.6" fill="currentColor" />
      </svg>
      <span>Cart</span>
      <strong>{count}</strong>
    </button>
  );
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi, I can help with laptop specs, pricing, offers, and quick comparisons. Ask me about any model on this page.',
    },
  ]);
  const [isReplying, setIsReplying] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [route, setRoute] = useState(() => getRouteFromHash());
  const [sessionId] = useState(() => getSessionId());
  const [cartItems, setCartItems] = useState(() => []);

  useEffect(() => {
    const savedCart = window.sessionStorage.getItem(`cart:${sessionId}`);
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [sessionId]);

  useEffect(() => {
    window.sessionStorage.setItem(`cart:${sessionId}`, JSON.stringify(cartItems));
  }, [cartItems, sessionId]);

  useEffect(() => {
    if (!window.location.hash) {
      navigateTo('/');
    }

    const syncRoute = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function prepareSession() {
      try {
        await initializeChatSession();
      } catch {
        // Keep the UI usable even if the chat backend is temporarily unavailable.
      } finally {
        if (active) {
          setChatReady(true);
        }
      }
    }

    prepareSession();

    return () => {
      active = false;
    };
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const activeProduct =
    route.page === 'product'
      ? Data.find((product) => product.id === route.productId) || null
      : null;

  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    navigateTo('/cart');
  };

  const handleUpdateQuantity = (productId, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.id !== productId),
      );
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const handleSend = async (nextMessage) => {
    const trimmed = nextMessage.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setChatOpen(true);
    setIsReplying(true);

    try {
      const reply = await sendChatMessage(trimmed);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content:
            'I could not get a response from the chat API just now. Please check the backend session, refresh endpoint, or chat response payload.',
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <>
      <header className="catalog-topbar">
        <button type="button" className="brand-mark" onClick={() => navigateTo('/')}>
          Laptop Loft
        </button>
        <div className="topbar-actions">
          <button type="button" className="topbar-link" onClick={() => navigateTo('/')}>
            Home
          </button>
          <CartButton count={cartCount} onClick={() => navigateTo('/cart')} />
        </div>
      </header>

      {route.page === 'home' ? (
        <Products
          data={Data}
          onAddToCart={handleAddToCart}
          onAskAboutProduct={handleSend}
          onOpenCart={() => navigateTo('/cart')}
          onViewProduct={(productId) => navigateTo(`/product/${productId}`)}
        />
      ) : null}

      {route.page === 'product' && activeProduct ? (
        <ProductDetailPage
          product={activeProduct}
          onAddToCart={handleAddToCart}
          onAskAboutProduct={handleSend}
          onBuyNow={handleBuyNow}
        />
      ) : null}

      {route.page === 'cart' ? (
        <CartPage
          cartItems={cartItems}
          formatCurrency={formatCurrency}
          onContinueShopping={() => navigateTo('/')}
          onUpdateQuantity={handleUpdateQuantity}
          sessionId={sessionId}
        />
      ) : null}

      <ChatInput onSend={handleSend} />
      {chatOpen ? (
        <ChatModal
          chatReady={chatReady}
          isReplying={isReplying}
          messages={messages}
          onClose={() => setChatOpen(false)}
          onSend={handleSend}
        />
      ) : null}
    </>
  );
}

export default App;
