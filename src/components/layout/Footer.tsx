import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Ban, Leaf, Bomb } from 'lucide-react';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { useSocialLinks } from '@/hooks/useSocialLinks';

// TikTok SVG icon with forwardRef (not available in lucide-react)
const TikTokIcon = forwardRef<SVGSVGElement, { className?: string }>(({ className }, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
));
TikTokIcon.displayName = 'TikTokIcon';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: socialLinks } = useSocialLinks();

  const footerLinks = {
    shop: [
      { label: 'Electronics', href: '/browse?category=electronics' },
      { label: 'Fashion', href: '/browse?category=fashion' },
      { label: 'Home & Garden', href: '/browse?category=home-garden' },
      { label: 'Sports & Outdoors', href: '/browse?category=sports-outdoors' },
      { label: 'Vehicles', href: '/browse?category=vehicles' },
    ],
    sell: [
      { label: 'Start Selling', href: '/sell' },
      { label: 'Seller Dashboard', href: '/dashboard' },
      { label: 'Seller Analytics', href: '/seller-analytics' },
    ],
    support: [
      { label: 'Cum Funcționează', href: '/cum-functioneaza' },
      { label: 'Taxe și Comisioane', href: '/taxe-si-comisioane' },
      { label: 'Centru Ajutor', href: '/help' },
      { label: 'Sfaturi Siguranță', href: '/safety' },
      { label: 'Contactează-ne', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'About Us', href: '/about' },
    ],
  };

  // Check if any social links exist
  const hasSocialLinks = socialLinks && (
    socialLinks.facebook || 
    socialLinks.instagram || 
    socialLinks.tiktok || 
    socialLinks.twitter || 
    socialLinks.youtube
  );

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <MarketplaceBrand size="sm" showTagline linkTo="/" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Marketplace România</strong> - Brandul oficial al celui mai mare market online din România. Cunoscut și ca <em>Market România</em>, <em>Place România</em> sau <em>Market Place România</em>. Alternativa românească la Facebook Marketplace, OLX și eBay cu comision doar 8%.
            </p>
            
            {/* Social Media Links - Dynamic from Admin Settings */}
            {hasSocialLinks && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity"
                    aria-label="Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.tiktok && (
                  <a 
                    href={socialLinks.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-black text-white hover:opacity-80 transition-opacity"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-black text-white hover:opacity-80 transition-opacity"
                    aria-label="X (Twitter)"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a 
                    href={socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[#FF0000] text-white hover:opacity-80 transition-opacity"
                    aria-label="YouTube"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Shop</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map(({ label, href }) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Sell</h3>
            <ul className="space-y-2.5">
              {footerLinks.sell.map(({ label, href }) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map(({ label, href }) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map(({ label, href }) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Platform Rules */}
      <div className="border-t border-border bg-destructive/5 dark:bg-destructive/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-destructive font-medium">Interzis pe platformă:</span>
            <span className="flex items-center gap-1.5 text-destructive">
              <Ban className="h-4 w-4" /> Armament
            </span>
            <span className="flex items-center gap-1.5 text-destructive">
              <Leaf className="h-4 w-4" /> Substanțe Interzise
            </span>
            <span className="flex items-center gap-1.5 text-destructive">
              <Bomb className="h-4 w-4" /> Contrabandă
            </span>
          </div>
        </div>
      </div>

      {/* Copyright - SEO optimized */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} <strong>Marketplace România®</strong> | Market România | Place România | Market Place România - Brandul oficial al celui mai mare market online din România. www.marketplaceromania.com. Toate drepturile rezervate.</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Plăți securizate</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
