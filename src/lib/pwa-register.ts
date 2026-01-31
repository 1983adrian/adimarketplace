// PWA Service Worker registration with error handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Only register in production
      if (import.meta.env.PROD) {
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
      }
    } catch (error) {
      // Gracefully handle registration errors
      console.warn('SW registration failed:', error);
      return null;
    }
  }
  return null;
};

// Unregister all service workers (useful for cleanup)
export const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('All service workers unregistered');
  }
};
