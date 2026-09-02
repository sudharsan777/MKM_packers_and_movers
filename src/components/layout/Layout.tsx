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
  Sparkles,
  Phone,
  LayoutDashboard,
  Contact,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PwaInstallModal } from '../ui/PwaInstallModal';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { useAppContext } from '../../store/AppContext';
import { NotificationService } from '../../services/notification.service';
import { cn } from '../../utils';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { leads, bookings, invoices, quotations, settings } = useAppContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);

  // Global Keyboard Shortcut for Search (Cmd+K / Ctrl+K)
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
    if (path === '/') return { title: 'Operational Dashboard', desc: 'Real-time dispatch overview, cash collections & moving status' };
    if (path === '/leads') return { title: 'Relocation Enquiries', desc: 'Direct client calls, WhatsApp updates & rapid quotes' };
    if (path === '/customers') return { title: 'Customer Directory', desc: 'Comprehensive customer records, past moves & ledger balances' };
    if (path === '/quotations') return { title: 'Quotations & Estimates', desc: 'Generate, customize, and export professional PDF quotes' };
    if (path === '/bookings') return { title: 'Shifting Orders & Dispatch', desc: 'Driver assignments, vehicle tracking & move execution' };
    if (path === '/invoices') return { title: 'Tax Invoices & Billing', desc: 'GST compliant invoices, 1-click PDF download & settlements' };
    if (path === '/payments') return { title: 'Payments Ledger', desc: 'UPI, Cash, and Bank settlement records' };
    if (path === '/expenses') return { title: 'Operating Expenses', desc: 'Fuel, labour, truck maintenance & logistics overheads' };
    if (path === '/reports') return { title: 'Business Analytics & P&L', desc: 'Revenue analysis, cost breakdown & profit margins' };
    if (path === '/settings') return { title: 'Company Settings', desc: 'Branding, registered address, GSTIN & default pricing' };
    return { title: 'MKM Packers & Movers', desc: 'Logistics Management Platform' };
  };

  const pageInfo = getPageInfo();

  // Dynamic business alerts from actual data
  const businessAlerts = NotificationService.getBusinessAlerts({
    bookings,
    invoices,
    leads,
    quotations,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar onOpenPwaModal={() => setIsPwaModalOpen(true)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
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
          <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-bold shadow-sm z-30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>New version available. Update now to load the latest features.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateNow}
                className="bg-slate-950 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Update now
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-slate-900 hover:text-slate-950 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shrink-0 shadow-2xs">
          <div className="flex-1 px-3.5 sm:px-6 flex items-center justify-between gap-3">
            {/* Left Header Title & Mobile Hamburger */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img
                src="/logo.png"
                alt="MKM Logo"
                className="w-8 h-8 rounded-full object-cover shadow-2xs ring-2 ring-amber-400 shrink-0 lg:hidden"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate leading-tight">
                  {pageInfo.title}
                </h1>
                <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate">
                  {pageInfo.desc}
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Global Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 h-9 px-3 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                title="Global Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Search records...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Install PWA Button */}
              <button
                id="btn-install-pwa"
                onClick={() => setIsPwaModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 cursor-pointer transition-colors shadow-2xs"
                title="Install App"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Install App</span>
              </button>

              {/* Real Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  aria-label="Business Alerts"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {businessAlerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <span className="font-extrabold text-slate-900">Operational Alerts</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {businessAlerts.length} Active
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {businessAlerts.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 space-y-1">
                            <Clock className="w-6 h-6 mx-auto text-slate-300 stroke-1" />
                            <p className="font-bold text-slate-600">All Operations Smooth</p>
                            <p className="text-[11px]">No overdue invoices or pending moves today.</p>
                          </div>
                        ) : (
                          businessAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate(alert.link);
                              }}
                              className="p-3 hover:bg-slate-50/80 cursor-pointer transition-colors space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`font-bold text-xs ${
                                  alert.type === 'urgent' ? 'text-rose-700' : 'text-slate-900'
                                }`}>
                                  {alert.title}
                                </span>
                                {alert.actionLabel && (
                                  <span className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
                                    {alert.actionLabel}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Add Dropdown */}
              <div className="relative">
                <Button
                  id="btn-quick-add"
                  size="sm"
                  variant="primary"
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
                  rightIcon={<ChevronDown className="w-3 h-3 text-white/80" />}
                  className="px-3 sm:px-3.5 font-extrabold shadow-2xs"
                >
                  <span className="hidden sm:inline">Create</span>
                </Button>

                {quickAddOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setQuickAddOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase text-slate-400">
                        Quick Actions
                      </div>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/leads');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-600" />
                        <span>New Lead Enquiry</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/quotations');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>New Quotation</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/bookings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-indigo-600" />
                        <span>New Booking</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickAddOpen(false);
                          navigate('/invoices');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        <span>New Tax Invoice</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex justify-around items-center">
        {[
          { name: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'Leads', href: '/leads', icon: <Contact className="w-5 h-5" /> },
          { name: 'Quotes', href: '/quotations', icon: <FileText className="w-5 h-5" /> },
          { name: 'Orders', href: '/bookings', icon: <Truck className="w-5 h-5" /> },
          { name: 'Invoices', href: '/invoices', icon: <Receipt className="w-5 h-5" /> },
        ].map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all',
                isActive ? 'text-indigo-700 font-extrabold bg-indigo-50' : 'text-slate-500 hover:text-slate-900'
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
