import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({ user: null, setUser: () => {}, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // persist to localStorage for quick UI state; server is the source of truth
    try {
      if (user) localStorage.setItem('auth_user', JSON.stringify(user));
      else localStorage.removeItem('auth_user');
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    // On mount, verify session with server
    async function check() {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:8000' + '/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.authenticated) setUser(json.user);
          else setUser(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    check();
  }, []);

  const logout = async () => {
    try {
      await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8000') + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
