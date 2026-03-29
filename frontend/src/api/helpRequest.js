const BASE = 'http://localhost:8000';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

/** POST /api/v1/request — seeker submits a help request */
export async function createHelpRequest({ message, helperType, categories = [], accessToken }) {
  const res = await fetch(`${BASE}/api/v1/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, helper_type: helperType, categories }),
  });
  return handleResponse(res); // { session_id, status, helper_id, message, helper_type, categories, waiting }
}

/** GET /api/v1/user/sessions — seeker's help sessions with accepted helpers */
export async function getUserSessions(accessToken) {
  const res = await fetch(`${BASE}/api/v1/user/sessions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
  // [{ session_id, status, message, helper_type, created_at, helper, accepted_helpers, acceptance_count }]
}

/** GET /api/v1/helper/open-requests — all pending/open requests a helper can accept */
export async function getOpenRequests(accessToken) {
  const res = await fetch(`${BASE}/api/v1/helper/open-requests`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
  // [{ session_id, user_id, status, message, helper_type, created_at, acceptance_count }]
}

/** GET /api/v1/helper/sessions — sessions this helper has accepted */
export async function getHelperSessions(accessToken) {
  const res = await fetch(`${BASE}/api/v1/helper/sessions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
  // [{ session_id, user_id, status, message, helper_type, created_at, acceptance_count }]
}

/** POST /api/v1/accept/:sessionId — helper accepts a request */
export async function acceptHelpRequest(sessionId, accessToken) {
  const res = await fetch(`${BASE}/api/v1/accept/${sessionId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res); // { message, session_id, acceptance_count }
}

/** GET /api/v1/session/:sessionId — get full session details */
export async function getSession(sessionId, accessToken) {
  const res = await fetch(`${BASE}/api/v1/session/${sessionId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  return handleResponse(res);
}

/** GET /api/v1/websocket/chat/:sessionId/history — load chat history */
export async function getChatHistory(sessionId) {
  const res = await fetch(`${BASE}/api/v1/websocket/chat/${sessionId}/history`);
  return handleResponse(res);
  // [{ id, session_id, role, content, created_at }]
}

/** GET /api/v1/status/:sessionId — poll session status */
export async function getSessionStatus(sessionId) {
  const res = await fetch(`${BASE}/api/v1/status/${sessionId}`);
  return handleResponse(res); // { status, acceptance_count }
}

/** POST /api/v1/close/:sessionId — close a session */
export async function closeSession(sessionId, accessToken) {
  const res = await fetch(`${BASE}/api/v1/close/${sessionId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

/** POST /api/v1/feedback/:sessionId — seeker submits feedback for a closed session */
export async function submitFeedback(sessionId, { rating, feedbackType, note }, accessToken) {
  const res = await fetch(`${BASE}/api/v1/feedback/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ rating, feedback_type: feedbackType, note }),
  });
  return handleResponse(res); // { message }
}

/** GET /api/v1/helper/history — helper's closed sessions with seeker feedback */
export async function getHelperHistory(accessToken) {
  const res = await fetch(`${BASE}/api/v1/helper/history`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
  // { sessions: [...], stats: { total, avg_rating, impressed_rate } }
}

/** DELETE /api/v1/request/:sessionId — seeker deletes a fully-closed request */
export async function deleteHelpRequest(sessionId, accessToken) {
  const res = await fetch(`${BASE}/api/v1/request/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res); // { message }
}

/** POST /api/v1/analyze — analyze conversation to get domain */
export async function analyzeConversation(conversation) {
  const res = await fetch(`${BASE}/api/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation }),
  });
  return handleResponse(res); // { domain: string }
}
