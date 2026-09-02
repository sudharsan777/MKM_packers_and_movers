import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import {
  Bell,
  Search,
  Plus,
  Menu,
  X,
  Download,
  FileText,
  Truck,
  Receipt,
  UserPlus,
  ChevronDown,
  LayoutDashboard,
  Contact,
  Clock,
  ExternalLink,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PwaInstallModal } from '../ui/PwaInstallModal';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { NotificationService } from '../../services/notification.service';
import { cn } from '../../utils';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { leads, bookings, invoices, quotations, settings } = useAppContext();
  const { user, logout, isAuthEnabled } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleUpdate = (e: any) => {
      if (e.detail?.registration) {
        setSwReg(e.detail.registration);
        setUpdateAvailable(true);
      }
    };
    window.addEventListener('mkm-sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mkm-sw-update-available', handleUpdate);
    };
  }, []);

  const handleUpdateNow = () => {
    if (swReg?.waiting) {
      swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return { title: 'Executive Overview', desc: 'Real-time logistics dispatch, collections & move orders' };
    if (path === '/leads') return { title: 'Leads & Enquiries', desc: 'Manage incoming relocation requests and customer prospects' };
    if (path === '/customers') return { title: 'Customers Directory', desc: 'Client records, past moves, and ledger history' };
    if (path === '/quotations') return { title: 'Quotations & Estimates', desc: 'Create, manage, and export professional PDF moving estimates' };
    if (path === '/bookings') return { title: 'Move Orders & Dispatch', desc: 'Vehicle assignments, crew allocation & shipment tracking' };
    if (path === '/invoices') return { title: 'Tax Invoices & Billing', desc: 'GST-compliant invoices, payment tracking & PDF export' };
    if (path === '/payments') return { title: 'Payments Ledger', desc: 'UPI, Cash, and Bank settlements ledger' };
    if (path === '/expenses') return { title: 'Operating Expenses', desc: 'Logistics overhead, fuel, labour, and maintenance records' };
    if (path === '/reports') return { title: 'Business Analytics & P&L', desc: 'Financial performance, margins, and operational KPIs' };
    if (path === '/settings') return { title: 'Company Settings', desc: 'Company profile, branding logo, GST details & pricing rates' };
    return { title: 'MKM Packers & Movers', desc: 'Logistics Management Platform' };
  };

  const pageInfo = getPageInfo();

  const businessAlerts = NotificationService.getBusinessAlerts({
    bookings,
    invoices,
    leads,
    quotations,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar onOpenPwaModal={() => setIsPwaModalOpen(true)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B0F19] z-10 shadow-2xl">
            <div className="absolute top-3.5 right-3.5">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              onOpenPwaModal={() => {
                setMobileMenuOpen(false);
                setIsPwaModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col flex-1 lg:pl-64 min-w-0">
        {/* PWA Update Banner */}
        {updateAvailable && (
          <div className="bg-slate-900 text-amber-400 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-semibold z-30">
            <span>A new version is ready. Update now to apply latest improvements.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateNow}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Update Now
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Left Page Context */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {pageInfo.title}
                </h1>
                <p className="text-xs text-slate-500 font-normal hidden sm:block truncate">
                  {pageInfo.desc}
                </p>
              </div>
            </div>

            {/* Right Action Toolbar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Search Trigger */}
              <button
                id="btn-global-search"
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs"
                title="Search (Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline text-slate-500">Quick search...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white text-slate-400 rounded border border-slate-200 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Install PWA Button */}
              <button
                id="btn-install-pwa"
                onClick={() => setIsPwaModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 cursor-pointer transition-colors shadow-2xs"
                title="Install PWA"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>App</span>
              </button>

              {/* Business Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  aria-label="Alerts"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {businessAlerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-200/90 py-2 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-900">Operational Alerts</span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {businessAlerts.length} Active
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {businessAlerts.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 space-y-1">
                            <Clock className="w-5 h-5 mx-auto text-slate-300 stroke-1" />
                            <p className="font-semibold text-slate-600">All Operations Clear</p>
                            <p className="text-[11px]">No overdue invoices or pending moves.</p>
                          </div>
                        ) : (
                          businessAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate(alert.link);
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer transition-colors space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`font-semibold text-xs ${
                                  alert.type === 'urgent' ? 'text-rose-700' : 'text-slate-900'
                                }`}>
                                  {alert.title}
                                </span>
                                {alert.actionLabel && (
                                  <span className="text-[10px] font-semibold text-slate-600 hover:underline flex items-center gap-0.5">
                                    {alert.actionLabel}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">{alert.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Create Dropdown */}
              <div className="relative">
                <Button
                  id="btn-quick-add"
                  size="sm"
                  variant="primary"
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  rightIcon={<ChevronDown className="w-3 h-3 text-slate-400" />}
                  className="px-3 font-semibold shadow-subtle"
                >
                  <span className="hidden sm:inline">New</span>
                </Button>

                {quickAddOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setQuickAddOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-elevated border border-slate-200/90 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Quick Create
                      </div>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/leads');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lead Enquiry</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/quotations');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Quotation</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/bookings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Move Order</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/invoices');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tax Invoice</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* User Account & Sign Out */}
              {isAuthEnabled && user && (
                <div className="hidden sm:flex items-center pl-2 border-l border-slate-200 gap-1.5">
                  <div className="flex items-center gap-2 bg-slate-50 py-1 px-2.5 rounded-xl border border-slate-200/80 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium text-slate-700 max-w-[120px] truncate text-[11px]" title={user.email || ''}>
                      {user.email}
                    </span>
                  </div>

                  <button
                    id="btn-header-signout"
                    onClick={async () => {
                      if (window.confirm('Sign out of MKM Packers & Movers?')) {
                        await logout();
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex justify-around items-center">
        {[
          { name: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
          { name: 'Leads', href: '/leads', icon: <Contact className="w-4.5 h-4.5" /> },
          { name: 'Quotes', href: '/quotations', icon: <FileText className="w-4.5 h-4.5" /> },
          { name: 'Orders', href: '/bookings', icon: <Truck className="w-4.5 h-4.5" /> },
          { name: 'Invoices', href: '/invoices', icon: <Receipt className="w-4.5 h-4.5" /> },
        ].map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all',
                isActive ? 'text-slate-900 font-bold bg-slate-100' : 'text-slate-400 hover:text-slate-700'
              )
            }
          >
            {tab.icon}
            <span className="mt-0.5">{tab.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* PWA & Global Search Modals */}
      <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
};
