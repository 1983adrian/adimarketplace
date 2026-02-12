import {
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings,
  Shield,
  LucideIcon,
  Truck,
  RotateCcw,
  Gavel,
  MessageSquare,
  AlertTriangle,
  Wallet,
  FolderTree,
  FileText,
  Globe,
  Mail,
  Megaphone,
  Crown,
  Wrench,
  ClipboardList,
  CreditCard,
  KeyRound
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
}

const mainItems: MenuItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Utilizatori', url: '/admin/users', icon: Users },
  { title: 'Produse', url: '/admin/listings', icon: Package },
  { title: 'Comenzi', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Livrări', url: '/admin/deliveries', icon: Truck },
  { title: 'Retururi', url: '/admin/returns', icon: RotateCcw },
  { title: 'Licitații', url: '/admin/auctions', icon: Gavel },
  { title: 'Dispute', url: '/admin/disputes', icon: AlertTriangle },
];

const sellersItems: MenuItem[] = [
  { title: 'Verificări', url: '/admin/seller-verifications', icon: Shield },
  { title: 'Plăți Vânzători', url: '/admin/seller-payouts', icon: Wallet },
  { title: 'Abonamente', url: '/admin/seller-subscriptions', icon: Crown },
  { title: 'Alerte Fraudă', url: '/admin/fraud-alerts', icon: AlertTriangle },
];

const contentItems: MenuItem[] = [
  { title: 'Setări Platformă', url: '/admin/settings', icon: Settings },
  { title: '🔑 Chei API', url: '/admin/payments', icon: KeyRound },
  { title: 'Pagina Principală', url: '/admin/homepage', icon: LayoutDashboard },
  { title: 'Categorii', url: '/admin/categories', icon: FolderTree },
  { title: 'Politici & Legal', url: '/admin/policies', icon: FileText },
  { title: 'SEO', url: '/admin/seo', icon: Globe },
];

const communicationItems: MenuItem[] = [
  { title: 'Mesaje', url: '/admin/messages', icon: MessageSquare },
  { title: 'Email Templates', url: '/admin/email-templates', icon: Mail },
  { title: 'Broadcast', url: '/admin/broadcast', icon: Megaphone },
  { title: 'Mentenanță', url: '/admin/maintenance', icon: Wrench },
  { title: 'Jurnal Audit', url: '/admin/audit-log', icon: ClipboardList },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const renderGroup = (label: string, items: MenuItem[]) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.url} 
                  end={item.url === '/admin'}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className={`${collapsed ? 'w-14' : 'w-56'} bg-background border-r`} collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm">Admin Panel</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {renderGroup('Operațional', mainItems)}
        {renderGroup('Vânzători', sellersItems)}
        {renderGroup('Configurare', contentItems)}
        {renderGroup('Sistem', communicationItems)}
      </SidebarContent>
    </Sidebar>
  );
}
