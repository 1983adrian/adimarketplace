import { useState, useEffect, forwardRef } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

// Professional iOS and Android icons with forwardRef to avoid React warnings
const AppleIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" {...props}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
));
AppleIcon.displayName = 'AppleIcon';

const AndroidIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" {...props}>
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396"/>
  </svg>
));
AndroidIcon.displayName = 'AndroidIcon';

export const InstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
        // Start animation after a small delay
        setTimeout(() => setIsAnimating(true), 50);
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
    <div 
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      style={{
        transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 3000ms cubic-bezier(0.16, 1, 0.3, 1)', // Exactly 3 seconds, smooth easing
      }}
    >
      {/* Professional card with subtle gradient - not spammy */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-5 backdrop-blur-sm">
        {/* Header with platform icons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AppleIcon />
              <span className="text-xs font-medium">iOS</span>
            </div>
            <span className="text-muted-foreground/30">|</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AndroidIcon />
              <span className="text-xs font-medium">Android</span>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            aria-label="Închide"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Main content - professional typography */}
        <div className="space-y-3">
          <div>
            <h3 
              className="font-semibold text-foreground text-base"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Instalează Aplicația
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Accesează rapid Marketplace România direct de pe ecranul principal al telefonului tău.
            </p>
          </div>

          {/* Benefits - subtle and professional */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
              ✓ Acces instant
            </span>
            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
              ✓ Notificări
            </span>
            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
              ✓ Offline
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button 
              size="sm" 
              className="flex-1 h-10 gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-md"
              onClick={handleInstall}
            >
              <Download className="h-4 w-4" />
              Instalează Gratuit
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-10 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              Nu acum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
