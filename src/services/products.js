import { apiFetch } from './api';

function toQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    query.set(key, String(value));
  });

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export function listProducts(params = {}) {
  return apiFetch(`/api/products${toQuery(params)}`);
}

export function getProduct(idOrSlug) {
  return apiFetch(`/api/products/${encodeURIComponent(idOrSlug)}`);
}

export function getRelatedProducts(idOrSlug, limit = 4) {
  return apiFetch(`/api/products/${encodeURIComponent(idOrSlug)}/related${toQuery({ limit })}`);
}

export function createProduct(data) {
  return apiFetch('/api/products', { method: 'POST', body: data });
}

export function updateProduct(id, data) {
  return apiFetch(`/api/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: data });
}

export function deleteProduct(id) {
  return apiFetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function bulkUpdateStock(items) {
  return apiFetch('/api/products/bulk-stock', { method: 'PATCH', body: { items } });
}

export function getAdminStats() {
  return apiFetch('/api/admin/stats');
}

export function uploadImage(image) {
  return apiFetch('/api/uploads', { method: 'POST', body: { image } });
}
