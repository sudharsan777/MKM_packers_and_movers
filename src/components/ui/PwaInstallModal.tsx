import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  Smartphone,
  Laptop,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { isAppInstalled, isIosDevice, triggerDirectInstall } from '../../utils/pwa';
import { MKM_LOGO_BASE64 } from '../../assets/logo';

export const PwaInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasDirectPrompt, setHasDirectPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    setIsInstalled(isAppInstalled());
    const ios = isIosDevice();
    setIsIOS(ios);
    setHasDirectPrompt(Boolean(window.deferredPrompt));

    if (ios) {
      setActiveTab('ios');
    } else if (/Android/.test(navigator.userAgent)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    const onPromptReady = () => setHasDirectPrompt(true);
    const onInstalled = () => {
      setIsInstalled(true);
      setHasDirectPrompt(false);
    };

    window.addEventListener('pwa-prompt-ready', onPromptReady);
    window.addEventListener('pwa-installed', onInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', onPromptReady);
      window.removeEventListener('pwa-installed', onInstalled);
    };
  }, [isOpen]);

  const handleDirectInstall = async () => {
    const res = await triggerDirectInstall();
    if (res === 'prompted' || res === 'installed') {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant App Installation"
      subtitle="Download & install MKM Packers directly to your home screen or desktop for 1-click access."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Brand App Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#1A1D20] text-white border border-[#2D3238] shadow-md">
          <img
            src={MKM_LOGO_BASE64}
            alt="MKM Logo"
            className="w-12 h-12 rounded-xl object-contain ring-2 ring-[#9E7B4F] bg-white shrink-0 p-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white leading-snug truncate">
                MKM Packers & Movers
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6F0] text-[#9E7B4F]">
                Official App
              </span>
            </div>
            <p className="text-[11px] text-[#A0AEC0] font-medium truncate mt-0.5">
              Instant offline access, Invoices & Quotations
            </p>
          </div>
          {isInstalled && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
              Installed ✓
            </span>
          )}
        </div>

        {/* Direct 1-Click Install Button if supported */}
        {hasDirectPrompt && !isInstalled && (
          <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#DFC9AE] space-y-2 text-center">
            <p className="text-xs font-bold text-[#1A1D20]">
              Direct Install is ready for your device!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleDirectInstall}
              leftIcon={<Download className="w-4 h-4 text-white" />}
              className="w-full font-bold bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white py-2.5 rounded-xl shadow-xs"
            >
              1-Click Download & Install App
            </Button>
          </div>
        )}

        {/* Platform Step-by-Step Instructions */}
        <div className="border border-[#EAE5DC] rounded-xl p-3.5 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
            <span className="font-bold text-[#1A1D20]">Installation Guide:</span>
            <div className="flex bg-[#FAF8F5] p-0.5 rounded-lg border border-[#EAE5DC]">
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-[#1A1D20] text-white shadow-2xs'
                    : 'text-[#718292]'
                }`}
              >
                PC / Laptop
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-[#1A1D20] text-white shadow-2xs'
                    : 'text-[#718292]'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-[#1A1D20] text-white shadow-2xs'
                    : 'text-[#718292]'
                }`}
              >
                iPhone / iPad
              </button>
            </div>
          </div>

          {activeTab === 'desktop' && (
            <div className="text-[#506070] space-y-2 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  1
                </span>
                <p>
                  In Chrome or Edge, click the <span className="font-bold text-[#1A1D20]">Install (⊕)</span> button in the address bar at the top right.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  2
                </span>
                <p>
                  Click <span className="font-bold text-[#1A1D20]">"Install"</span> when prompted to add MKM Packers to your Windows Desktop or Taskbar.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="text-[#506070] space-y-2 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  1
                </span>
                <p>
                  In Chrome, tap the <span className="font-bold text-[#1A1D20]">menu (⋮)</span> icon at the top right corner.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  2
                </span>
                <p>
                  Tap <span className="font-bold text-[#1A1D20]">"Install App"</span> or <span className="font-bold text-[#1A1D20]">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="text-[#506070] space-y-2 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  1
                </span>
                <p>
                  In Safari, tap the <span className="font-bold text-[#1A1D20]">Share</span> button (<Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />) at the bottom toolbar.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  2
                </span>
                <p>
                  Scroll down and tap <span className="font-bold text-[#1A1D20]">"Add to Home Screen"</span> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-800" />).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F0] text-[#9E7B4F] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#DFC9AE]">
                  3
                </span>
                <p>
                  Tap <span className="font-bold text-[#1A1D20]">"Add"</span> in the top right corner. The MKM App icon will appear on your home screen!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DC] text-[#718292]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Opens directly in full-screen mode like a native mobile app</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fast instant startup & offline database support</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Close
          </Button>
          {hasDirectPrompt && !isInstalled ? (
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleDirectInstall}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="bg-[#9E7B4F] hover:bg-[#8A6A3E]"
            >
              Install Now
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={onClose}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="bg-[#1A1D20] hover:bg-black text-white"
            >
              Got It
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
