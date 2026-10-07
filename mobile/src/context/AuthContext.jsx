import { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, clearToken, getToken, api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (token, userData) => {
    await saveToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
