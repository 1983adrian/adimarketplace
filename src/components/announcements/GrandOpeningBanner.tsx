import React, { useState, useEffect } from 'react';
import { X, Megaphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Grand Opening Banner - Visible until April 29, 2026
 * Square card banner with text that fades in/out every 2 seconds
 */
export const GrandOpeningBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check if banner should be shown (until April 29, 2026)
  const endDate = new Date('2026-04-29T23:59:59');
  const now = new Date();
  const shouldShow = now <= endDate;

  // Check if user previously dismissed the banner this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('grand-opening-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Text appears and disappears every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('grand-opening-dismissed', 'true');
  };

  if (!shouldShow || dismissed) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg",
          "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
          "text-white px-3 py-2",
          "shadow-md border border-amber-400/20"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
          aria-label="Închide anunțul"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Content - fades in/out every 5 seconds */}
        <div 
          className={cn(
            "relative z-10 flex items-center justify-center gap-3 transition-opacity duration-700",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Icon */}
          <Megaphone className="h-4 w-4 flex-shrink-0" />

          {/* Text */}
          <p className="text-xs md:text-sm font-medium">
            📢 <strong>Marea Deschidere 1 Mai!</strong> Înregistrează-te acum →{' '}
            <Link
              to="/signup"
              className="underline hover:text-yellow-200 font-bold"
            >
              Creează cont
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrandOpeningBanner;
