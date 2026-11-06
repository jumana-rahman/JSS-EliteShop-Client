import { apiFetch } from './api';

export function getWishlist() {
  return apiFetch('/api/wishlist');
}

export function addWishlistItem(productId) {
  return apiFetch('/api/wishlist/items', {
    method: 'POST',
    body: { productId },
  });
}

export function removeWishlistItem(productId) {
  return apiFetch(`/api/wishlist/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export function mergeWishlist(productIds) {
  return apiFetch('/api/wishlist/merge', {
    method: 'POST',
    body: { productIds },
  });
}

export function clearRemoteWishlist() {
  return apiFetch('/api/wishlist', { method: 'DELETE' });
}
