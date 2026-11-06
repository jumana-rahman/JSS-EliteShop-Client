import { apiFetch } from './api';

export function listAddresses() {
  return apiFetch('/api/addresses');
}

export function createAddress(data) {
  return apiFetch('/api/addresses', { method: 'POST', body: data });
}

export function updateAddress(id, data) {
  return apiFetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: data,
  });
}

export function deleteAddress(id) {
  return apiFetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
