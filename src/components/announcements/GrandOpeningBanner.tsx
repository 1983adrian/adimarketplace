import React, { useState, useEffect } from 'react';
import { X, Megaphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Grand Opening Banner - Visible until April 29, 2025
 * Pulses/animates to draw attention without being intrusive
 */
export const GrandOpeningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

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

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('grand-opening-dismissed', 'true');
  };

  if (!shouldShow || dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
        "text-white py-3 px-4",
        "shadow-lg",
        // Pulsing animation
        "animate-pulse-subtle"
      )}
      style={{
        animation: 'banner-glow 2s ease-in-out infinite alternate',
      }}
    >
      {/* Animated sparkles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-[10%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 left-[30%] w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-2/3 left-[50%] w-2 h-2 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-[70%] w-1.5 h-1.5 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-[90%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.7s' }} />
      </div>

      <div className="container mx-auto flex items-center justify-center gap-3 relative z-10">
        {/* Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <Megaphone className="h-5 w-5 animate-bounce" style={{ animationDuration: '1.5s' }} />
          <Sparkles className="h-4 w-4 text-yellow-200" />
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
          <span className="font-bold text-sm sm:text-base whitespace-nowrap">
            📢 Marea Deschidere MarketPlaceRomania.com!
          </span>
          <span className="text-xs sm:text-sm text-white/90 hidden md:inline">
            Din 1 Mai, dăm startul la vânzări, cumpărări și licitații online.
          </span>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-105 whitespace-nowrap"
          >
            <Sparkles className="h-3 w-3" />
            Înregistrează-te acum!
          </Link>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Închide anunțul"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* CSS for custom animation */}
      <style>{`
        @keyframes banner-glow {
          0% {
            box-shadow: 0 4px 15px rgba(251, 146, 60, 0.4);
          }
          100% {
            box-shadow: 0 4px 25px rgba(239, 68, 68, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default GrandOpeningBanner;
