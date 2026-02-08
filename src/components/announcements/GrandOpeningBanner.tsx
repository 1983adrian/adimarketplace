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
    <div className="container mx-auto px-4 py-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
          "text-white p-4 md:p-5",
          "shadow-lg border border-amber-400/20"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors z-10"
          aria-label="Închide anunțul"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content - fades in/out every 5 seconds */}
        <div 
          className={cn(
            "relative z-10 flex flex-col items-center text-center gap-2 transition-opacity duration-700",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Icon header */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-200" />
            <Megaphone className="h-5 w-5" />
            <Sparkles className="h-4 w-4 text-yellow-200" />
          </div>

          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold tracking-tight">
            📢 Marea Deschidere MarketPlaceRomania.com!
          </h2>

          {/* Message */}
          <p className="text-sm md:text-base text-white/95 max-w-lg leading-snug">
            Din <strong className="text-yellow-200">1 Mai</strong>, dăm startul la vânzări, cumpărări și licitații online. 
            Înregistrează-te acum și rezervă-ți locul!
          </p>

          {/* CTA Button */}
          <Link
            to="/signup"
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 mt-1",
              "bg-white text-orange-600 font-semibold text-sm rounded-full",
              "shadow-md hover:shadow-lg transition-all duration-300",
              "hover:scale-105 hover:bg-yellow-50"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Înregistrează-te Acum!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GrandOpeningBanner;
