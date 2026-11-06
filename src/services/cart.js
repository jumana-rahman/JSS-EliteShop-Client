import { apiFetch } from './api';

export function getCart() {
  return apiFetch('/api/cart');
}

export function addCartItem(productId, quantity = 1) {
  return apiFetch('/api/cart/items', {
    method: 'POST',
    body: { productId, quantity },
  });
}

export function updateCartItem(productId, quantity) {
  return apiFetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: { quantity },
  });
}

export function removeCartItem(productId) {
  return apiFetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export function clearRemoteCart() {
  return apiFetch('/api/cart', { method: 'DELETE' });
}

export function mergeCart(items) {
  return apiFetch('/api/cart/merge', {
    method: 'POST',
    body: { items },
  });
}
