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
      id: 'home',
      icon: Home,
      label: 'Acasă',
      href: '/',
      color: 'text-emerald-500',
      activeColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      id: 'search',
      icon: Search,
      label: t('common.search'),
      href: '/browse',
      color: 'text-sky-500',
      activeColor: 'text-sky-400',
      bgColor: 'bg-sky-500/20',
    },
    {
      id: 'sell',
      icon: PlusCircle,
      label: t('header.sell'),
      href: user ? '/create-listing' : '/login',
      color: 'text-orange-500',
      activeColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      isMain: true,
    },
    {
      id: 'favorites',
      icon: Heart,
      label: t('header.favorites'),
      href: user ? '/dashboard?tab=favorites' : '/login',
      color: 'text-pink-500',
      activeColor: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      id: 'profile',
      icon: User,
      label: t('settings.profile'),
      href: user ? '/dashboard' : '/login',
      color: 'text-violet-500',
      activeColor: 'text-violet-400',
      bgColor: 'bg-violet-500/20',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                active && item.bgColor
              )}
            >
              {item.isMain ? (
                <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40 border-4 border-background">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-colors",
                    active ? item.activeColor : item.color
                  )} 
                />
              )}
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  item.isMain && "mt-1",
                  active ? item.activeColor : item.color
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
