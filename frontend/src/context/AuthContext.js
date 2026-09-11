'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken('');
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(() => {
    const staff = ['admin', 'moderator', 'treasurer'];
    return {
      user,
      ready,
      isLoggedIn: Boolean(user),
      isStaff: Boolean(user && staff.includes(user.role)),
      isBlogger: Boolean(user && (user.role === 'blogger' || user.role === 'admin')),
      async login(email, password) {
        const data = await api('/auth/login', { method: 'POST', body: { email, password } });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await api('/auth/register', { method: 'POST', body: payload });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await api('/auth/logout', { method: 'POST' });
        } catch {
          /* ignore */
        }
        setToken('');
        setUser(null);
      }
    };
  }, [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
