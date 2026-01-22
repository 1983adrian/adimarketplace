import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  ShoppingBag,
  Wallet,
  MessageCircle,
  GraduationCap,
  LucideIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  activeColor: string; // Color when active
  premium?: boolean;
  badgeKey?: 'messages';
}

// Items with their specific active colors
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
    title: 'Mesaje Clienți', 
    description: 'Chat în timp real',
    url: '/messages', 
    icon: MessageCircle,
    activeColor: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    badgeKey: 'messages' 
  },
  { 
    id: 'wallet',
    title: 'Portofel & Bani', 
    description: 'Sold, plăți și retrageri',
    url: '/settings?tab=payouts', 
    icon: Wallet,
    activeColor: 'bg-gradient-to-br from-orange-400 to-red-500'
  },
];

export const SellerQuickActions: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: unreadMessages = 0 } = useUnreadMessages();

  const isActive = (url: string) => {
    const baseUrl = url.split('?')[0];
    return currentPath === baseUrl || currentPath.startsWith(baseUrl + '/');
  };

  return (
    <div className="mb-8">
      {/* Grid 2x3 for both mobile and desktop */}
      <div className="grid grid-cols-2 gap-3">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey === 'messages' ? unreadMessages : 0;
          const active = isActive(item.url);
          
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
              
              {/* Icon Container - always colored */}
              <div className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3 transition-all duration-300",
                item.activeColor,
                active && "ring-2 ring-offset-2 ring-primary scale-110"
              )}>
                <Icon className="h-7 w-7 text-white transition-colors" strokeWidth={2} />
                {badgeCount > 0 && (
                  <NotificationBadge count={badgeCount} size="sm" className="-top-1 -right-1" />
                )}
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
