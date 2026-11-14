const configuredApiUrl = import.meta.env.VITE_API_URL;

// Fall back to the local backend only while developing. Production builds must
// always get the API origin from VITE_API_URL at build time.
const API_URL = (
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

if (!configuredApiUrl && !import.meta.env.DEV) {
  console.error("Missing VITE_API_URL. Set it in the Vercel project settings.");
}

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

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(requestBody && !isForm ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      ...(requestBody !== undefined ? { body: requestBody } : {}),
    });
  } catch (error) {
    const apiError = new ApiError(
      `Unable to reach the server${API_URL ? ` at ${API_URL}` : ""}. Make sure the backend is running and try again.`,
      0
    );
    apiError.cause = error;
    throw apiError;
  }

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
