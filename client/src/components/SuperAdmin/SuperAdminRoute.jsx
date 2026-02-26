import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export function SuperAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(API_BASE + '/super-admin/dashboard', {
          credentials: 'include',
        });
        setAuthorized(res.ok);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/admin/!login" replace />;
  }

  return children;
}
