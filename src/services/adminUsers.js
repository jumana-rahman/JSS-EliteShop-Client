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

export function listAdminUsers(params = {}) {
  return apiFetch(`/api/admin/users${toQuery(params)}`);
}

export function getAdminUser(id) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(id)}`);
}

export function updateAdminUserStatus(id, isActive) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { isActive },
  });
}
