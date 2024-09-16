import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import { isSessionExpired } from './api'; // Pastikan path import sesuai

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (isSessionExpired()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (!isSessionExpired()) {
    return <Navigate to={from} replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;