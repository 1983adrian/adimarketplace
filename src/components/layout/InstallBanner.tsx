import { useState, useEffect, forwardRef } from "react";
import { Download, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

export const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  
  const { 
    isInstallable, 
    isInstalled, 
    isStandalone,
    isIOS,
    isAndroid,
    promptInstall,
    canPrompt
  } = usePWAInstall();

  useEffect(() => {
    // Don't show banner on install page (already has instructions there)
    if (window.location.pathname === '/install' || window.location.pathname === '/install-app') {
      return;
    }
    
    // Don't show if already installed or dismissed recently
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show banner after 2 seconds if on mobile and not installed
    const showTimer = setTimeout(() => {
      if ((isIOS || isAndroid || isInstallable) && !isInstalled && !isStandalone) {
        setShowBanner(true);
        // Start animation after a small delay
        setTimeout(() => setIsAnimating(true), 50);
        
        // Auto-dismiss after 3 seconds of being visible
        setTimeout(() => {
          handleDismiss();
        }, 3000);
      }
    }, 2000);

    return () => clearTimeout(showTimer);
  }, [isIOS, isAndroid, isInstallable, isInstalled, isStandalone]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    }, 300);
  };

  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
    } else {
      navigate('/install');
    }
    handleDismiss();
  };

  if (!showBanner || isStandalone || isInstalled) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-24 left-1/2 z-50"
      style={{
        transform: isAnimating && !isExiting 
          ? 'translateX(-50%) translateY(0)' 
          : 'translateX(-50%) translateY(100px)',
        opacity: isAnimating && !isExiting ? 1 : 0,
        transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Compact modern notification */}
      <button
        onClick={handleInstall}
        className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border/50 rounded-full shadow-lg px-4 py-2.5 hover:bg-card transition-colors group cursor-pointer"
      >
        {/* Icon */}
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
          <Smartphone className="h-4 w-4 text-white" />
        </div>
        
        {/* Text */}
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            Instalează aplicația
          </p>
          <p className="text-xs text-muted-foreground">
            Acces rapid de pe ecran
          </p>
        </div>

        {/* Download icon */}
        <Download className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
