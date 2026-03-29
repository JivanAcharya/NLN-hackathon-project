import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = 'mw_auth';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get tokens from storage
function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Helper to update tokens in storage
function updateStoredTokens(accessToken, refreshToken) {
  const stored = getStoredAuth();
  if (stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...stored,
      accessToken,
      refreshToken,
    }));
  }
}

// Refresh token function
async function refreshAccessToken() {
  const stored = getStoredAuth();
  if (!stored?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh-token`, {
    refresh_token: stored.refreshToken,
  });

  const { access_token, refresh_token } = response.data;
  updateStoredTokens(access_token, refresh_token);
  return access_token;
}

// Request interceptor - add access token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const stored = getStoredAuth();
    if (stored?.accessToken) {
      config.headers.Authorization = `Bearer ${stored.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors and refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for login/refresh endpoints
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear storage and redirect to login
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL, STORAGE_KEY, getStoredAuth, updateStoredTokens };
