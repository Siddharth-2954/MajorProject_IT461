import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const API_BASE = 'http://localhost:8000';

export function SuperAdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(API_BASE + '/admin/me', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.admin) {
            setAdmin(json.admin);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>;
  }

  // Check if the user is authenticated and is a super admin
  if (!admin || admin.role !== 'super_admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
