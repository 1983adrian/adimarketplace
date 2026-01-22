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
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  premium?: boolean;
}

// Organized by category - most used first
const principalItems: MenuItem[] = [
  { title: 'Tutorial PRO', url: '/seller-tutorial', icon: GraduationCap, premium: true },
  { title: 'Adaugă Produs', url: '/sell', icon: Plus },
  { title: 'Produsele Mele', url: '/dashboard?tab=listings', icon: Package },
  { title: 'Comenzi Active', url: '/orders?tab=selling', icon: ShoppingBag },
  { title: 'Mesaje Clienți', url: '/messages', icon: MessageCircle },
];

const financialItems: MenuItem[] = [
  { title: 'Portofel & Bani', url: '/settings?tab=payouts', icon: Wallet },
  { title: 'Analytics', url: '/seller-analytics', icon: BarChart3 },
];

const otherItems: MenuItem[] = [
  { title: 'Favorite', url: '/favorites', icon: Heart },
  { title: 'Setări Cont', url: '/settings', icon: Settings },
];

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const SidebarMenuItem: React.FC<MenuItemProps> = ({ item, isActive }) => {
  const Icon = item.icon;
  
  return (
    <Link 
      to={item.url}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        "hover:bg-primary/10 hover:translate-x-1",
        isActive 
          ? "bg-primary/15 text-primary font-medium border-l-4 border-primary" 
          : "text-foreground/80 hover:text-foreground",
        item.premium && "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        item.premium 
          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
          : isActive 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm">{item.title}</span>
      {item.premium && (
        <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold">
          <Crown className="h-2.5 w-2.5" />
          PRO
        </span>
      )}
    </Link>
  );
};

interface CategoryGroupProps {
  title: string;
  items: MenuItem[];
  currentPath: string;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ title, items, currentPath }) => {
  const isActive = (url: string) => {
    const baseUrl = url.split('?')[0];
    return currentPath === baseUrl || currentPath.startsWith(baseUrl + '/');
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem 
            key={item.url} 
            item={item} 
            isActive={isActive(item.url)}
          />
        ))}
      </div>
    </div>
  );
};

export const SellerQuickActions: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="mb-8">
      {/* Desktop: Sidebar on left */}
      <div className="hidden md:flex gap-6">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-foreground">Panou Vânzător</span>
            </div>
            
            <CategoryGroup title="Principal" items={principalItems} currentPath={currentPath} />
            <CategoryGroup title="Finanțe" items={financialItems} currentPath={currentPath} />
            <CategoryGroup title="Altele" items={otherItems} currentPath={currentPath} />
          </div>
        </div>
        
        {/* Right content area - this will be filled by the main dashboard content */}
        <div className="flex-1">
          {/* Dashboard stats and content go here */}
        </div>
      </div>

      {/* Mobile: Two columns */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Package className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-bold text-foreground">Acțiuni Rapide</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Left column - Principal */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              Principal
            </h3>
            {principalItems.map((item) => (
              <MobileMenuItem key={item.url} item={item} />
            ))}
          </div>
          
          {/* Right column - Finanțe & Altele */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              Finanțe
            </h3>
            {financialItems.map((item) => (
              <MobileMenuItem key={item.url} item={item} />
            ))}
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1 mt-3">
              Altele
            </h3>
            {otherItems.map((item) => (
              <MobileMenuItem key={item.url} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileMenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const Icon = item.icon;
  
  return (
    <Link 
      to={item.url}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all",
        "bg-card/80 border border-border/50 hover:border-primary/40 hover:bg-primary/5",
        item.premium && "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg",
        item.premium 
          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
          : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-medium truncate">{item.title}</span>
      {item.premium && (
        <Crown className="h-3 w-3 text-amber-500 ml-auto flex-shrink-0" />
      )}
    </Link>
  );
};

export default SellerQuickActions;
