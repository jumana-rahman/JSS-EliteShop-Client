import { apiFetch } from './api';

export function aiChat(messages, productId) {
  return apiFetch('/api/ai/chat', {
    method: 'POST',
    body: { messages, ...(productId ? { productId } : {}) },
  });
}

export function aiSearch(query) {
  return apiFetch('/api/ai/search', { method: 'POST', body: { query } });
}

export function completeLook(productId) {
  return apiFetch('/api/ai/complete-look', {
    method: 'POST',
    body: { productId },
  });
}
