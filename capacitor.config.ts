import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e0bfe707146b4b72b4c4b072982fc18d',
  appName: 'Marketplace România',
  webDir: 'dist',
  server: {
    url: 'https://e0bfe707-146b-4b72-b4c4-b072982fc18d.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Badge: {
      persist: true,
      autoClear: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#FF6B35",
      sound: "notification.wav"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1a1a2e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1a1a2e"
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: true,
    scrollEnabled: true,
    backgroundColor: "#1a1a2e"
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#1a1a2e",
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
