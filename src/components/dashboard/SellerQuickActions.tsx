import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Plus, 
  Package, 
  Gavel, 
  Boxes, 
  Heart,
  ShoppingBag,
  Clock,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Store,
  Truck,
  CreditCard,
  Settings,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButton {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  iconColor: string;
  badge?: number;
}

interface QuickActionCategory {
  id: string;
  title: string;
  items: QuickActionButton[];
}

const categories: QuickActionCategory[] = [
  {
    id: 'main',
    title: 'Acțiuni Rapide',
    items: [
      { id: 'messages', label: 'Mesaje', icon: MessageCircle, href: '/messages', gradient: 'from-emerald-500/20 to-green-600/20', iconColor: 'text-emerald-500' },
      { id: 'add-product', label: 'Adaugă Produs', icon: Plus, href: '/sell', gradient: 'from-blue-500/20 to-indigo-600/20', iconColor: 'text-blue-500' },
    ]
  },
  {
    id: 'products',
    title: 'Produse',
    items: [
      { id: 'active', label: 'Produse Active', icon: Package, href: '/dashboard?tab=active', gradient: 'from-violet-500/20 to-purple-600/20', iconColor: 'text-violet-500' },
      { id: 'auctions', label: 'Licitații (Bid)', icon: Gavel, href: '/dashboard?tab=auctions', gradient: 'from-amber-500/20 to-orange-600/20', iconColor: 'text-amber-500' },
      { id: 'stock', label: 'Stoc', icon: Boxes, href: '/dashboard?tab=stock', gradient: 'from-cyan-500/20 to-teal-600/20', iconColor: 'text-cyan-500' },
      { id: 'favorites', label: 'Favorite', icon: Heart, href: '/favorites', gradient: 'from-pink-500/20 to-rose-600/20', iconColor: 'text-pink-500' },
    ]
  },
  {
    id: 'orders',
    title: 'Comenzi',
    items: [
      { id: 'new-orders', label: 'Comenzi Noi', icon: ShoppingBag, href: '/orders?tab=selling&status=pending', gradient: 'from-green-500/20 to-emerald-600/20', iconColor: 'text-green-500' },
      { id: 'in-progress', label: 'În Curs', icon: Clock, href: '/orders?tab=selling&status=shipped', gradient: 'from-yellow-500/20 to-amber-600/20', iconColor: 'text-yellow-500' },
      { id: 'completed', label: 'Finalizate', icon: CheckCircle2, href: '/orders?tab=selling&status=delivered', gradient: 'from-emerald-500/20 to-green-600/20', iconColor: 'text-emerald-500' },
      { id: 'returns', label: 'Retururi', icon: RotateCcw, href: '/orders?tab=returns-received', gradient: 'from-orange-500/20 to-red-600/20', iconColor: 'text-orange-500' },
      { id: 'cancelled', label: 'Anulări', icon: XCircle, href: '/orders?tab=selling&status=cancelled', gradient: 'from-red-500/20 to-rose-600/20', iconColor: 'text-red-500' },
    ]
  },
  {
    id: 'finances',
    title: 'Financiar',
    items: [
      { id: 'balance', label: 'Sold', icon: Wallet, href: '/settings?tab=payouts', gradient: 'from-green-500/20 to-emerald-600/20', iconColor: 'text-green-500' },
      { id: 'payments', label: 'Plăți Primite', icon: ArrowDownCircle, href: '/seller-analytics?tab=payments', gradient: 'from-blue-500/20 to-indigo-600/20', iconColor: 'text-blue-500' },
      { id: 'withdrawals', label: 'Retrageri', icon: ArrowUpCircle, href: '/settings?tab=payouts&action=withdraw', gradient: 'from-purple-500/20 to-violet-600/20', iconColor: 'text-purple-500' },
      { id: 'invoices', label: 'Facturi / Comisioane', icon: Receipt, href: '/seller-analytics?tab=invoices', gradient: 'from-slate-500/20 to-gray-600/20', iconColor: 'text-slate-500' },
    ]
  },
  {
    id: 'settings',
    title: 'Setări',
    items: [
      { id: 'store-profile', label: 'Profil Magazin', icon: Store, href: '/settings?tab=seller', gradient: 'from-indigo-500/20 to-blue-600/20', iconColor: 'text-indigo-500' },
      { id: 'shipping', label: 'Livrare', icon: Truck, href: '/settings?tab=shipping', gradient: 'from-teal-500/20 to-cyan-600/20', iconColor: 'text-teal-500' },
      { id: 'payment-methods', label: 'Metode de Plată', icon: CreditCard, href: '/settings?tab=payouts', gradient: 'from-violet-500/20 to-purple-600/20', iconColor: 'text-violet-500' },
      { id: 'advanced', label: 'Setări Avansate', icon: Settings, href: '/settings', gradient: 'from-gray-500/20 to-slate-600/20', iconColor: 'text-gray-500' },
    ]
  }
];

const QuickActionItem: React.FC<{ item: QuickActionButton }> = ({ item }) => {
  const Icon = item.icon;
  
  return (
    <Link to={item.href} className="flex-shrink-0">
      <div className={cn(
        "relative group flex flex-col items-center justify-center",
        "w-[72px] h-[80px] rounded-2xl",
        "bg-gradient-to-br", item.gradient,
        "border border-white/10 dark:border-white/5",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-lg hover:shadow-primary/10",
        "hover:border-primary/30",
        "active:scale-95"
      )}>
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-white/10 to-transparent",
          "transition-opacity duration-300"
        )} />
        
        {/* Icon container with glass effect */}
        <div className={cn(
          "relative z-10 p-2.5 rounded-xl",
          "bg-white/10 dark:bg-white/5",
          "backdrop-blur-sm",
          "transition-transform duration-300",
          "group-hover:scale-110"
        )}>
          <Icon className={cn("h-5 w-5", item.iconColor)} strokeWidth={2} />
        </div>
        
        {/* Label */}
        <span className={cn(
          "relative z-10 mt-1.5 text-[10px] font-medium text-center leading-tight",
          "text-foreground/80 group-hover:text-foreground",
          "transition-colors duration-300",
          "max-w-[64px] line-clamp-2"
        )}>
          {item.label}
        </span>
        
        {/* Badge */}
        {item.badge && item.badge > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
            {item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
    </Link>
  );
};

const CategorySection: React.FC<{ category: QuickActionCategory }> = ({ category }) => {
  return (
    <div className="mb-6">
      {/* Category Title */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {category.title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      
      {/* Scrollable Items - Right to Left */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max flex-row-reverse">
          {category.items.map((item) => (
            <QuickActionItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SellerQuickActions: React.FC = () => {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
};

export default SellerQuickActions;
