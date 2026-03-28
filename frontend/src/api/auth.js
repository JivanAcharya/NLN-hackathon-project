const BASE = 'http://localhost:8000';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

/** POST /api/v1/auth/register */
export async function registerUser({ username, email, password }) {
  const res = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

/** POST /api/v1/auth/login/access-token  (OAuth2 form-encoded) */
export async function loginUser({ email, password }) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/api/v1/auth/login/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return handleResponse(res); // { access_token, refresh_token, token_type }
}

/** POST /api/v1/auth/refresh-token */
export async function refreshTokens(refreshToken) {
  const res = await fetch(`${BASE}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse(res);
}

/** GET /api/v1/auth/users/me */
export async function getMe(accessToken) {
  const res = await fetch(`${BASE}/api/v1/auth/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res); // { username, email }
}
