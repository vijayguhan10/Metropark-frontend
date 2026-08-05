const BASE_URL = 'http://localhost:8080';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(method, path, { body, params } = {}) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);

  console.group(`[API] ${method} ${path}`);
  console.log('→ URL   :', url.toString());
  if (body) console.log('→ Body  :', body);

  const res = await fetch(url.toString(), options);

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    try {
      const errText = await res.text();
      try { message = JSON.parse(errText)?.message || errText || message; } catch { message = errText || message; }
    } catch {}
    console.error('← Error :', res.status, message);
    console.groupEnd();
    throw new ApiError(message, res.status);
  }

  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = { _raw: text }; } }

  console.log('← Status:', res.status);
  console.log('← Data  :', data);
  console.groupEnd();

  return data;
}

export const apiClient = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
};
