import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    {
      icon: Home,
      label: 'Acasă',
      href: '/',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20',
    },
    {
      icon: Search,
      label: t('common.search'),
      href: '/browse',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
    },
    {
      icon: PlusCircle,
      label: t('header.sell'),
      href: user ? '/create-listing' : '/login',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      isMain: true,
    },
    {
      icon: Heart,
      label: t('header.favorites'),
      href: user ? '/dashboard?tab=favorites' : '/login',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
    },
    {
      icon: User,
      label: t('settings.profile'),
      href: user ? '/dashboard' : '/login',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                active ? item.bgColor : "hover:bg-muted/50",
                item.isMain && "relative"
              )}
            >
              {item.isMain ? (
                <div className="absolute -top-4 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              ) : (
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-colors",
                    active ? item.color : "text-muted-foreground"
                  )} 
                />
              )}
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  item.isMain && "mt-6",
                  active ? item.color : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
};
