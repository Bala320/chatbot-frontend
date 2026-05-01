const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

function normalizeApiBaseUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, '');

  if (!trimmed) {
    throw new Error('Missing VITE_API_BASE_URL environment variable.');
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(rawBaseUrl);
