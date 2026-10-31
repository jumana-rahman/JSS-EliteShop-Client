import { apiFetch } from './api';

export function listCategories() {
  return apiFetch('/api/categories');
}

export function getCategory(idOrSlug) {
  return apiFetch(`/api/categories/${encodeURIComponent(idOrSlug)}`);
}

export function createCategory(data) {
  return apiFetch('/api/categories', { method: 'POST', body: data });
}

export function updateCategory(id, data) {
  return apiFetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: data });
}

export function deleteCategory(id) {
  return apiFetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function createSubcategory(categoryId, data) {
  return apiFetch(`/api/categories/${encodeURIComponent(categoryId)}/subcategories`, {
    method: 'POST',
    body: data,
  });
}

export function updateSubcategory(categoryId, subcategoryId, data) {
  return apiFetch(
    `/api/categories/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(subcategoryId)}`,
    { method: 'PATCH', body: data }
  );
}

export function deleteSubcategory(categoryId, subcategoryId) {
  return apiFetch(
    `/api/categories/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(subcategoryId)}`,
    { method: 'DELETE' }
  );
}
