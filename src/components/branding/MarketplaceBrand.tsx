import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MarketplaceBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'welcome' | 'goodbye';
  showTagline?: boolean;
  className?: string;
  linkTo?: string;
}

/**
 * Unified branding component for "Marketplace România"
 * Colors: Market (blue), place (orange), România (green with colored accents)
 * 
 * Variants:
 * - default: Standard branding
 * - welcome: Shows "Bine ai venit!" message
 * - goodbye: Shows "La revedere!" message for sign out
 */
export const MarketplaceBrand: React.FC<MarketplaceBrandProps> = ({
  size = 'md',
  variant = 'default',
  showTagline = false,
  className,
  linkTo = '/',
}) => {
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

  const variantMessages = {
    default: null,
    welcome: 'Bine ai venit!',
    goodbye: 'La revedere!',
  };

  const BrandContent = () => (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Main brand text with colored letters */}
      <h1 className={cn(
        'font-black tracking-tight drop-shadow-lg',
        sizeClasses[size]
      )}>
        {/* "Market" - Blue gradient */}
        <span className="bg-gradient-to-r from-[#4285F4] via-[#5A9CF4] to-[#4285F4] bg-clip-text text-transparent">
          Market
        </span>
        {/* "place" - Orange/Amber gradient */}
        <span className="bg-gradient-to-r from-[#FBBC04] via-[#F59E0B] to-[#EA580C] bg-clip-text text-transparent">
          place
        </span>
        {/* " România" - Green with colored R */}
        <span className="ml-1">
          <span className="text-[#34A853]">R</span>
          <span className="text-[#34A853]">o</span>
          <span className="text-[#34A853]">m</span>
          <span className="text-[#34A853]">â</span>
          <span className="text-[#34A853]">n</span>
          <span className="text-[#34A853]">i</span>
          <span className="text-[#34A853]">a</span>
        </span>
      </h1>

      {/* Tagline */}
      {showTagline && (
        <p className={cn(
          'text-muted-foreground font-medium',
          taglineSizes[size]
        )}>
          <span className="text-[#4285F4]">Cumpără</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#FBBC04]">Vinde</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span className="text-[#EA4335]">Licitează</span>
          <span className="mx-2 text-muted-foreground">—</span>
          <span className="text-muted-foreground">Produse noi și second-hand</span>
        </p>
      )}

      {/* Variant message */}
      {variantMessages[variant] && (
        <p className={cn(
          'font-semibold mt-2',
          taglineSizes[size],
          variant === 'welcome' && 'text-[#34A853]',
          variant === 'goodbye' && 'text-[#EA4335]'
        )}>
          {variantMessages[variant]}
        </p>
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
