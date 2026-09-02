/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Customers } from './pages/Customers';
import { Quotations } from './pages/Quotations';
import { Bookings } from './pages/Bookings';
import { Invoices } from './pages/Invoices';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export default function App() {
  return (
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
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="customers" element={<Customers />} />
                <Route path="quotations" element={<Quotations />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="payments" element={<Payments />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}
