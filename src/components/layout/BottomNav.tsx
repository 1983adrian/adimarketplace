import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      gradient: 'from-emerald-400 to-green-500',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'search',
      icon: Search,
      label: 'Caută',
      href: '/browse',
      gradient: 'from-sky-400 to-blue-500',
      iconColor: 'text-sky-500',
    },
    {
      id: 'sell',
      icon: PlusCircle,
      label: 'Vinde',
      href: user ? '/sell' : '/login',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      iconColor: 'text-orange-500',
      isMain: true,
    },
    {
      id: 'favorites',
      icon: Heart,
      label: 'Favorite',
      href: user ? '/favorites' : '/login',
      gradient: 'from-pink-400 to-rose-500',
      iconColor: 'text-pink-500',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profil',
      href: user ? '/dashboard' : '/login',
      gradient: 'from-violet-400 to-purple-500',
      iconColor: 'text-violet-500',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 md:hidden safe-area-bottom shadow-2xl shadow-black/10">
      <div className="flex items-center justify-around px-1 py-2">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[48px]"
        >
          <div className="p-2 rounded-xl transition-all duration-300">
            <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-semibold text-gray-500">Înapoi</span>
        </button>

        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[48px]",
                active && !item.isMain && "bg-gradient-to-br from-gray-100 to-gray-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                active && `bg-gradient-to-br ${item.gradient} shadow-lg`
              )}>
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active ? "text-white scale-110" : item.iconColor
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-semibold transition-colors mt-0.5",
                  active ? "text-gray-900" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Main Sell Button */}
        {navItems.filter(item => item.isMain).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[60px]"
            >
              <div className={cn(
                "w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-all duration-300 relative",
                `bg-gradient-to-br ${item.gradient}`,
                active && "scale-110 shadow-2xl"
              )}>
                <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 drop-shadow-lg" />
              </div>
              <span className="text-[10px] font-semibold text-gray-900 mt-1.5">{item.label}</span>
            </Link>
          );
        })}

        {navItems.slice(3, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[48px]",
                active && !item.isMain && "bg-gradient-to-br from-gray-100 to-gray-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                active && `bg-gradient-to-br ${item.gradient} shadow-lg`
              )}>
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active ? "text-white scale-110" : item.iconColor
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-semibold transition-colors mt-0.5",
                  active ? "text-gray-900" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Forward Button */}
        <button
          onClick={() => window.history.forward()}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[48px]"
        >
          <div className="p-2 rounded-xl transition-all duration-300">
            <ArrowRight className="h-5 w-5 text-gray-500" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-semibold text-gray-500">Înainte</span>
        </button>
      </div>
    </nav>
  );
};
