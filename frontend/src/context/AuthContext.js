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
      isMember: Boolean(user && (user.role === 'admin' || user.memberStatus === 'approved')),
      isPendingMember: Boolean(user && user.memberStatus === 'pending'),
      async login(email, password) {
        const data = await api('/auth/login', { method: 'POST', body: { email, password } });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async join(payload) {
        const data = await api('/membership', { method: 'POST', body: payload });
        if (data.token) setToken(data.token);
        if (data.user) setUser(data.user);
        return data;
      },
      async applyToken(token) {
        setToken(token);
        const data = await api('/auth/me');
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
