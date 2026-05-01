import { API_BASE_URL } from '../config/api';
let sessionInitialized = false;
let sessionPromise = null;
let refreshPromise = null;

async function readReply(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    console.log("API RESPONSE:", data);

    return {
      content:
        data.reply ||
        data.message ||
        data.response ||
        data.content ||
        'No reply found',
      products: data.products || [],
      showProducts: data.showProducts ?? false
    };
  }

  const text = await response.text();
  return {
    content: text.trim() || 'Empty response',
    products: [],
    showProducts: false
  };
}

export async function request(path, options = {}) {
  return window.fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
}

export async function initializeChatSession() {
  if (sessionPromise) {
    return sessionPromise; // 👈 reuse ongoing request
  }

  sessionPromise = (async () => {
    const response = await request('/session', {
      method: 'POST',
      credentials: "include"
    });

    if (!response.ok) {
      sessionPromise = null; // reset on failure
      throw new Error('Session initialization failed.');
    }

    return true;
  })();

  return sessionPromise;
}

export async function refreshChatSession() {
   if (refreshPromise) {
    return refreshPromise; // 👈 reuse ongoing refresh
  }

  refreshPromise = (async () => {
    const response = await request('/refresh', {
      method: 'POST',
      credentials: "include",
    });

    if (!response.ok) {
      refreshPromise = null; // reset so future retries work

      const error = new Error('Session refresh failed.');
      error.status = response.status;
      throw error;
    }

    return true;
  })();

  return refreshPromise;
}

export async function getChatHistory() {
  let response = await request('/chat/history', {
    method: 'POST',
    credentials: "include",
  });

  if (response.status === 401) {
    try {
      await refreshChatSession();
    } catch (err) {
      console.log("REFRESH FAILED → creating new session", err);
      await initializeChatSession();
    }

    response = await request('/chat/history', {
      method: 'POST',
      credentials: "include",
    });
  }

  if (!response.ok) {
    const error = new Error('Failed to fetch chat history');
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function sendRemoteChatMessage(message) {
  const response = await request('/chat', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (response.status === 401) {
    try {
      await refreshChatSession();
    } catch (err) {
      await initializeChatSession();
    }

    const retryResponse = await request('/chat', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!retryResponse.ok) {
      const error = new Error('Chat retry failed.');
      error.status = retryResponse.status;
      throw error;
    }

    return readReply(retryResponse);
  }

  if (!response.ok) {
    throw new Error('Chat API request failed.');
  }

  return readReply(response);
}

export async function sendChatMessage(message) {
  // await initializeChatSession();
  // return sendRemoteChatMessage(message);

  try {
    return await sendRemoteChatMessage(message);
  } catch (err) {
    // If session expired or not present
    // if (err.status === 401) {
      await initializeChatSession();
      return await sendRemoteChatMessage(message);
    // }

    throw err;
  }
}
