const API = "https://linkpulse-1-e09g.onrender.com";

export async function api(path, method = "GET", body) {
  const res = await fetch(API + path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
  const err = new Error(data.error || `Request failed (${res.status})`);
  err.status = res.status;
  throw err}
  return data;
}