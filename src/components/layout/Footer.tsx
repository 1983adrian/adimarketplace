import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, CreditCard, Shield, Truck, HeadphonesIcon, Ban, Leaf, Bomb } from 'lucide-react';
import logo from '@/assets/cmarket-hero.png';
import { usePlatformSettings } from '@/hooks/useAdminSettings';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: dbSettings } = usePlatformSettings();
  
  const socialLinks = {
    facebook: dbSettings?.['social']?.facebook || 'https://facebook.com/marketplace.romania',
    instagram: dbSettings?.['social']?.instagram || 'https://instagram.com/marketplace.romania',
    twitter: dbSettings?.['social']?.twitter || 'https://twitter.com/marketplace_ro',
    youtube: dbSettings?.['social']?.youtube || 'https://youtube.com/@marketplace-romania',
    tiktok: dbSettings?.['social']?.tiktok || 'https://tiktok.com/@marketplace.romania',
  };

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
      { label: 'Pricing & Fees', href: '/help' },
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

  const trustBadges = [
    { icon: Shield, label: 'Buyer Protection' },
    { icon: Truck, label: 'Tracked Delivery' },
    { icon: CreditCard, label: 'Secure Payments' },
    { icon: HeadphonesIcon, label: '24/7 Support' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Trust Badges */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Marketplace România" className="h-12 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Marketplace-ul tău de încredere pentru cumpărare și vânzare de produse de calitate. Alătură-te miilor de clienți mulțumiți.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all hover:scale-110 shadow-md"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {/* Twitter/X */}
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-black hover:bg-gray-800 text-white transition-all hover:scale-110 shadow-md"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {/* Instagram */}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:from-[#E1306C] hover:via-[#C13584] hover:to-[#833AB4] text-white transition-all hover:scale-110 shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {/* YouTube */}
              {socialLinks.youtube && (
                <a 
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#FF0000] hover:bg-[#CC0000] text-white transition-all hover:scale-110 shadow-md"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {/* TikTok */}
              {socialLinks.tiktok && (
                <a 
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-black hover:bg-gray-900 text-white transition-all hover:scale-110 shadow-md"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
            </div>
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
      <div className="border-t border-border bg-red-50/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-red-600 font-medium">Interzis pe platformă:</span>
            <span className="flex items-center gap-1.5 text-red-600">
              <Ban className="h-4 w-4" /> Armament
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <Leaf className="h-4 w-4" /> Substanțe Interzise
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <Bomb className="h-4 w-4" /> Contrabandă
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Marketplace România. Toate drepturile rezervate.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Plăți securizate prin Adyen & MangoPay
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
