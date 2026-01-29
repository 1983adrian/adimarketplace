import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Ban, Leaf, Bomb } from 'lucide-react';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
      { label: 'Centru Ajutor', href: '/help' },
      { label: 'Sfaturi Siguranță', href: '/safety' },
      { label: 'Contactează-ne', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'About Us', href: '/about' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <MarketplaceBrand size="sm" showTagline linkTo="/" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Marketplace România - cel mai mare market online din România. Place România pentru cumpărături și vânzări sigure cu comision doar 8%.
            </p>
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
            <p>© {currentYear} Marketplace România | Market România - Cel mai mare market online din România. Toate drepturile rezervate.</p>
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
