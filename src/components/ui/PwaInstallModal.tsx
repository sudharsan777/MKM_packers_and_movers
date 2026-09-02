import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Download, CheckCircle2, Share, PlusSquare, Smartphone, Laptop, Sparkles, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'windows' | 'android' | 'ios'>('auto');

  useEffect(() => {
    // Detect iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setActiveTab('ios');
    }

    // Detect standalone mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setActiveTab('auto');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
        onClose();
      } catch (err) {
        console.error('PWA Install prompt error:', err);
      }
    } else if (isIOS) {
      setActiveTab('ios');
    } else {
      setActiveTab('windows');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('mkm_pwa_dismissed', 'true');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install MKM Packers"
      subtitle="Install the app for quick access to your business dashboard, leads, bookings and invoices."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <img
            src="/logo.png"
            alt="MKM Logo"
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400 bg-white shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white leading-snug">MKM Packers & Movers</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PWA Standalone
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
              Operations, Dispatch & Tax Billing
            </p>
          </div>
          {isStandalone && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
              Installed
            </span>
          )}
        </div>

        {/* Benefits List */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Direct launch from Windows Taskbar, macOS Dock, or Phone Home Screen</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Clean, full-screen standalone workspace without browser URL bars</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fast instant startup with offline application shell caching</span>
          </div>
        </div>

        {/* Platform Step-by-Step Instructions */}
        <div className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900">Platform Guide:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('windows')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'windows' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Windows / Desktop
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'android' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'ios' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                iOS Safari
              </button>
            </div>
          </div>

          {activeTab === 'windows' && (
            <div className="text-slate-600 space-y-1 leading-relaxed">
              <p>1. In Google Chrome or Microsoft Edge, look at the address bar.</p>
              <p>2. Click the <span className="font-bold text-slate-900">Install icon (⊕)</span> or menu (⋮) → <span className="font-bold text-slate-900">"Install MKM Packers"</span>.</p>
              <p>3. Click <span className="font-bold text-slate-900">Install</span> to pin to your Windows Taskbar or Desktop.</p>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="text-slate-600 space-y-1 leading-relaxed">
              <p>1. In Google Chrome on Android, tap the menu (<span className="font-bold text-slate-900">⋮</span>) at top right.</p>
              <p>2. Select <span className="font-bold text-slate-900">"Install App"</span> or <span className="font-bold text-slate-900">"Add to Home screen"</span>.</p>
              <p>3. Tap <span className="font-bold text-slate-900">Add</span> to place the MKM icon on your home screen.</p>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="text-slate-600 space-y-1.5 leading-relaxed">
              <p>1. <span className="font-bold text-slate-900">Tap Share</span> (<Share className="w-3 h-3 inline mx-1 text-indigo-600" />) at the bottom of Safari.</p>
              <p>2. <span className="font-bold text-slate-900">Choose Add to Home Screen</span> (<PlusSquare className="w-3 h-3 inline mx-1 text-slate-800" />).</p>
              <p>3. <span className="font-bold text-slate-900">Tap Add</span> in the top-right corner.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={handleDismiss}>
            Not Now
          </Button>
          {deferredPrompt ? (
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleInstallClick}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Install App
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={onClose}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Got It
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
