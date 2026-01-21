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
  color: string;
}

const allButtons: QuickActionButton[] = [
  { id: 'messages', label: 'Mesaje/Chat', icon: MessageCircle, href: '/messages', color: 'bg-emerald-500' },
  { id: 'add-product', label: 'Adaugă Produs', icon: Plus, href: '/sell', color: 'bg-blue-500' },
  { id: 'active', label: 'Produse Active', icon: Package, href: '/dashboard?tab=active', color: 'bg-violet-500' },
  { id: 'auctions', label: 'Licitații (Bid)', icon: Gavel, href: '/dashboard?tab=auctions', color: 'bg-amber-500' },
  { id: 'stock', label: 'Stoc', icon: Boxes, href: '/dashboard?tab=stock', color: 'bg-cyan-500' },
  { id: 'favorites', label: 'Favorite', icon: Heart, href: '/favorites', color: 'bg-pink-500' },
  { id: 'new-orders', label: 'Comenzi Noi', icon: ShoppingBag, href: '/orders?tab=selling&status=pending', color: 'bg-green-500' },
  { id: 'in-progress', label: 'În Curs', icon: Clock, href: '/orders?tab=selling&status=shipped', color: 'bg-yellow-500' },
  { id: 'completed', label: 'Finalizate', icon: CheckCircle2, href: '/orders?tab=selling&status=delivered', color: 'bg-emerald-600' },
  { id: 'returns', label: 'Retururi', icon: RotateCcw, href: '/orders?tab=returns-received', color: 'bg-orange-500' },
  { id: 'cancelled', label: 'Anulări', icon: XCircle, href: '/orders?tab=selling&status=cancelled', color: 'bg-red-500' },
  { id: 'balance', label: 'Sold', icon: Wallet, href: '/settings?tab=payouts', color: 'bg-green-600' },
  { id: 'payments', label: 'Plăți Primite', icon: ArrowDownCircle, href: '/seller-analytics?tab=payments', color: 'bg-blue-600' },
  { id: 'withdrawals', label: 'Retrageri', icon: ArrowUpCircle, href: '/settings?tab=payouts&action=withdraw', color: 'bg-purple-500' },
  { id: 'invoices', label: 'Facturi', icon: Receipt, href: '/seller-analytics?tab=invoices', color: 'bg-slate-500' },
  { id: 'store-profile', label: 'Profil Magazin', icon: Store, href: '/settings?tab=seller', color: 'bg-indigo-500' },
  { id: 'shipping', label: 'Livrare', icon: Truck, href: '/settings?tab=shipping', color: 'bg-teal-500' },
  { id: 'payment-methods', label: 'Metode Plată', icon: CreditCard, href: '/settings?tab=payouts', color: 'bg-violet-600' },
  { id: 'advanced', label: 'Setări', icon: Settings, href: '/settings', color: 'bg-gray-500' },
];

const QuickActionItem: React.FC<{ item: QuickActionButton }> = ({ item }) => {
  const Icon = item.icon;
  
  return (
    <Link to={item.href} className="flex-shrink-0 group">
      <div className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-2xl",
        "bg-card/50 backdrop-blur-sm border border-border/50",
        "transition-all duration-200 ease-out",
        "hover:bg-card hover:shadow-lg hover:shadow-primary/5",
        "hover:border-primary/20 hover:-translate-y-0.5",
        "active:scale-95",
        "min-w-[70px]"
      )}>
        <div className={cn(
          "p-2.5 rounded-xl shadow-sm",
          item.color,
          "transition-transform duration-200 group-hover:scale-110"
        )}>
          <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight max-w-[60px]">
          {item.label}
        </span>
      </div>
    </Link>
  );
};

export const SellerQuickActions: React.FC = () => {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {allButtons.map((item) => (
          <QuickActionItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SellerQuickActions;
