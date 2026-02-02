import { 
  LayoutDashboard, Users, Package, ShoppingCart, Settings, Sliders, 
  Shield, Crown, Truck, Gavel, Wallet, Globe, Activity
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { 
  Sidebar, SidebarContent, SidebarGroup, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarHeader 
} from '@/components/ui/sidebar';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Utilizatori', url: '/admin/users', icon: Users },
  { title: 'Anunțuri', url: '/admin/listings', icon: Package },
  { title: 'Comenzi', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Control Center', url: '/admin/control-center', icon: Sliders, premium: true },
  { title: 'Setări Platformă', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 font-bold text-xl">Admin Panel</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.premium && <Crown className="h-3 w-3 text-amber-500" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
