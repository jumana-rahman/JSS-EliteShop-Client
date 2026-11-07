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

export function sendContactMessage(data) {
  return apiFetch('/api/contact', { method: 'POST', body: data });
}

export function listAdminMessages(params = {}) {
  return apiFetch(`/api/admin/contact${toQuery(params)}`);
}

export function getAdminMessage(id) {
  return apiFetch(`/api/admin/contact/${encodeURIComponent(id)}`);
}

export function updateAdminMessage(id, isRead) {
  return apiFetch(`/api/admin/contact/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { isRead },
  });
}

export function deleteAdminMessage(id) {
  return apiFetch(`/api/admin/contact/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
