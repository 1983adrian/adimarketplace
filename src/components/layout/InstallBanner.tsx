import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

export const InstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
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
    // Don't show if already installed or dismissed recently
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show banner after 5 seconds if on mobile and not installed
    const timer = setTimeout(() => {
      if ((isIOS || isAndroid || isInstallable) && !isInstalled && !isStandalone) {
        setShowBanner(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isIOS, isAndroid, isInstallable, isInstalled, isStandalone]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
    } else {
      navigate('/install');
    }
    handleDismiss();
  };

  if (!showBanner || dismissed || isStandalone || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instalează Marketplace România</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Adaugă aplicația pe ecranul principal pentru acces rapid
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 h-8 text-xs"
                onClick={handleInstall}
              >
                <Download className="h-3 w-3 mr-1" />
                Instalează
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 text-xs"
                onClick={handleDismiss}
              >
                Mai târziu
              </Button>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
