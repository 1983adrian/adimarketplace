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
  Brain
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
  { title: 'Owner Dashboard', url: '/admin/owner', icon: Crown },
  { title: 'AI Manager', url: '/admin/ai-manager', icon: Brain },
  { title: 'AI Sales Manager', url: '/admin/ai-sales', icon: Brain },
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Listings', url: '/admin/listings', icon: Package },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Messages', url: '/admin/messages', icon: MessageCircle },
  { title: 'Disputes', url: '/admin/disputes', icon: AlertTriangle },
  { title: 'Fees & Pricing', url: '/admin/fees', icon: DollarSign },
  { title: 'API Settings', url: '/admin/api-settings', icon: Key },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Platform Settings', url: '/admin/settings', icon: Settings },
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

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {!collapsed && <span className="font-bold text-lg">Panou Admin</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
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

        <SidebarGroup>
          <SidebarGroupLabel>Conținut</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
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

        <SidebarGroup>
          <SidebarGroupLabel>Legal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/policies" 
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>Politici</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
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
      </SidebarContent>
    </Sidebar>
  );
}
