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
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils';
import { useAppContext } from '../../store/AppContext';

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

  const activeLeadsCount = leads.filter((l) => l.status === 'New' || l.status === 'Follow-up').length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'In Transit' || b.status === 'Packing' || b.status === 'Loading'
  ).length;
  const unpaidInvoicesCount = invoices.filter(
    (i) => i.status === 'Unpaid' || i.status === 'Partially Paid' || i.status === 'Overdue'
  ).length;

  const navigationGroups: NavGroup[] = [
    {
      group: 'OPERATIONS & DISPATCH',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        {
          name: 'CRM Leads',
          href: '/leads',
          icon: Contact,
          badge: activeLeadsCount > 0 ? `${activeLeadsCount}` : undefined,
          badgeColor: 'bg-amber-500 text-slate-950',
        },
        { name: 'Customers 360', href: '/customers', icon: Users },
        { name: 'Quotations', href: '/quotations', icon: FileText },
        {
          name: 'Move Orders',
          href: '/bookings',
          icon: Truck,
          badge: activeBookingsCount > 0 ? `${activeBookingsCount}` : undefined,
          badgeColor: 'bg-emerald-500 text-slate-950',
        },
      ],
    },
    {
      group: 'FINANCIAL LEDGER',
      items: [
        {
          name: 'Tax Invoices',
          href: '/invoices',
          icon: Receipt,
          badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { name: 'Payments Ledger', href: '/payments', icon: CreditCard },
        { name: 'Operating Expenses', href: '/expenses', icon: TrendingUp },
      ],
    },
    {
      group: 'INTELLIGENCE & SYSTEM',
      items: [
        { name: 'Business Reports & P&L', href: '/reports', icon: PieChart },
        { name: 'Company Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/80 shrink-0 bg-[#070A12]">
        <img
          src="/logo.png"
          alt="MKM Packers and Movers Logo"
          className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-amber-400/90 shrink-0 bg-white"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-black tracking-wider text-white uppercase truncate">
              MKM PACKERS
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" />
          </div>
          <p className="text-[10px] text-amber-400 font-bold tracking-wide uppercase truncate">
            Enterprise Logistics
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 text-[9px] font-black text-slate-500 tracking-wider uppercase">
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
                      'group flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.2 text-[10px] font-black rounded-full shadow-2xs',
                            isActive ? 'bg-white text-indigo-700' : item.badgeColor || 'bg-slate-700 text-slate-200'
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

      {/* Bottom Profile & PWA Helper */}
      <div className="p-3 border-t border-slate-800/80 shrink-0 bg-[#070A12] space-y-2">
        {onOpenPwaModal && (
          <button
            type="button"
            onClick={onOpenPwaModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Install Desktop App</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400">PWA</span>
          </button>
        )}

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              HQ
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-200 truncate">Dispatch Control</p>
              <p className="text-[10px] text-amber-400/90 font-mono truncate">{settings.phone || '09840546766'}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
            Live
          </span>
        </div>
      </div>
    </aside>
  );
};
