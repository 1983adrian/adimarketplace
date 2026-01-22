import React from 'react';
import { Link } from 'react-router-dom';
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

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  isPro?: boolean;
}

// 6 essential actions - PRO style with no duplicates
const essentialActions: QuickAction[] = [
  { 
    id: 'tutorial', 
    label: 'Tutorial PRO', 
    description: 'Învață să vinzi ca un profesionist',
    icon: GraduationCap, 
    href: '/seller-tutorial', 
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    isPro: true
  },
  { 
    id: 'add-product', 
    label: 'Adaugă Produs', 
    description: 'Listează rapid un produs nou',
    icon: Plus, 
    href: '/sell', 
    gradient: 'from-blue-500 via-cyan-500 to-teal-500' 
  },
  { 
    id: 'products', 
    label: 'Produsele Mele', 
    description: 'Gestionează toate produsele',
    icon: Package, 
    href: '/dashboard?tab=listings', 
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' 
  },
  { 
    id: 'orders', 
    label: 'Comenzi Active', 
    description: 'Vezi și gestionează comenzile',
    icon: ShoppingBag, 
    href: '/orders?tab=selling', 
    gradient: 'from-emerald-500 via-green-500 to-lime-500' 
  },
  { 
    id: 'messages', 
    label: 'Mesaje Clienți', 
    description: 'Chat în timp real',
    icon: MessageCircle, 
    href: '/messages', 
    gradient: 'from-sky-500 via-blue-500 to-indigo-500' 
  },
  { 
    id: 'wallet', 
    label: 'Portofel & Bani', 
    description: 'Sold, plăți și retrageri',
    icon: Wallet, 
    href: '/settings?tab=payouts', 
    gradient: 'from-amber-500 via-orange-500 to-red-500' 
  },
];

const ActionCard: React.FC<{ action: QuickAction }> = ({ action }) => {
  const Icon = action.icon;
  
  return (
    <Link to={action.href} className="group">
      <div className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl",
        "bg-gradient-to-br from-card via-card to-muted/30",
        "border-2 border-border/50 overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:shadow-primary/20",
        "hover:border-primary/40 hover:-translate-y-2",
        "active:scale-95",
        "h-full min-h-[160px]"
      )}>
        {/* PRO Badge */}
        {action.isPro && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-lg">
            <Sparkles className="h-2.5 w-2.5" />
            PRO
          </div>
        )}
        
        {/* Gradient background glow on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          `bg-gradient-to-br ${action.gradient}`
        )} />
        
        {/* Large Icon with gradient */}
        <div className={cn(
          "p-4 rounded-2xl bg-gradient-to-br shadow-xl",
          action.gradient,
          "transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3"
        )}>
          <Icon className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
        
        {/* Label */}
        <div className="text-center relative z-10">
          <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
            {action.label}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
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
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Acțiuni Rapide PRO</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {essentialActions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};

export default SellerQuickActions;
