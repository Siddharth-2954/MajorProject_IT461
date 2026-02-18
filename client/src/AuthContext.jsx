import React, { createContext, useState, useEffect } from 'react';

const API_BASE = ('http://localhost:8000');

export const AuthContext = createContext({ user: null, setUser: () => {}, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth_user', JSON.stringify(user));
      else localStorage.removeItem('auth_user');
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    // On mount, verify session with server
    async function check() {
      try {
        const res = await fetch(API_BASE + '/auth/me', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.authenticated) setUser(json.user || json.admin);
          else setUser(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    check();
  }, []);

  const logout = async () => {
    try {
      await fetch(API_BASE + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore network/logout errors; client state is still cleared
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
