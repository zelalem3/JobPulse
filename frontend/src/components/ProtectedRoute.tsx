import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Grab the current authentication state from your global store
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  // If there is no token, the user is unauthenticated
  if (!token) {
    // Redirect them to the login page, but save the current location they 
    // were trying to go to using the state property.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the token exists, render the protected page content
  return <>{children}</>;
}