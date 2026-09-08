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
  Settings,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PwaInstallModal } from '../ui/PwaInstallModal';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { NotificationService } from '../../services/notification.service';
import { cn } from '../../utils';
import { triggerDirectInstall, isAppInstalled } from '../../utils/pwa';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoices, quotations, settings } = useAppContext();
  const { user, logout, isAuthEnabled } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Keyboard shortcut for search & PWA status
  useEffect(() => {
    setIsInstalled(isAppInstalled());
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

    const handlePwaInstalled = () => {
      setIsInstalled(true);
    };
    window.addEventListener('pwa-installed', handlePwaInstalled);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mkm-sw-update-available', handleUpdate);
      window.removeEventListener('pwa-installed', handlePwaInstalled);
    };
  }, []);

  const handleUpdateNow = () => {
    if (swReg?.waiting) {
      swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const handleInstallAppClick = async () => {
    await triggerDirectInstall(() => setIsPwaModalOpen(true));
  };

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/overview')
      return {
        title: 'Business Overview & Totals',
        desc: 'Consolidated revenue, invoices & quotation metrics',
      };
    if (path === '/quotations')
      return {
        title: 'Quotation Estimates',
        desc: 'Create, manage, print and share formal moving quotations',
      };
    if (path === '/settings')
      return {
        title: 'Company Settings',
        desc: 'Company profile, branding, contacts, address & default terms',
      };
    return {
      title: 'Tax Invoices & Billing',
      desc: 'Generate, store, print and share official MKM Packers & Movers invoices',
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar
          onOpenPwaModal={handleInstallAppClick}
          onOpenGuideModal={() => setIsPwaModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
            <Sidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              onOpenPwaModal={() => {
                setMobileMenuOpen(false);
                handleInstallAppClick();
              }}
              onOpenGuideModal={() => {
                setMobileMenuOpen(false);
                setIsPwaModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* PWA Update Banner */}
        {updateAvailable && (
          <div className="bg-slate-900 text-cyan-400 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-semibold z-30">
            <span>A new version is ready. Update now to apply latest improvements.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateNow}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Update Now
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#EAE5DC] px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            {/* Left Page Title & Mobile Toggle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black text-[#1A1D20] tracking-tight truncate">
                  {pageInfo.title}
                </h1>
                <p className="text-[11px] text-[#718292] font-medium hidden sm:block truncate">
                  {pageInfo.desc}
                </p>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">
              {/* Search Shortcut */}
              <button
                id="btn-global-search"
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#718292] bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#EAE5DC] rounded-xl transition-colors cursor-pointer"
                title="Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline-block text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#DFC9AE] text-[#9E7B4F]">
                  ⌘K
                </kbd>
              </button>

              {/* Direct Instant Install App Button */}
              {!isInstalled && (
                <button
                  id="btn-install-pwa"
                  onClick={handleInstallAppClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-[#9E7B4F] hover:bg-[#8A6A3E] active:scale-95 border border-[#8A6A3E] rounded-xl transition-all cursor-pointer shadow-xs"
                  title="Direct Download & Install MKM App on your device"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}

              {/* User Account / Sign Out */}
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-[#EAE5DC]">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-[#1A1D20] truncate max-w-[140px]">
                      {user.displayName || 'MKM Staff'}
                    </span>
                    <span className="text-[10px] text-[#718292] truncate max-w-[140px]">
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
        <main className="flex-1 pb-20 lg:pb-8 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE5DC] shadow-lg px-2 py-1.5 flex justify-around items-center">
        {[
          { name: 'Invoices', href: '/invoices', icon: <Receipt className="w-4.5 h-4.5" /> },
          { name: 'Quotations', href: '/quotations', icon: <FileText className="w-4.5 h-4.5" /> },
          { name: 'Overview', href: '/overview', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
          { name: 'Settings', href: '/settings', icon: <Settings className="w-4.5 h-4.5" /> },
        ].map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
                isActive
                  ? 'text-[#9E7B4F] font-extrabold bg-[#F5EDE2] shadow-2xs'
                  : 'text-[#718292] hover:text-[#1A1D20]'
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
