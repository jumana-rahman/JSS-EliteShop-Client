const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, { body, headers, ...options } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

  let requestBody = body;
  if (body !== undefined && body !== null && !isForm && !isBlob && typeof body !== "string") {
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(requestBody && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    ...(requestBody !== undefined ? { body: requestBody } : {}),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      "Something went wrong. Please try again.";
    throw new ApiError(message, response.status, data?.errors);
  }

  return data;
}

export { API_URL };
