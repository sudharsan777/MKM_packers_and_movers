import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Receipt,
  FileText,
  Settings as SettingsIcon,
  Database,
  Download,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { isAppInstalled } from '../../utils/pwa';
import { MKM_LOGO_BASE64 } from '../../assets/logo';

export const Sidebar: React.FC<{
  onCloseMobile?: () => void;
  onOpenPwaModal?: () => void;
  onOpenGuideModal?: () => void;
}> = ({ onCloseMobile, onOpenPwaModal, onOpenGuideModal }) => {
  const { settings, invoices, quotations } = useAppContext();
  const { user, isAuthEnabled, logout } = useAuth();
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isAppInstalled());
    const onInst = () => setInstalled(true);
    window.addEventListener('pwa-installed', onInst);
    return () => window.removeEventListener('pwa-installed', onInst);
  }, []);

  const navItems = [
    {
      name: 'Invoices',
      href: '/invoices',
      icon: Receipt,
      badge: invoices.length > 0 ? `${invoices.length}` : undefined,
      badgeColor: 'bg-[#F5EDE2] text-[#9E7B4F] border border-[#DFC9AE]',
    },
    {
      name: 'Quotations',
      href: '/quotations',
      icon: FileText,
      badge: quotations.length > 0 ? `${quotations.length}` : undefined,
      badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
    {
      name: 'Overview',
      href: '/overview',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-white text-slate-700 border-r border-[#EAE5DC] w-64 select-none shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD1] p-1 shadow-xs flex items-center justify-center shrink-0">
            <img
              src={MKM_LOGO_BASE64}
              alt="MKM Packers"
              className="w-full h-full rounded-xl object-contain bg-white"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-extrabold tracking-tight text-[#1A1D20] uppercase truncate">
              MKM PACKERS
            </h1>
            <p className="text-[9px] font-bold text-[#A6937C] tracking-widest uppercase truncate mt-0.5">
              ENTERPRISE SUITE
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center justify-between px-3.5 py-3 text-[13px] rounded-xl font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#F5EDE2]/85 border border-[#DFC9AE]/85 text-[#1A1D20] font-bold shadow-2xs'
                    : 'text-[#6A7888] hover:text-[#1A1D20] hover:bg-[#FAF8F5]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Left Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#9E7B4F] rounded-r-full shadow-2xs" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        'w-4.5 h-4.5 shrink-0 transition-colors',
                        isActive ? 'text-[#9E7B4F]' : 'text-[#8C9CAE] group-hover:text-[#506070]'
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-md leading-none shadow-2xs',
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Direct Install App Button in Sidebar */}
        {!installed && onOpenPwaModal && (
          <div className="pt-4">
            <button
              type="button"
              onClick={onOpenPwaModal}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#DFC9AE] text-[#9E7B4F] font-extrabold text-xs transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>Install MKM App</span>
              </div>
              <span className="text-[10px] bg-[#9E7B4F] text-white px-1.5 py-0.5 rounded-md font-bold">
                1-Click
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Profile & Sync Card */}
      <div className="p-4 border-t border-[#F0EBE1] shrink-0 bg-white space-y-3">
        {/* Offline DB / Cloud Synced Pill */}
        <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-[11px] font-semibold text-[#718292] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#9E7B4F]" />
            <span>Cloud DB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#10B981] font-bold text-[10px]">Synced</span>
          </div>
        </div>

        {/* User Account Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#9E7B4F] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-[#FAF6F0]">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1A1D20] truncate">
                Administrator
              </p>
              <p className="text-[10px] text-[#718292] font-mono truncate">
                {user?.email || 'admin@mkmpackers.com'}
              </p>
            </div>
          </div>

          {isAuthEnabled && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Sign out of MKM Packers & Movers?')) {
                  await logout();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* System Copyright Monospace Footer */}
        <div className="text-center pt-2 border-t border-[#F5F1E8]">
          <p className="text-[9px] font-mono tracking-widest text-[#B5A998] uppercase">
            © 2026 MKM Packers. Royal Suite.
          </p>
        </div>
      </div>
    </aside>
  );
};
