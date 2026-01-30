import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, Users, Package, ShoppingCart, FileText, CreditCard, 
  Shield, Bell, Globe, Truck, MessageSquare, BarChart3, 
  Palette, Mail, Megaphone, Gavel, AlertTriangle, RefreshCcw,
  Smartphone, Home, Tag, ChevronRight, Search, Layout,
  Database, Lock, DollarSign, FileCheck, Eye, Pencil, Trash2,
  Plus, CheckCircle2, XCircle, MoreHorizontal
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ControlSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  stats?: string;
  actions: ('view' | 'edit' | 'add' | 'delete')[];
  category: 'platform' | 'content' | 'users' | 'commerce' | 'communication';
}

const controlSections: ControlSection[] = [
  // Platform Settings
  { 
    id: 'platform-settings', 
    title: 'Setări Platformă', 
    description: 'Modifică numele, descrierea, limba și moneda platformei',
    icon: Settings, 
    href: '/admin/platform-settings',
    color: 'text-blue-600 bg-blue-500/10',
    actions: ['view', 'edit'],
    category: 'platform'
  },
  { 
    id: 'security', 
    title: 'Securitate', 
    description: 'Controlează autentificarea, sesiunile și protecția conturilor',
    icon: Shield, 
    href: '/admin/security-settings',
    color: 'text-red-600 bg-red-500/10',
    actions: ['view', 'edit'],
    category: 'platform'
  },
  { 
    id: 'fees', 
    title: 'Comisioane & Taxe', 
    description: 'Setează procentul luat de platformă din fiecare vânzare',
    icon: DollarSign, 
    href: '/admin/fees',
    color: 'text-emerald-600 bg-emerald-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'platform'
  },
  { 
    id: 'api-settings', 
    title: 'Setări API', 
    description: 'Configurează cheile pentru plăți, email și SMS',
    icon: Database, 
    href: '/admin/api-settings',
    color: 'text-purple-600 bg-purple-500/10',
    actions: ['view', 'edit'],
    category: 'platform'
  },
  { 
    id: 'payment-processors', 
    title: 'Procesatori Plăți', 
    description: 'Activează MangoPay, Adyen sau alți procesatori de carduri',
    icon: CreditCard, 
    href: '/admin/payment-processors',
    color: 'text-indigo-600 bg-indigo-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'platform'
  },
  
  // Content Management
  { 
    id: 'homepage', 
    title: 'Editor Pagină Principală', 
    description: 'Modifică textele și bannerele de pe prima pagină',
    icon: Home, 
    href: '/admin/homepage',
    color: 'text-pink-600 bg-pink-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'content'
  },
  { 
    id: 'interface', 
    title: 'Editor Interfață', 
    description: 'Schimbă textele butoanelor și mesajele din aplicație',
    icon: Layout, 
    href: '/admin/interface-editor',
    color: 'text-cyan-600 bg-cyan-500/10',
    actions: ['view', 'edit'],
    category: 'content'
  },
  { 
    id: 'categories', 
    title: 'Categorii', 
    description: 'Adaugă sau șterge categorii de produse (Haine, Electronice, etc.)',
    icon: Tag, 
    href: '/admin/categories',
    color: 'text-orange-600 bg-orange-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'content'
  },
  { 
    id: 'policies', 
    title: 'Politici & Legal', 
    description: 'Editează Termenii, Politica de Confidențialitate și Cookie-uri',
    icon: FileCheck, 
    href: '/admin/policies',
    color: 'text-slate-600 bg-slate-500/10',
    actions: ['view', 'edit'],
    category: 'content'
  },
  { 
    id: 'seo', 
    title: 'SEO & Meta', 
    description: 'Optimizează titlurile și descrierile pentru Google',
    icon: Globe, 
    href: '/admin/seo',
    color: 'text-teal-600 bg-teal-500/10',
    actions: ['view', 'edit'],
    category: 'content'
  },
  { 
    id: 'seo-dashboard', 
    title: 'SEO Dashboard & Indexare Google', 
    description: 'Monitorizează indexarea Google, cuvintele cheie și activitatea platformei',
    icon: Search, 
    href: '/admin/seo-dashboard',
    color: 'text-green-600 bg-green-500/10',
    actions: ['view', 'edit'],
    category: 'content'
  },
  
  // Users & Sellers
  { 
    id: 'users', 
    title: 'Utilizatori', 
    description: 'Vezi toți utilizatorii, suspendă sau șterge conturi',
    icon: Users, 
    href: '/admin/users',
    color: 'text-blue-600 bg-blue-500/10',
    actions: ['view', 'edit', 'delete'],
    category: 'users'
  },
  { 
    id: 'seller-verifications', 
    title: 'Verificări Vânzători', 
    description: 'Aprobă sau respinge documentele KYC ale vânzătorilor',
    icon: CheckCircle2, 
    href: '/admin/seller-verifications',
    color: 'text-green-600 bg-green-500/10',
    actions: ['view', 'edit'],
    category: 'users'
  },
  { 
    id: 'seller-payouts', 
    title: 'Plăți Vânzători', 
    description: 'Procesează și trimite banii către vânzători',
    icon: CreditCard, 
    href: '/admin/seller-payouts',
    color: 'text-amber-600 bg-amber-500/10',
    actions: ['view', 'edit'],
    category: 'users'
  },
  { 
    id: 'fraud-alerts', 
    title: 'Alerte Fraudă', 
    description: 'Vezi conturile suspecte detectate de AI și blochează extragerea banilor',
    icon: AlertTriangle, 
    href: '/admin/fraud-alerts',
    color: 'text-red-600 bg-red-500/10',
    actions: ['view', 'edit'],
    category: 'users'
  },
  
  // Commerce
  { 
    id: 'listings', 
    title: 'Anunțuri', 
    description: 'Vezi, aprobă sau șterge produsele listate de vânzători',
    icon: Package, 
    href: '/admin/listings',
    color: 'text-violet-600 bg-violet-500/10',
    actions: ['view', 'edit', 'delete'],
    category: 'commerce'
  },
  { 
    id: 'orders', 
    title: 'Comenzi', 
    description: 'Monitorizează toate comenzile și statusul lor',
    icon: ShoppingCart, 
    href: '/admin/orders',
    color: 'text-blue-600 bg-blue-500/10',
    actions: ['view', 'edit'],
    category: 'commerce'
  },
  { 
    id: 'auctions', 
    title: 'Licitații', 
    description: 'Vezi licitațiile active și câștigătorii',
    icon: Gavel, 
    href: '/admin/auctions',
    color: 'text-orange-600 bg-orange-500/10',
    actions: ['view', 'edit'],
    category: 'commerce'
  },
  { 
    id: 'returns', 
    title: 'Retururi', 
    description: 'Gestionează cererile de retur și rambursează banii',
    icon: RefreshCcw, 
    href: '/admin/returns',
    color: 'text-red-600 bg-red-500/10',
    actions: ['view', 'edit'],
    category: 'commerce'
  },
  { 
    id: 'disputes', 
    title: 'Dispute', 
    description: 'Rezolvă conflictele între cumpărători și vânzători',
    icon: AlertTriangle, 
    href: '/admin/disputes',
    color: 'text-yellow-600 bg-yellow-500/10',
    actions: ['view', 'edit'],
    category: 'commerce'
  },
  { 
    id: 'couriers', 
    title: 'Curieri', 
    description: 'Adaugă curieri (FAN, Sameday, DPD) și setează prețuri livrare',
    icon: Truck, 
    href: '/admin/couriers',
    color: 'text-cyan-600 bg-cyan-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'commerce'
  },
  
  // Communication
  { 
    id: 'messages', 
    title: 'Mesaje', 
    description: 'Citește conversațiile dintre utilizatori (monitorizare)',
    icon: MessageSquare, 
    href: '/admin/messages',
    color: 'text-indigo-600 bg-indigo-500/10',
    actions: ['view'],
    category: 'communication'
  },
  { 
    id: 'email-templates', 
    title: 'Template-uri Email', 
    description: 'Editează emailurile automate (confirmare comandă, resetare parolă)',
    icon: Mail, 
    href: '/admin/email-templates',
    color: 'text-pink-600 bg-pink-500/10',
    actions: ['view', 'edit', 'add', 'delete'],
    category: 'communication'
  },
  { 
    id: 'broadcast', 
    title: 'Broadcast & Campanii', 
    description: 'Trimite mesaje sau emailuri în masă către toți utilizatorii',
    icon: Megaphone, 
    href: '/admin/broadcast',
    color: 'text-purple-600 bg-purple-500/10',
    actions: ['view', 'add'],
    category: 'communication'
  },
  { 
    id: 'mobile-app', 
    title: 'Aplicație Mobilă', 
    description: 'Setări pentru aplicația iOS și Android (push notifications)',
    icon: Smartphone, 
    href: '/admin/mobile-app',
    color: 'text-emerald-600 bg-emerald-500/10',
    actions: ['view', 'edit'],
    category: 'platform'
  },
];

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  platform: { label: 'Platformă', icon: Settings },
  content: { label: 'Conținut', icon: FileText },
  users: { label: 'Utilizatori', icon: Users },
  commerce: { label: 'Comerț', icon: ShoppingCart },
  communication: { label: 'Comunicare', icon: MessageSquare },
};

const AdminControlCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch quick stats
  const { data: stats } = useQuery({
    queryKey: ['admin-control-center-stats'],
    queryFn: async () => {
      const [usersResult, listingsResult, ordersResult, disputesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      
      return {
        users: usersResult.count || 0,
        listings: listingsResult.count || 0,
        orders: ordersResult.count || 0,
        pendingDisputes: disputesResult.count || 0,
      };
    },
  });

  const filteredSections = controlSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-3 w-3" />;
      case 'edit': return <Pencil className="h-3 w-3" />;
      case 'add': return <Plus className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'view': return 'Vezi';
      case 'edit': return 'Editează';
      case 'add': return 'Adaugă';
      case 'delete': return 'Șterge';
      default: return action;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Control Center</h1>
              <p className="text-muted-foreground">
                Centru de comandă pentru toate setările și funcționalitățile platformei
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.users || 0}</p>
                    <p className="text-xs text-muted-foreground">Utilizatori</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.listings || 0}</p>
                    <p className="text-xs text-muted-foreground">Anunțuri Active</p>
                  </div>
                  <Package className="h-8 w-8 text-emerald-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/10 to-violet-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Comenzi Total</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-violet-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.pendingDisputes || 0}</p>
                    <p className="text-xs text-muted-foreground">Dispute Pending</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-600/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută setări, funcționalități..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="h-11 w-full sm:w-auto">
              <TabsTrigger value="all" className="px-3">Toate</TabsTrigger>
              {Object.entries(categoryLabels).map(([key, { label }]) => (
                <TabsTrigger key={key} value={key} className="px-3 hidden sm:flex">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Category Filter */}
        <div className="flex gap-2 overflow-x-auto sm:hidden pb-2">
          {Object.entries(categoryLabels).map(([key, { label, icon: Icon }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex-shrink-0 gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>

        {/* Control Sections Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.id} 
                className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${section.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {categoryLabels[section.category]?.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{section.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {section.actions.map((action) => (
                        <Badge 
                          key={action} 
                          variant="secondary" 
                          className="gap-1 text-xs px-2 py-0.5"
                        >
                          {getActionIcon(action)}
                          <span className="hidden sm:inline">{getActionLabel(action)}</span>
                        </Badge>
                      ))}
                    </div>
                    <Button asChild size="sm" className="gap-1.5 group-hover:gap-2 transition-all">
                      <Link to={section.href}>
                        Deschide
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSections.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nu am găsit rezultate pentru "{searchQuery}"
              </p>
              <p className="text-sm text-muted-foreground">
                Încearcă să cauți altceva sau schimbă categoria
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                Resetează filtrele
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Access Footer */}
        <Card className="border-0 shadow-sm bg-muted/30">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Acces rapid:</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/analytics">📊 Analytics</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/audit-log">📝 Audit Log</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/maintenance">🔧 Mentenanță</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/button-audit">🔘 Audit Butoane</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminControlCenter;
