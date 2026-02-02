import {
  LayoutDashboard, Users, Package, ShoppingCart, Settings,
  DollarSign, BarChart3, Shield, Crown, Megaphone, Sliders,
  LucideIcon, Truck, RotateCcw, Gavel, MessageSquare,
  AlertTriangle, Wallet, FolderTree, CreditCard, Globe,
  Home, Mail, FileText, UserCheck, Search, Smartphone,
  Bot, Palette, Database, Activity, ClipboardList, Key
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  premium?: boolean;
}

const ownerItems: MenuItem[] = [
  { title: 'Control Center', url: '/admin/control-center', icon: Sliders, premium: true },
  { title: 'Owner Dashboard', url: '/admin', icon: LayoutDashboard, premium: true },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administrare</SidebarGroupLabel>
          <SidebarMenu>
            {ownerItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
