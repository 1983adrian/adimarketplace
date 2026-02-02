import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MarketplaceBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'welcome' | 'goodbye';
  showTagline?: boolean;
  className?: string;
  linkTo?: string;
}

/**
 * BRAND OFICIAL: Marketplace România
 * 
 * Acesta este componenta oficială de branding pentru "Marketplace România"
 * 
 * SEO Keywords (Brand Names):
 * - Marketplace România (principal)
 * - Market România
 * - Place România  
 * - Market Place România
 * - MarketplaceRomania
 * - www.marketplaceromania.com
 * 
 * Colors: Market (blue #4285F4), place (orange #FBBC04), România (green #34A853)
 * 
 * Variants:
 * - default: Standard branding
 * - welcome: Shows translated welcome message with slide animation (3s)
 * - goodbye: Shows translated goodbye message for sign out
 */
export const MarketplaceBrand: React.FC<MarketplaceBrandProps> = ({
  size = 'md',
  variant = 'default',
  showTagline = false,
  className,
  linkTo = '/',
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (variant === 'welcome' || variant === 'goodbye') {
      // Start animation after a small delay
      const startTimer = setTimeout(() => setShowMessage(true), 100);
      return () => clearTimeout(startTimer);
    }
  }, [variant]);

  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl md:text-5xl',
    xl: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-base md:text-lg',
  };

  const messageSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const variantMessages = {
    default: null,
    welcome: t('brand.welcome'),
    goodbye: t('brand.goodbye'),
  };

  const BrandContent = () => (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Main brand text with colored letters - TRANSLATED */}
      <h1 className={cn(
        'font-black tracking-tight drop-shadow-lg',
        sizeClasses[size]
      )}>
        {/* First part - Blue gradient */}
        <span className="bg-gradient-to-r from-[#4285F4] via-[#5A9CF4] to-[#4285F4] bg-clip-text text-transparent">
          {t('brand.market')}
        </span>
        {/* Second part - Orange/Amber gradient */}
        <span className="bg-gradient-to-r from-[#FBBC04] via-[#F59E0B] to-[#EA580C] bg-clip-text text-transparent">
          {t('brand.place')}
        </span>
        {/* Country - Green */}
        <span className="ml-1 text-[#34A853]">
          {t('brand.country')}
        </span>
      </h1>

      {/* Tagline - SEO optimized with translations */}
      {showTagline && (
        <p className={cn(
          'text-muted-foreground font-medium',
          taglineSizes[size]
        )}>
          <span className="text-[#4285F4]">{t('brand.buy')}</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#FBBC04]">{t('brand.sell')}</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#EA4335]">{t('brand.bid')}</span>
          <span className="mx-2 text-muted-foreground">—</span>
          <span className="text-muted-foreground">{t('brand.tagline')}</span>
        </p>
      )}

      {/* Animated Variant message - slides from right to center */}
      {variantMessages[variant] && (
        <div className="relative w-full flex justify-center overflow-hidden mt-4">
          <p 
            className={cn(
              'font-bold tracking-wide',
              messageSizes[size],
              variant === 'welcome' && 'bg-gradient-to-r from-[#34A853] via-[#4CAF50] to-[#8BC34A] bg-clip-text text-transparent',
              variant === 'goodbye' && 'bg-gradient-to-r from-[#EA4335] via-[#FF5722] to-[#FF9800] bg-clip-text text-transparent',
              // Animation: slide from right (translate-x-full) to center (translate-x-0)
              'transition-all ease-out',
              showMessage 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            )}
            style={{
              transitionDuration: '3000ms', // Exactly 3 seconds
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.05em',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            {variantMessages[variant]}
          </p>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block hover:opacity-90 transition-opacity">
        <BrandContent />
      </Link>
    );
  }

  return <BrandContent />;
};

export default MarketplaceBrand;
