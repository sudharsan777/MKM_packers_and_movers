import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Truck,
  Receipt,
  CreditCard,
  TrendingUp,
  Settings,
  Contact,
  PieChart,
  Download,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';

interface NavGroup {
  group: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<{
  onCloseMobile?: () => void;
  onOpenPwaModal?: () => void;
}> = ({ onCloseMobile, onOpenPwaModal }) => {
  const { settings, leads, bookings, invoices } = useAppContext();
  const { user, isAuthEnabled, logout } = useAuth();

  const activeLeadsCount = leads.filter((l) => l.status === 'New' || l.status === 'Follow-up').length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'In Transit' || b.status === 'Packing' || b.status === 'Loading'
  ).length;
  const unpaidInvoicesCount = invoices.filter(
    (i) => i.status === 'Unpaid' || i.status === 'Partially Paid' || i.status === 'Overdue'
  ).length;

  const navigationGroups: NavGroup[] = [
    {
      group: 'OPERATIONS',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        {
          name: 'Leads & Enquiries',
          href: '/leads',
          icon: Contact,
          badge: activeLeadsCount > 0 ? `${activeLeadsCount}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
        { name: 'Customers Directory', href: '/customers', icon: Users },
        {
          name: 'Move Orders',
          href: '/bookings',
          icon: Truck,
          badge: activeBookingsCount > 0 ? `${activeBookingsCount}` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
    {
      group: 'FINANCE & BILLING',
      items: [
        {
          name: 'Tax Invoices',
          href: '/invoices',
          icon: Receipt,
          badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        },
        { name: 'Quotations', href: '/quotations', icon: FileText },
        { name: 'Payments Ledger', href: '/payments', icon: CreditCard },
        { name: 'Operating Expenses', href: '/expenses', icon: TrendingUp },
      ],
    },
    {
      group: 'ANALYTICS & SYSTEM',
      items: [
        { name: 'Business Reports', href: '/reports', icon: PieChart },
        { name: 'Company Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4.5 py-4.5 border-b border-slate-800/80 shrink-0 bg-[#070A12]">
        <img
          src="/logo.png"
          alt="MKM Packers and Movers"
          className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400/80 bg-white shrink-0 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-bold tracking-wider text-white uppercase truncate">
              MKM PACKERS
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Online" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase truncate">
            Enterprise Logistics
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all duration-150',
                      isActive
                        ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full" />
                      )}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none shadow-2xs',
                            item.badgeColor || 'bg-slate-800 text-slate-300'
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
          </div>
        ))}
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-slate-800/80 shrink-0 bg-[#070A12] space-y-2">
        {onOpenPwaModal && (
          <button
            type="button"
            onClick={onOpenPwaModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">Install Desktop App</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">PWA</span>
          </button>
        )}

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                HQ
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-200 truncate">
                  {user?.email || 'MKM Dispatch'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{settings.phone || '09840546766'}</p>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded shrink-0">
              Live
            </span>
          </div>

          {isAuthEnabled && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Sign out of MKM Packers & Movers?')) {
                  await logout();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 text-[11px] font-medium rounded-lg transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
