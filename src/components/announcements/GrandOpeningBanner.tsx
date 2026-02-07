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

  // Text appears and disappears every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 2000);
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
    <div className="container mx-auto px-4 py-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
          "text-white p-6 md:p-8",
          "shadow-xl border border-amber-400/30"
        )}
      >
        {/* Animated sparkles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-[10%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          <div className="absolute top-8 left-[25%] w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
          <div className="absolute bottom-6 left-[50%] w-2 h-2 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '2s' }} />
          <div className="absolute top-6 right-[20%] w-1.5 h-1.5 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
          <div className="absolute bottom-4 right-[10%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.7s', animationDuration: '2s' }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          aria-label="Închide anunțul"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content - fades in/out every 2 seconds */}
        <div 
          className={cn(
            "relative z-10 flex flex-col items-center text-center gap-4 transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Icon header */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-200" />
            <Megaphone className="h-8 w-8" />
            <Sparkles className="h-6 w-6 text-yellow-200" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            📢 Marea Deschidere MarketPlaceRomania.com!
          </h2>

          {/* Message */}
          <p className="text-base md:text-lg text-white/95 max-w-xl leading-relaxed">
            Din <strong className="text-yellow-200">1 Mai</strong>, dăm startul la vânzări, cumpărări și licitații online. 
            Nu aștepta! Înregistrează-te acum ca vânzător și rezervă-ți locul în cea mai nouă comunitate de comerț din România.
          </p>

          {/* CTA Button */}
          <Link
            to="/signup"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 mt-2",
              "bg-white text-orange-600 font-bold rounded-full",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "hover:scale-105 hover:bg-yellow-50"
            )}
          >
            <Sparkles className="h-5 w-5" />
            Înregistrează-te Acum!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GrandOpeningBanner;
