import { apiFetch } from './api';

export function validateCoupon(code) {
  return apiFetch('/api/coupons/validate', {
    method: 'POST',
    body: { code },
  });
}

export function listAdminCoupons(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });

  const qs = query.toString();
  return apiFetch(`/api/admin/coupons${qs ? `?${qs}` : ''}`);
}

export function createAdminCoupon(data) {
  return apiFetch('/api/admin/coupons', { method: 'POST', body: data });
}

export function updateAdminCoupon(id, data) {
  return apiFetch(`/api/admin/coupons/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: data,
  });
}

export function deleteAdminCoupon(id) {
  return apiFetch(`/api/admin/coupons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
