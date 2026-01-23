import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu,
  Plus, 
  Package, 
  ShoppingBag,
  GraduationCap,
  MessageCircle,
  Wallet,
  BarChart3,
  Heart,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Button } from '@/components/ui/button';

const menuItems = [
  { 
    id: 'tutorial',
    title: 'Tutorial PRO', 
    url: '/seller-tutorial', 
    icon: GraduationCap, 
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
  { 
    id: 'sell',
    title: 'Adaugă Produs', 
    url: '/sell', 
    icon: Plus,
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500'
  },
  { 
    id: 'products',
    title: 'Produsele Mele', 
    url: '/dashboard?tab=listings', 
    icon: Package,
    color: 'bg-gradient-to-br from-violet-500 to-purple-600'
  },
  { 
    id: 'orders',
    title: 'Comenzi Active', 
    url: '/orders?tab=selling', 
    icon: ShoppingBag,
    color: 'bg-gradient-to-br from-emerald-400 to-green-600'
  },
  { 
    id: 'messages',
    title: 'Mesaje', 
    url: '/messages', 
    icon: MessageCircle,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    showBadge: true
  },
  { 
    id: 'wallet',
    title: 'Portofel', 
    url: '/settings?tab=payouts', 
    icon: Wallet,
    color: 'bg-gradient-to-br from-amber-400 to-orange-500'
  },
  { 
    id: 'analytics',
    title: 'Statistici', 
    url: '/seller-analytics', 
    icon: BarChart3,
    color: 'bg-gradient-to-br from-indigo-400 to-blue-600'
  },
  { 
    id: 'favorites',
    title: 'Favorite', 
    url: '/favorites', 
    icon: Heart,
    color: 'bg-gradient-to-br from-red-400 to-pink-500'
  },
];

export const SellerQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadMessages();

  return (
    <div className="mb-8">
      {/* Single Menu Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        size="lg"
      >
        <Menu className="h-6 w-6 mr-3" />
        Meniu
      </Button>

      {/* Menu Panel Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Menu Box */}
          <div 
            className="bg-card border-2 border-border rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Meniu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* All Menu Items */}
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const showBadge = item.showBadge && unreadCount > 0;
                
                return (
                  <Link 
                    key={item.id}
                    to={item.url}
                    onClick={() => setIsOpen(false)}
                    className="relative flex flex-col items-center p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-200 border border-border/50 hover:border-primary/30 hover:shadow-lg"
                  >
                    {/* Badge for Messages */}
                    {showBadge && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                      item.color
                    )}>
                      <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    
                    {/* Title */}
                    <span className="text-sm font-medium text-foreground text-center">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerQuickActions;
