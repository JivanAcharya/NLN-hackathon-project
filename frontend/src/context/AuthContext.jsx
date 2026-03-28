import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY = 'mw_auth';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.accessToken) {
      getMe(saved.accessToken)
        .then(data => {
          setUser({
            username: data.username,
            email: data.email,
            role: saved.role,
            anonId: saved.anonId,
            name: data.username,
            accessToken: saved.accessToken,
            refreshToken: saved.refreshToken,
          });
        })
        .catch(() => localStorage.removeItem(STORAGE_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function _persist(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      role: userData.role,
      anonId: userData.anonId,
    }));
    setUser(userData);
  }

  // ── Seeker ──────────────────────────────────────────────
  async function signupAsSeeker({ username, email, password }) {
    await registerUser({ username, email, password });
    await loginAsSeeker({ email, password });
  }

  async function loginAsSeeker({ email, password }) {
    const tokens = await loginUser({ email, password });
    const me = await getMe(tokens.access_token);
    const anonId = Math.floor(1000 + Math.random() * 9000);
    _persist({
      username: me.username,
      email: me.email,
      name: me.username,
      role: 'seeker',
      anonId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  }

  // ── Helper (shares User endpoints; role stored client-side) ──
  async function signupAsHelper({ username, email, password }) {
    await registerUser({ username, email, password });
    await loginAsHelper({ email, password });
  }

  async function loginAsHelper({ email, password }) {
    const tokens = await loginUser({ email, password });
    const me = await getMe(tokens.access_token);
    _persist({
      username: me.username,
      email: me.email,
      name: me.username,
      role: 'helper',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginAsSeeker,
      signupAsSeeker,
      loginAsHelper,
      signupAsHelper,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
