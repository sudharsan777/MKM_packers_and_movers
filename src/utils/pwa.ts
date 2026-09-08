// PWA Global Install Handler for 1-Click Instant App Installation across all devices

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Global listener initialized once on load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export const isAppInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isIosDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const triggerDirectInstall = async (
  onFallbackOpenModal?: () => void
): Promise<'prompted' | 'installed' | 'fallback'> => {
  if (isAppInstalled()) {
    return 'installed';
  }

  if (window.deferredPrompt) {
    try {
      const promptEvent = window.deferredPrompt;
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        window.deferredPrompt = null;
        return 'prompted';
      }
      return 'prompted';
    } catch (err) {
      console.warn('Error during direct PWA prompt:', err);
      if (onFallbackOpenModal) onFallbackOpenModal();
      return 'fallback';
    }
  }

  // If no deferred prompt (e.g. iOS Safari, or manual browser trigger needed)
  if (onFallbackOpenModal) {
    onFallbackOpenModal();
  }
  return 'fallback';
};
