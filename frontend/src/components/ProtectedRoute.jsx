import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminRequired = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth status, show nothing (prevents flash redirect)
  if (loading) {
    return <div className="container py-8" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminRequired && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
