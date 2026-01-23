import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  ShoppingBag,
  GraduationCap,
  MessageCircle,
  LucideIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  activeColor: string;
  premium?: boolean;
}

// Items with their specific active colors
// 4 main items - removed duplicates (Messages in BottomNav, Wallet in Settings)
const mainItems: MenuItem[] = [
  { 
    id: 'tutorial',
    title: 'Tutorial PRO', 
    description: 'Învață să vinzi ca u...',
    url: '/seller-tutorial', 
    icon: GraduationCap, 
    activeColor: 'bg-gradient-to-br from-pink-500 to-rose-600',
    premium: true 
  },
  { 
    id: 'sell',
    title: 'Adaugă Produs', 
    description: 'Listează rapid un...',
    url: '/sell', 
    icon: Plus,
    activeColor: 'bg-gradient-to-br from-cyan-400 to-blue-500'
  },
  { 
    id: 'products',
    title: 'Produsele Mele', 
    description: 'Gestionează toate...',
    url: '/dashboard?tab=listings', 
    icon: Package,
    activeColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
  },
  { 
    id: 'orders',
    title: 'Comenzi Active', 
    description: 'Vezi și gestionează...',
    url: '/orders?tab=selling', 
    icon: ShoppingBag,
    activeColor: 'bg-gradient-to-br from-emerald-400 to-green-600'
  },
  { 
    id: 'messages',
    title: 'Mesaje', 
    description: 'Conversații și chat...',
    url: '/messages', 
    icon: MessageCircle,
    activeColor: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
];

export const SellerQuickActions: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: unreadCount = 0 } = useUnreadMessages();

  const isActive = (url: string) => {
    const baseUrl = url.split('?')[0];
    return currentPath === baseUrl || currentPath.startsWith(baseUrl + '/');
  };

  return (
    <div className="mb-8">
      {/* Grid 2x3 for 5 items */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          const showBadge = item.id === 'messages' && unreadCount > 0;
          
          return (
            <Link 
              key={item.id}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center p-5 rounded-2xl transition-all duration-300 border-2 hover:shadow-lg hover:-translate-y-0.5",
                active 
                  ? "bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-lg" 
                  : "bg-card border-border/50 hover:border-primary/20"
              )}
            >
              {/* PRO Badge */}
              {item.premium && (
                <div className="absolute -top-2 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  PRO
                </div>
              )}
              
              {/* Unread Messages Badge */}
              {showBadge && (
                <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
              
              {/* Icon Container - always colored */}
              <div className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3 transition-all duration-300",
                item.activeColor,
                active && "ring-2 ring-offset-2 ring-primary scale-110"
              )}>
                <Icon className="h-7 w-7 text-white transition-colors" strokeWidth={2} />
              </div>
              
              {/* Title */}
              <h3 className={cn(
                "font-semibold text-center text-sm mb-0.5 transition-colors",
                active ? "text-blue-600 dark:text-blue-400" : "text-foreground"
              )}>
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-[11px] text-muted-foreground text-center line-clamp-1">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SellerQuickActions;
