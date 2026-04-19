const API_BASE_URL = 'http://localhost:8080/api';
let sessionInitialized = false;

async function readReply(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return (
      data.reply ||
      data.message ||
      data.response ||
      data.content ||
      'The server responded, but no reply field was found in the JSON payload.'
    );
  }

  const text = await response.text();
  return text.trim() || 'The server responded with an empty message.';
}

async function request(path, options = {}) {
  return window.fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
}

export async function initializeChatSession() {
  if (sessionInitialized) {
    return true;
  }

  const response = await request('/session', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Session initialization failed.');
  }

  sessionInitialized = true;
  return true;
}

export async function refreshChatSession() {
  const response = await request('/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Session refresh failed.');
  }

  sessionInitialized = true;
  return true;
}

async function sendRemoteChatMessage(message) {
  const response = await request('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (response.status === 401) {
    await refreshChatSession();

    const retryResponse = await request('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!retryResponse.ok) {
      throw new Error('Chat retry failed after refresh.');
    }

    return readReply(retryResponse);
  }

  if (!response.ok) {
    throw new Error('Chat API request failed.');
  }

  return readReply(response);
}

export async function sendChatMessage(message) {
  await initializeChatSession();
  return sendRemoteChatMessage(message);
}
