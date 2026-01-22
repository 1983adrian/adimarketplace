import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  ShoppingBag,
  Wallet,
  MessageCircle,
  GraduationCap,
  BarChart3,
  Settings,
  Heart,
  Crown,
  LucideIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

interface MenuItem {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  premium?: boolean;
  badgeKey?: 'messages';
  highlight?: boolean;
}

// Colorful items matching the reference design
const mainItems: MenuItem[] = [
  { 
    title: 'Tutorial PRO', 
    description: 'Învață să vinzi ca u...',
    url: '/seller-tutorial', 
    icon: GraduationCap, 
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    premium: true 
  },
  { 
    title: 'Adaugă Produs', 
    description: 'Listează rapid un...',
    url: '/sell', 
    icon: Plus,
    gradient: 'from-cyan-400 to-blue-500',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500'
  },
  { 
    title: 'Produsele Mele', 
    description: 'Gestionează toate...',
    url: '/dashboard?tab=listings', 
    icon: Package,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600'
  },
  { 
    title: 'Comenzi Active', 
    description: 'Vezi și gestionează...',
    url: '/orders?tab=selling', 
    icon: ShoppingBag,
    gradient: 'from-emerald-400 to-green-600',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600'
  },
  { 
    title: 'Mesaje Clienți', 
    description: 'Chat în timp real',
    url: '/messages', 
    icon: MessageCircle,
    gradient: 'from-blue-400 to-indigo-500',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    badgeKey: 'messages' 
  },
  { 
    title: 'Portofel & Bani', 
    description: 'Sold, plăți și retrageri',
    url: '/settings?tab=payouts', 
    icon: Wallet,
    gradient: 'from-orange-400 to-red-500',
    iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',
    highlight: true
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
      {/* Grid for both mobile and desktop - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey === 'messages' ? unreadMessages : 0;
          const active = isActive(item.url);
          
          return (
            <Link 
              key={item.url}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center p-5 rounded-2xl transition-all duration-300",
                "bg-card border-2 hover:shadow-xl hover:-translate-y-1",
                item.highlight 
                  ? "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" 
                  : "border-border/50 hover:border-primary/30",
                active && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {/* PRO Badge */}
              {item.premium && (
                <div className="absolute -top-2 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  PRO
                </div>
              )}
              
              {/* Icon Container */}
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-3",
                item.iconBg
              )}>
                <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                {badgeCount > 0 && (
                  <NotificationBadge count={badgeCount} size="sm" className="-top-1 -right-1" />
                )}
              </div>
              
              {/* Title */}
              <h3 className={cn(
                "font-semibold text-center mb-1",
                item.highlight ? "text-orange-600 dark:text-orange-400" : "text-foreground"
              )}>
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-muted-foreground text-center line-clamp-1">
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
