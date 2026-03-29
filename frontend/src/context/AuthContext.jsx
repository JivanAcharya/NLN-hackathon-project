import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { registerUser, registerHelper, loginUser, loginHelper, getMe, getHelperMe, refreshTokens, getErrorMessage } from '../api/endpoints';
import { getStoredAuth, updateStoredTokens, STORAGE_KEY } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
      const saved = getStoredAuth();
      if (saved?.accessToken) {
        const isHelper = saved.role === 'helper';
        const fetchMe = isHelper ? getHelperMe : getMe;
        try {
          const data = await fetchMe();
          setUser({
            userId: isHelper ? data.helper_id : data.user_id,
            username: data.username,
            email: data.email,
            role: saved.role,
            anonId: saved.anonId,
            name: data.username,
            accessToken: saved.accessToken,
            refreshToken: saved.refreshToken,
          });
        } catch (err) {
          // Try to refresh the token
          if (saved.refreshToken) {
            try {
              const tokens = await refreshTokens(saved.refreshToken);
              updateStoredTokens(tokens.access_token, tokens.refresh_token);
              const data = await fetchMe();
              setUser({
                userId: isHelper ? data.helper_id : data.user_id,
                username: data.username,
                email: data.email,
                role: saved.role,
                anonId: saved.anonId,
                name: data.username,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
              });
            } catch {
              localStorage.removeItem(STORAGE_KEY);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const _persist = useCallback((userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      role: userData.role,
      anonId: userData.anonId,
      userId: userData.userId,
    }));
    setUser(userData);
    setError(null);
  }, []);

  // ── Seeker ──────────────────────────────────────────────
  const signupAsSeeker = useCallback(async ({ username, email, password }) => {
    try {
      await registerUser({ username, email, password });
      await loginAsSeeker({ email, password });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const loginAsSeeker = useCallback(async ({ email, password }) => {
    try {
      const tokens = await loginUser({ email, password });
      // Update storage first so getMe can use the token
      const tempAuth = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        role: 'seeker',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempAuth));
      
      const me = await getMe();
      const anonId = Math.floor(1000 + Math.random() * 9000);
      _persist({
        userId: me.user_id,
        username: me.username,
        email: me.email,
        name: me.username,
        role: 'seeker',
        anonId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, [_persist]);

  // ── Helper (uses Helper-specific endpoints) ──
  const signupAsHelper = useCallback(async ({ username, email, password }) => {
    try {
      await registerHelper({ username, email, password });
      await loginAsHelper({ email, password });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const loginAsHelper = useCallback(async ({ email, password }) => {
    try {
      const tokens = await loginHelper({ email, password });
      const tempAuth = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        role: 'helper',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempAuth));
      
      const me = await getHelperMe();
      _persist({
        userId: me.helper_id,
        username: me.username,
        email: me.email,
        name: me.username,
        role: 'helper',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, [_persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setError(null);
  }, []);

  // Expose method to manually refresh token (useful for long sessions)
  const refreshSession = useCallback(async () => {
    const saved = getStoredAuth();
    if (!saved?.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const tokens = await refreshTokens(saved.refreshToken);
      updateStoredTokens(tokens.access_token, tokens.refresh_token);
      setUser(prev => prev ? {
        ...prev,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      } : null);
      return tokens;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => !!user?.accessToken, [user]);

  // Get stored user ID (for API calls that need it)
  const getUserId = useCallback(() => {
    const stored = getStoredAuth();
    return stored?.userId;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated,
    loginAsSeeker,
    signupAsSeeker,
    loginAsHelper,
    signupAsHelper,
    logout,
    refreshSession,
    getUserId,
  }), [user, loading, error, isAuthenticated, loginAsSeeker, signupAsSeeker, loginAsHelper, signupAsHelper, logout, refreshSession, getUserId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
