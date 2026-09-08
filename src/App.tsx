import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Quotations } from './pages/Quotations';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Operations Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/invoices" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="quotations" element={<Quotations />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/invoices" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

