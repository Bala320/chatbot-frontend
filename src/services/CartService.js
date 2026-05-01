import { API_BASE_URL } from '../config/api';

export async function request(path, options = {}) {
  return window.fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
}

export async function addToCart(productId) {
  const res = await request('/cart/add', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId })
  });

  console.log("STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("ERROR BODY:", text);
    throw new Error('Failed to add to cart');
  }
}

export async function getCart() {
  const res = await request('/cart');

  if (!res.ok) {
    throw new Error('Failed to fetch cart');
  }

  return res.json();
}

export async function clearCart() {
  const res = await request('/cart/clear', {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('Failed to clear cart');
  }
}
