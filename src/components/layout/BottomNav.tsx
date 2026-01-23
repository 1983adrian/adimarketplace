import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadNotifications = 0 } = useUnreadNotifications();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 md:hidden safe-area-bottom shadow-2xl shadow-black/10">
      <div className="flex items-center justify-around px-4 py-2">
        {/* Home */}
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-300",
            isActive('/') && "bg-gradient-to-br from-gray-100 to-gray-50"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all duration-300",
            isActive('/') && "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg"
          )}>
            <Home 
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive('/') ? "text-white scale-110" : "text-emerald-500"
              )} 
              strokeWidth={isActive('/') ? 2.5 : 2}
            />
          </div>
          <span className={cn(
            "text-[10px] font-semibold transition-colors mt-0.5",
            isActive('/') ? "text-gray-900" : "text-gray-500"
          )}>
            Acasă
          </span>
        </Link>

        {/* Vinde - Main Button */}
        <Link
          to={user ? '/sell' : '/login'}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5"
        >
          <div className={cn(
            "w-14 h-14 -mt-6 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-all duration-300 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500",
            isActive('/sell') && "scale-110 shadow-2xl"
          )}>
            <PlusCircle className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-gray-900 mt-1.5">Vinde</span>
        </Link>

        {/* Meniu (Dashboard) - toate acțiunile sunt aici */}
        <Link
          to={user ? '/dashboard' : '/login'}
          className={cn(
            "relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-300",
            isActive('/dashboard') && "bg-gradient-to-br from-gray-100 to-gray-50"
          )}
        >
          <div className={cn(
            "relative p-2 rounded-xl transition-all duration-300",
            isActive('/dashboard') && "bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg"
          )}>
            <Menu 
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive('/dashboard') ? "text-white scale-110" : "text-violet-500"
              )} 
              strokeWidth={isActive('/dashboard') ? 2.5 : 2}
            />
            {unreadNotifications > 0 && (
              <NotificationBadge 
                count={unreadNotifications} 
                size="sm" 
                className="-top-1 -right-1"
              />
            )}
          </div>
          <span className={cn(
            "text-[10px] font-semibold transition-colors mt-0.5",
            isActive('/dashboard') ? "text-gray-900" : "text-gray-500"
          )}>
            Meniu
          </span>
        </Link>
      </div>
    </nav>
  );
};
