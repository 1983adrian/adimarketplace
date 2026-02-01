import {
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings,
  DollarSign,
  BarChart3,
  Shield,
  Crown,
  Megaphone,
  Sliders,
  LucideIcon,
  Truck,
  RotateCcw,
  Gavel,
  MessageSquare,
  AlertTriangle,
  Wallet,
  FolderTree,
  FileText,
  Store,
  Bell,
  Palette,
  Link as LinkIcon
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  premium?: boolean;
}

// Proprietar & Control
const ownerItems: MenuItem[] = [
  { title: 'Control Center', url: '/admin/control-center', icon: Sliders, premium: true },
  { title: 'Owner Dashboard', url: '/admin/owner', icon: Crown, premium: true },
  { title: 'Broadcast', url: '/admin/broadcast', icon: Megaphone, premium: true },
];

// Setări Unificate (1 buton per categorie)
const settingsItems: MenuItem[] = [
  { title: 'Setări Unificate', url: '/admin/unified-settings', icon: Settings },
  { title: 'Categorii', url: '/admin/categories', icon: FolderTree },
  { title: 'Comisioane & Taxe', url: '/admin/fees', icon: DollarSign },
];

// Operațional
const operationalItems: MenuItem[] = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Utilizatori', url: '/admin/users', icon: Users },
  { title: 'Produse', url: '/admin/listings', icon: Package },
  { title: 'Comenzi', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Livrări', url: '/admin/deliveries', icon: Truck },
  { title: 'Retururi', url: '/admin/returns', icon: RotateCcw },
  { title: 'Licitații', url: '/admin/auctions', icon: Gavel },
];

// Comunicare & Securitate
const communicationItems: MenuItem[] = [
  { title: 'Mesaje', url: '/admin/messages', icon: MessageSquare },
  { title: 'Dispute', url: '/admin/disputes', icon: AlertTriangle },
  { title: 'Fraud Alerts', url: '/admin/fraud-alerts', icon: AlertTriangle, premium: true },
  { title: 'Plăți Vânzători', url: '/admin/seller-payouts', icon: Wallet },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
];

const SimpleMenuItem = ({ item, collapsed }: { item: MenuItem; collapsed: boolean }) => {
  const isPremium = item.premium;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          end={item.url === '/admin'}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl 
            transition-all duration-200
            ${isPremium 
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20' 
              : 'hover:bg-primary/10 border border-transparent hover:border-primary/20'
            }
          `}
          activeClassName={`
            bg-primary/20 border-primary/40 shadow-md
            ${isPremium ? 'bg-amber-500/20 border-amber-500/40' : ''}
          `}
        >
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-xl
            ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}
          `}>
            <item.icon className={`h-5 w-5 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </div>
          
          {!collapsed && (
            <span className={`font-medium ${isPremium ? 'text-amber-600' : ''}`}>
              {item.title}
            </span>
          )}
          
          {isPremium && !collapsed && (
            <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
              PRO
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} bg-background`} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">Admin</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2">
            Proprietar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {ownerItems.map((item) => (
                <SimpleMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2">
            Setări
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => (
                <SimpleMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2">
            Operațional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {operationalItems.map((item) => (
                <SimpleMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2">
            Comunicare
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {communicationItems.map((item) => (
                <SimpleMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
