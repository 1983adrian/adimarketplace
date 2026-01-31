import { Capacitor } from '@capacitor/core';

/**
 * Initialize Capacitor plugins and platform-specific configurations
 */
export const initializeCapacitor = async () => {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();
  
  console.log(`[Capacitor] Platform: ${platform}, Native: ${isNative}`);
  
  if (!isNative) {
    console.log('[Capacitor] Running in web mode - native plugins disabled');
    return;
  }

  try {
    // Initialize StatusBar for native platforms
    if (Capacitor.isPluginAvailable('StatusBar')) {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
      console.log('[Capacitor] StatusBar initialized');
    }

    // Initialize SplashScreen
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      // Splash screen will auto-hide based on config
      console.log('[Capacitor] SplashScreen ready');
    }

    // Initialize Keyboard plugin for Android/iOS
    if (Capacitor.isPluginAvailable('Keyboard')) {
      const { Keyboard } = await import('@capacitor/keyboard');
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open');
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
      });
      console.log('[Capacitor] Keyboard listeners added');
    }

    // Initialize App plugin for deep links and state
    if (Capacitor.isPluginAvailable('App')) {
      const { App } = await import('@capacitor/app');
      
      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log(`[Capacitor] App state: ${isActive ? 'active' : 'inactive'}`);
        if (isActive) {
          // Refresh data when app comes to foreground
          document.dispatchEvent(new CustomEvent('app-resumed'));
        }
      });

      // Handle deep links
      App.addListener('appUrlOpen', ({ url }) => {
        console.log('[Capacitor] Deep link:', url);
        // Handle marketplace:// or https://marketplaceromania.com deep links
        const slug = url.split('marketplaceromania.com').pop();
        if (slug) {
          window.location.href = slug;
        }
      });

      console.log('[Capacitor] App listeners initialized');
    }

    console.log('[Capacitor] All plugins initialized successfully');
  } catch (error) {
    console.error('[Capacitor] Plugin initialization error:', error);
  }
};

/**
 * Check if running as a native app
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get the current platform
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Check if a specific plugin is available
 */
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

export default {
  initializeCapacitor,
  isNativeApp,
  getPlatform,
  isPluginAvailable
};
