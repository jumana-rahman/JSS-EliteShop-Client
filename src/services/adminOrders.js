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

export function listAdminOrders(params = {}) {
  return apiFetch(`/api/admin/orders${toQuery(params)}`);
}

export function getAdminOrder(idOrNumber) {
  return apiFetch(`/api/admin/orders/${encodeURIComponent(idOrNumber)}`);
}

export function updateAdminOrder(idOrNumber, data) {
  return apiFetch(`/api/admin/orders/${encodeURIComponent(idOrNumber)}`, {
    method: 'PATCH',
    body: data,
  });
}
