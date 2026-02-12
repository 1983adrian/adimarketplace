import { useState } from 'react';
import { 
  Settings, Palette, Bell, Link as LinkIcon, Users, Store, Shield,
  Save, Loader2, Plus, Trash2, Eye, EyeOff, Globe, Volume2, CheckCircle2,
  Facebook, Instagram, Youtube, Twitter, ExternalLink, Mail, Smartphone,
  Home, Layout, Type, Image, FileText, Tag, CreditCard, DollarSign
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';
import { usePlatformFees } from '@/hooks/useAdmin';
import { useCoinSound } from '@/hooks/useCoinSound';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Interface Settings Component
const InterfaceSettingsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const [dashboardButtons, setDashboardButtons] = useState<any[]>([]);

  const handleSaveInterface = async () => {
    try {
      await updateSetting.mutateAsync({ 
        key: 'dashboard_buttons', 
        value: dashboardButtons, 
        category: 'interface' 
      });
      toast({ title: 'Interfață salvată cu succes!' });
    } catch (error) {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Setări Interfață
          </h3>
          <p className="text-sm text-muted-foreground">Personalizează butoane, culori și layout-ul dashboard-ului</p>
        </div>
        <Button onClick={handleSaveInterface} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Salvează
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dashboard-menu">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span>Butoane Meniu Dashboard</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Configurează butoanele afișate în meniul utilizatorului.
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Deschide Editor Interfață Complet
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="homepage">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Pagină Principală</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Modifică hero section, bannere și secțiuni.
              </p>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href="/admin/homepage">
                  <ExternalLink className="h-4 w-4" />
                  Deschide Editor Homepage
                </a>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Seller Settings Component  
const SellerSettingsSection = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const { data: fees } = usePlatformFees();
  
  const [marketplaceSettings, setMarketplaceSettings] = useState({
    requireSellerVerification: false,
    autoApproveListings: true,
    maxImagesPerListing: 10,
    maxListingPrice: 100000,
  });

  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');
  const promotionFee = fees?.find(f => f.fee_type === 'weekly_promotion');

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ 
        key: 'marketplace', 
        value: marketplaceSettings, 
        category: 'platform' 
      });
      toast({ title: 'Setări vânzător salvate!' });
    } catch (error) {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Setări Vânzători & Taxe
          </h3>
          <p className="text-sm text-muted-foreground">Comisioane, verificări KYC și reguli de listare</p>
        </div>
        <Button onClick={handleSave} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Salvează
        </Button>
      </div>

      {/* Current Fees Display */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Comision Vânzător</p>
                <p className="text-2xl font-bold text-green-600">{sellerCommission?.amount || 8}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxă Cumpărător</p>
                <p className="text-2xl font-bold text-blue-600">£{buyerFee?.amount || 2}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Promovare 7 zile</p>
                <p className="text-2xl font-bold text-amber-600">£{promotionFee?.amount || 5}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="verification">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Verificare Vânzători (KYC)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Verificare obligatorie înainte de vânzare</Label>
                  <p className="text-xs text-muted-foreground">Vânzătorii trebuie să trimită documente KYC</p>
                </div>
                <Switch 
                  checked={marketplaceSettings.requireSellerVerification}
                  onCheckedChange={(checked) => setMarketplaceSettings(prev => ({
                    ...prev, requireSellerVerification: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aprobare automată anunțuri</Label>
                  <p className="text-xs text-muted-foreground">Anunțurile apar imediat fără aprobare manuală</p>
                </div>
                <Switch 
                  checked={marketplaceSettings.autoApproveListings}
                  onCheckedChange={(checked) => setMarketplaceSettings(prev => ({
                    ...prev, autoApproveListings: checked
                  }))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="limits">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Limite Anunțuri</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Maxim imagini per anunț</Label>
                  <Input 
                    type="number" 
                    value={marketplaceSettings.maxImagesPerListing}
                    onChange={(e) => setMarketplaceSettings(prev => ({
                      ...prev, maxImagesPerListing: Number(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preț maxim anunț (£)</Label>
                  <Input 
                    type="number" 
                    value={marketplaceSettings.maxListingPrice}
                    onChange={(e) => setMarketplaceSettings(prev => ({
                      ...prev, maxListingPrice: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fees-edit">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Editare Comisioane</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href="/admin/fees">
                  <ExternalLink className="h-4 w-4" />
                  Deschide Editor Taxe Complet
                </a>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Notifications Settings Component
const NotificationsSettingsSection = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const { playCoinSound } = useCoinSound();
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    adminAlerts: true,
    pushNotifications: true,
  });

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ 
        key: 'notifications', 
        value: notifications, 
        category: 'platform' 
      });
      toast({ title: 'Setări notificări salvate!' });
    } catch (error) {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    }
  };

  const testCoinSound = () => {
    playCoinSound();
    toast({ title: '🪙 Sunet testat!', description: 'Acesta este sunetul de primire bani.' });
  };

  if (isLoading) return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificări & Alerte
          </h3>
          <p className="text-sm text-muted-foreground">Email, push și sunete de notificare</p>
        </div>
        <Button onClick={handleSave} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Salvează
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Notificări Email Globale</Label>
            <p className="text-xs text-muted-foreground">Activează/dezactivează toate emailurile</p>
          </div>
          <Switch 
            checked={notifications.emailNotifications}
            onCheckedChange={(checked) => setNotifications(prev => ({...prev, emailNotifications: checked}))}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Confirmare Comenzi</Label>
            <p className="text-xs text-muted-foreground">Email la plasarea comenzii</p>
          </div>
          <Switch 
            checked={notifications.orderConfirmation}
            onCheckedChange={(checked) => setNotifications(prev => ({...prev, orderConfirmation: checked}))}
            disabled={!notifications.emailNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Actualizări Livrare</Label>
            <p className="text-xs text-muted-foreground">Notificări status expediere</p>
          </div>
          <Switch 
            checked={notifications.shippingUpdates}
            onCheckedChange={(checked) => setNotifications(prev => ({...prev, shippingUpdates: checked}))}
            disabled={!notifications.emailNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Alerte Admin</Label>
            <p className="text-xs text-muted-foreground">Notificări pentru dispute și comenzi noi</p>
          </div>
          <Switch 
            checked={notifications.adminAlerts}
            onCheckedChange={(checked) => setNotifications(prev => ({...prev, adminAlerts: checked}))}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Sunet Monedă Vânzători</Label>
            <p className="text-xs text-muted-foreground">Sunet când vânzătorul primește bani</p>
          </div>
          <Button variant="outline" size="sm" onClick={testCoinSound} className="gap-2">
            <Volume2 className="h-4 w-4" />
            Testează
          </Button>
        </div>
      </div>
    </div>
  );
};

// Links & Social Settings Component
const LinksSettingsSection = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  
  const [social, setSocial] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
  });

  const [general, setGeneral] = useState({
    siteName: 'Marketplace România',
    siteDescription: 'Marketplace-ul tău de încredere',
    supportEmail: 'support@marketplace.ro',
  });

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'social', value: social, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'general', value: general, category: 'platform' }),
      ]);
      toast({ title: 'Link-uri salvate cu succes!' });
    } catch (error) {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Link-uri & Afișare
          </h3>
          <p className="text-sm text-muted-foreground">Rețele sociale, SEO și informații platformă</p>
        </div>
        <Button onClick={handleSave} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Salvează
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="general-info">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Informații Generale Platformă</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Nume Platformă</Label>
                <Input 
                  value={general.siteName}
                  onChange={(e) => setGeneral(prev => ({...prev, siteName: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Descriere (SEO)</Label>
                <Textarea 
                  value={general.siteDescription}
                  onChange={(e) => setGeneral(prev => ({...prev, siteDescription: e.target.value}))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Suport</Label>
                <Input 
                  type="email"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral(prev => ({...prev, supportEmail: e.target.value}))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="social-links">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              <span>Rețele Sociale</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  </Label>
                  <Input 
                    value={social.facebook}
                    onChange={(e) => setSocial(prev => ({...prev, facebook: e.target.value}))}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" /> Instagram
                  </Label>
                  <Input 
                    value={social.instagram}
                    onChange={(e) => setSocial(prev => ({...prev, instagram: e.target.value}))}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" /> Twitter/X
                  </Label>
                  <Input 
                    value={social.twitter}
                    onChange={(e) => setSocial(prev => ({...prev, twitter: e.target.value}))}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" /> YouTube
                  </Label>
                  <Input 
                    value={social.youtube}
                    onChange={(e) => setSocial(prev => ({...prev, youtube: e.target.value}))}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seo">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>SEO & Indexare Google</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href="/admin/seo">
                  <ExternalLink className="h-4 w-4" />
                  Deschide Setări SEO
                </a>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="policies">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Politici & Termeni</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href="/admin/policies">
                  <ExternalLink className="h-4 w-4" />
                  Editează Politici
                </a>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Main Component
export default function AdminUnifiedSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Setări Unificate</h1>
            <p className="text-sm text-muted-foreground">
              Toate setările platformei într-un singur loc - salvează instantaneu
            </p>
          </div>
        </div>

        <Tabs defaultValue="interface" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="interface" className="gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Interfață</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-2 py-3">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Vânzători</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificări</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2 py-3">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Link-uri</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interface">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <InterfaceSettingsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <SellerSettingsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <NotificationsSettingsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <LinksSettingsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
