import { apiFetch } from './api';

export function uploadAvatar(image) {
  return apiFetch('/api/uploads/avatar', { method: 'POST', body: { image } });
}
