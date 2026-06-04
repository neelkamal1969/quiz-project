import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../lib/constants';

// Guards routes that require authentication. Redirects to the login page when
// the user is not signed in. Centralises the redirect logic that pages used to
// each implement themselves.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return children;
}
