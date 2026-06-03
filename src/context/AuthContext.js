import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

// 🔌 Replace with your backend URL (see SETUP.md)
export const API_BASE_URL = 'http://192.168.0.103:5000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('jwt');
        const u = await SecureStore.getItemAsync('user');
        if (t && u) { setToken(t); setUser(JSON.parse(u)); }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (email, password) => {
    const res  = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    await _save(data.token, data.user);
  };

  const register = async (name, handle, email, password) => {
    const res  = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, handle, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    await _save(data.token, data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('user');
    setToken(null); setUser(null);
  };

  const _save = async (tok, usr) => {
    await SecureStore.setItemAsync('jwt', tok);
    await SecureStore.setItemAsync('user', JSON.stringify(usr));
    setToken(tok); setUser(usr);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
