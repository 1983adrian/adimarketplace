// PWA Service Worker registration with error handling
// Only runs on client-side and handles all edge cases gracefully

// Detect if running in a bot/crawler context
function isBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (typeof window === 'undefined') return true;
  
  const userAgent = navigator.userAgent?.toLowerCase() || '';
  const botPatterns = [
    'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
    'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
    'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkshare', 'w3c_validator',
    'bot', 'spider', 'crawler', 'scraper', 'headless', 'phantom', 'selenium'
  ];
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  // Skip entirely for SSR, bots, or non-browser environments
  if (typeof window === 'undefined') return null;
  if (typeof navigator === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  if (isBot()) {
    console.log('Bot detected, skipping SW registration');
    return null;
  }
  
  // Only register in production
  if (!import.meta.env.PROD) {
    console.log('Development mode, skipping SW registration');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('SW registered:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New SW available, refresh to update');
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    // Gracefully handle registration errors - don't throw
    console.warn('SW registration skipped:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Unregister all service workers (useful for cleanup)
export const unregisterServiceWorkers = async (): Promise<void> => {
  if (typeof navigator === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('All service workers unregistered');
  } catch (error) {
    console.warn('Failed to unregister service workers:', error);
  }
};
