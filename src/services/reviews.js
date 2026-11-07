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

export function listProductReviews(productId, params = {}) {
  return apiFetch(`/api/reviews${toQuery({ productId, ...params })}`);
}

export function listFeaturedReviews(limit = 6) {
  return apiFetch(`/api/reviews/featured${toQuery({ limit })}`);
}

export function listMyReviews() {
  return apiFetch('/api/reviews/mine');
}

export function getReviewEligibility(productId) {
  return apiFetch(`/api/reviews/eligibility${toQuery({ productId })}`);
}

export function createReview(data) {
  return apiFetch('/api/reviews', { method: 'POST', body: data });
}

export function deleteReview(id) {
  return apiFetch(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function listAdminReviews(params = {}) {
  return apiFetch(`/api/admin/reviews${toQuery(params)}`);
}

export function deleteAdminReview(id) {
  return apiFetch(`/api/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
