import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  DollarSign, 
  MessageCircle,
  BarChart3,
  Shield,
  FileText,
  AlertTriangle,
  Crown,
  Key,
  Home,
  FolderTree,
  Mail,
  Search,
  Wrench,
  ClipboardList,
  Brain,
  Truck,
  Gavel,
  UserCheck,
  RotateCcw,
  Megaphone,
  CreditCard,
  Wallet
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

const menuItems = [
  { title: 'Owner Dashboard', url: '/admin/owner', icon: Crown, premium: true },
  { title: 'AI Sales Manager', url: '/admin/ai-sales', icon: Brain, premium: true },
  { title: 'AI Maintenance', url: '/admin/ai-maintenance', icon: Wrench, premium: true },
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Verificări Vânzători', url: '/admin/seller-verifications', icon: UserCheck },
  { title: 'Listings', url: '/admin/listings', icon: Package },
  { title: 'Licitații', url: '/admin/auctions', icon: Gavel },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Livrări', url: '/admin/deliveries', icon: Truck },
  { title: 'Retururi', url: '/admin/returns', icon: RotateCcw },
  { title: 'Messages', url: '/admin/messages', icon: MessageCircle },
  { title: 'Disputes', url: '/admin/disputes', icon: AlertTriangle },
  { title: 'Curieri API', url: '/admin/couriers', icon: Truck },
];

const financeItems = [
  { title: 'Procesatori Plăți', url: '/admin/payments', icon: CreditCard },
  { title: 'Fees & Pricing', url: '/admin/fees', icon: DollarSign },
  { title: 'Plăți Vânzători', url: '/admin/seller-payouts', icon: Wallet },
  { title: 'API & Chei', url: '/admin/api-settings', icon: Key },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
];

const settingsItems = [
  { title: 'Platform Settings', url: '/admin/settings', icon: Settings },
  { title: 'Securitate Avansată', url: '/admin/security', icon: Shield },
];

const contentItems = [
  { title: 'Homepage Editor', url: '/admin/homepage', icon: Home },
  { title: 'Categorii', url: '/admin/categories', icon: FolderTree },
  { title: 'Template-uri Email', url: '/admin/email-templates', icon: Mail },
  { title: 'SEO Settings', url: '/admin/seo', icon: Search },
];

const systemItems = [
  { title: 'Mentenanță', url: '/admin/maintenance', icon: Wrench },
  { title: 'Audit Log', url: '/admin/audit-log', icon: ClipboardList },
];

// Premium menu item component with extravagant styling
const PremiumMenuItem = ({ item, collapsed }: { item: typeof menuItems[0]; collapsed: boolean }) => {
  const isPremium = (item as any).premium;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          end={item.url === '/admin'}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl 
            transition-all duration-300 ease-out
            group overflow-hidden
            ${isPremium 
              ? 'bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:from-amber-500/15 hover:to-orange-500/15 border border-amber-500/20 hover:border-amber-500/40' 
              : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border border-transparent hover:border-primary/20'
            }
            hover:shadow-lg hover:shadow-primary/10
            hover:translate-x-1
          `}
          activeClassName={`
            bg-gradient-to-r from-primary/20 to-accent/20 
            border-primary/40 shadow-lg shadow-primary/20
            ${isPremium ? 'from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-amber-500/20' : ''}
          `}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className={`absolute inset-0 blur-xl ${isPremium ? 'bg-amber-500/10' : 'bg-primary/10'}`} />
          </div>
          
          {/* Icon container with premium styling */}
          <div className={`
            relative z-10 flex items-center justify-center
            w-9 h-9 rounded-lg
            transition-all duration-300
            ${isPremium 
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30 shadow-inner' 
              : 'bg-muted/50 group-hover:bg-primary/20 shadow-inner'
            }
            group-hover:scale-110 group-hover:shadow-md
          `}>
            <item.icon className={`
              h-4.5 w-4.5 flex-shrink-0 
              transition-all duration-300
              ${isPremium ? 'text-amber-500 group-hover:text-amber-400' : 'text-muted-foreground group-hover:text-primary'}
            `} />
          </div>
          
          {/* Text with premium styling */}
          {!collapsed && (
            <span className={`
              relative z-10 font-medium text-sm
              transition-all duration-300
              ${isPremium ? 'text-amber-600 group-hover:text-amber-500' : 'group-hover:text-primary'}
            `}>
              {item.title}
            </span>
          )}
          
          {/* Premium badge */}
          {isPremium && !collapsed && (
            <div className="ml-auto relative z-10">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-sm">
                Pro
              </span>
            </div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

// Standard menu item with elegant styling
const ElegantMenuItem = ({ item, collapsed }: { item: { title: string; url: string; icon: any }; collapsed: boolean }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl 
            transition-all duration-300 ease-out
            group overflow-hidden
            hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 
            border border-transparent hover:border-primary/20
            hover:shadow-lg hover:shadow-primary/10
            hover:translate-x-1
          `}
          activeClassName="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 shadow-lg shadow-primary/20"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 blur-xl bg-primary/10" />
          </div>
          
          {/* Icon container */}
          <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 group-hover:bg-primary/20 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <item.icon className="h-4.5 w-4.5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-all duration-300" />
          </div>
          
          {/* Text */}
          {!collapsed && (
            <span className="relative z-10 font-medium text-sm group-hover:text-primary transition-all duration-300">
              {item.title}
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
    <Sidebar className={`${collapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-background to-muted/30`} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-5 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Panou Admin
              </span>
              <p className="text-xs text-muted-foreground">Control Center</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <PremiumMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            Finanțe & Plăți
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {financeItems.map((item) => (
                <ElegantMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-2">
            <Settings className="h-3 w-3" />
            Setări
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => (
                <ElegantMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-2">
            <FolderTree className="h-3 w-3" />
            Conținut
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {contentItems.map((item) => (
                <ElegantMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Legal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <ElegantMenuItem 
                item={{ title: 'Politici', url: '/admin/policies', icon: FileText }} 
                collapsed={collapsed} 
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-2">
            <Wrench className="h-3 w-3" />
            Sistem
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemItems.map((item) => (
                <ElegantMenuItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}