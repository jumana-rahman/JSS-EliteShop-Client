import { apiFetch, API_URL } from './api';

export function createOrder(data) {
  return apiFetch('/api/orders', { method: 'POST', body: data });
}

export function listOrders() {
  return apiFetch('/api/orders');
}

export function getOrder(idOrNumber) {
  return apiFetch(`/api/orders/${encodeURIComponent(idOrNumber)}`);
}

export async function downloadInvoice(idOrNumber) {
  let response;

  try {
    response = await fetch(
      `${API_URL}/api/orders/${encodeURIComponent(idOrNumber)}/invoice`,
      { credentials: 'include' }
    );
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {};
    throw new Error(data.message || 'Could not download the invoice.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `invoice-${idOrNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
