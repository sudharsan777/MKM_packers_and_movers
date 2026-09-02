import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Truck } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthEnabled } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src="/logo.png"
              alt="MKM Packers & Movers"
              className="w-16 h-16 rounded-full object-cover shadow-2xl ring-4 ring-amber-400/90 bg-white"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full text-white shadow-md">
              <Truck className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-sm font-black tracking-wider text-white uppercase">
              MKM PACKERS & MOVERS
            </h2>
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-widest">
              Securing Session...
            </p>
          </div>

          <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-amber-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // If Firebase Authentication is active and the user is not signed in, redirect to /login
  if (isAuthEnabled && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
