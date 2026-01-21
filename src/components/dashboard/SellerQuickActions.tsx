import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  ShoppingBag,
  Wallet,
  MessageCircle,
  Settings,
  GraduationCap,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
}

// Only 7 essential actions - Amazon/eBay style
const essentialActions: QuickAction[] = [
  { 
    id: 'tutorial', 
    label: 'Tutorial Vânzător', 
    description: 'Învață să vinzi',
    icon: GraduationCap, 
    href: '/seller-tutorial', 
    gradient: 'from-pink-500 to-rose-500' 
  },
  { 
    id: 'add-product', 
    label: 'Adaugă Produs', 
    description: 'Listează un produs nou',
    icon: Plus, 
    href: '/sell', 
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    id: 'products', 
    label: 'Produsele Mele', 
    description: 'Vezi toate produsele',
    icon: Package, 
    href: '/dashboard?tab=listings', 
    gradient: 'from-violet-500 to-violet-600' 
  },
  { 
    id: 'orders', 
    label: 'Comenzi', 
    description: 'Gestionează comenzile',
    icon: ShoppingBag, 
    href: '/orders?tab=selling', 
    gradient: 'from-green-500 to-green-600' 
  },
  { 
    id: 'messages', 
    label: 'Mesaje', 
    description: 'Chat cu clienții',
    icon: MessageCircle, 
    href: '/messages', 
    gradient: 'from-emerald-500 to-emerald-600' 
  },
  { 
    id: 'wallet', 
    label: 'Bani & Plăți', 
    description: 'Sold și retrageri',
    icon: Wallet, 
    href: '/settings?tab=payouts', 
    gradient: 'from-amber-500 to-amber-600' 
  },
  { 
    id: 'settings', 
    label: 'Setări', 
    description: 'Configurează contul',
    icon: Settings, 
    href: '/settings', 
    gradient: 'from-slate-500 to-slate-600' 
  },
];

const ActionCard: React.FC<{ action: QuickAction }> = ({ action }) => {
  const Icon = action.icon;
  
  return (
    <Link to={action.href} className="group">
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl",
        "bg-card border-2 border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/10",
        "hover:border-primary/30 hover:-translate-y-1",
        "active:scale-95",
        "h-full min-h-[140px]"
      )}>
        {/* Large Icon */}
        <div className={cn(
          "p-4 rounded-2xl bg-gradient-to-br shadow-lg",
          action.gradient,
          "transition-transform duration-300 group-hover:scale-110"
        )}>
          <Icon className="h-7 w-7 text-white" strokeWidth={2} />
        </div>
        
        {/* Label */}
        <div className="text-center">
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {action.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const SellerQuickActions: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Acțiuni Rapide</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {essentialActions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};

export default SellerQuickActions;
