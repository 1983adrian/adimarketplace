import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isStandalone: boolean;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isMacOS: false,
    isWindows: false,
    isStandalone: false
  });

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMacOS = /macintosh|mac os x/.test(userAgent) && !isIOS;
    const isWindows = /windows/.test(userAgent);
    
    // Check if running as standalone (installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isMacOS,
      isWindows,
      isStandalone,
      isInstalled: isStandalone
    }));

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true,
        isStandalone: true
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, reason: 'No install prompt available' };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, isInstallable: false }));
        return { success: true, outcome };
      }
      
      return { success: false, outcome };
    } catch (error) {
      return { success: false, reason: 'Prompt failed' };
    }
  }, [deferredPrompt]);

  const getInstallInstructions = useCallback(() => {
    if (state.isIOS) {
      return {
        platform: 'iOS',
        steps: [
          'Apasă pe butonul "Share" (pătratul cu săgeată)',
          'Derulează și apasă "Add to Home Screen"',
          'Confirmă cu "Add"'
        ],
        icon: 'share'
      };
    }
    
    if (state.isAndroid) {
      return {
        platform: 'Android',
        steps: [
          'Apasă pe meniul browserului (⋮)',
          'Selectează "Add to Home screen" sau "Install app"',
          'Confirmă instalarea'
        ],
        icon: 'menu'
      };
    }

    if (state.isMacOS) {
      return {
        platform: 'macOS',
        steps: [
          'Deschide Chrome sau Safari',
          'Click pe iconița de instalare din bara de adrese sau File → Add to Dock',
          'Confirmă instalarea'
        ],
        icon: 'laptop'
      };
    }

    if (state.isWindows) {
      return {
        platform: 'Windows',
        steps: [
          'Deschide Chrome sau Edge',
          'Click pe iconița de instalare din bara de adrese',
          'Confirmă instalarea'
        ],
        icon: 'monitor'
      };
    }

    return {
      platform: 'Desktop',
      steps: [
        'Click pe iconița de instalare din bara de adrese',
        'Sau apasă butonul "Instalează" de mai jos',
        'Confirmă instalarea'
      ],
      icon: 'download'
    };
  }, [state.isIOS, state.isAndroid, state.isMacOS, state.isWindows]);

  return {
    ...state,
    promptInstall,
    getInstallInstructions,
    canPrompt: !!deferredPrompt
  };
};
