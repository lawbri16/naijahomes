// All requests go through here. Vite proxies /api and /uploads to the Express server (see vite.config.js)
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body && !(body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

// "detached-house" -> "Detached house"
export const pretty = (s = "") => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
