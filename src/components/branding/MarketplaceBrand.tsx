import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import heroLogo from '@/assets/marketplace-logo-hero-clear.png';

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
    <div className={cn('flex flex-col items-center', className)} style={{ gap: 0 }}>
      {/* Hero Logo - seamless, no borders */}
      <div className="w-full flex items-center justify-center overflow-hidden">
        <img 
          src={heroLogo} 
          alt="MarketPlace România" 
          className={cn(
            'object-contain',
            size === 'sm' && 'h-36 sm:h-40',
            size === 'md' && 'h-48 sm:h-56',
            size === 'lg' && 'h-60 sm:h-72 md:h-80',
            size === 'xl' && 'h-80 sm:h-[22rem] md:h-[26rem] lg:h-[30rem]',
          )}
          style={{ 
            filter: 'brightness(1.06) contrast(1.03)',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {showTagline && (
        <p className={cn(
          'font-semibold tracking-wide -mt-24',
          taglineSizes[size]
        )}>
          <span className="text-[#002B7F]">{t('brand.sell')}</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#FCD116]" style={{ textShadow: '0 0 1px rgba(0,0,0,0.3)' }}>{t('brand.buy')}</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#CE1126]">{t('brand.bid')}</span>
          <span className="mx-2 text-muted-foreground">—</span>
          <span className="text-muted-foreground">{t('brand.tagline')}</span>
        </p>
      )}

      {/* Animated Variant message - slides from right to center */}
      {variantMessages[variant] && (
        <div className="relative w-full flex justify-center overflow-hidden mt-1">
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
