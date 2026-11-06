import { apiFetch } from './api';

export function createOrder(data) {
  return apiFetch('/api/orders', { method: 'POST', body: data });
}

export function listOrders() {
  return apiFetch('/api/orders');
}

export function getOrder(idOrNumber) {
  return apiFetch(`/api/orders/${encodeURIComponent(idOrNumber)}`);
}
