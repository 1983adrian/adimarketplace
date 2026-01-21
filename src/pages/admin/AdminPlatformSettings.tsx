import { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Store, Loader2, Settings, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
  };
  localization: {
    defaultLanguage: string;
    defaultCurrency: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderConfirmation: boolean;
    shippingUpdates: boolean;
    adminAlerts: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  marketplace: {
    requireSellerVerification: boolean;
    autoApproveListings: boolean;
    maxImagesPerListing: number;
    maxListingPrice: number;
  };
}

const defaultSettings: PlatformSettings = {
  general: {
    siteName: 'C.Market',
    siteDescription: 'Your trusted online marketplace - Buy & Sell Smart',
    supportEmail: 'support@cmarket.com',
  },
  localization: {
    defaultLanguage: 'en',
    defaultCurrency: 'GBP',
  },
  notifications: {
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    adminAlerts: true,
  },
  security: {
    requireEmailVerification: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  marketplace: {
    requireSellerVerification: false,
    autoApproveListings: true,
    maxImagesPerListing: 10,
    maxListingPrice: 100000,
  },
};

const AdminPlatformSettings = () => {
  const { toast } = useToast();
  const { data: dbSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (dbSettings) {
      const loadedSettings: PlatformSettings = {
        general: { ...defaultSettings.general, ...dbSettings['general'] },
        localization: { ...defaultSettings.localization, ...dbSettings['localization'] },
        notifications: { ...defaultSettings.notifications, ...dbSettings['notifications'] },
        security: { ...defaultSettings.security, ...dbSettings['security'] },
        marketplace: { ...defaultSettings.marketplace, ...dbSettings['marketplace'] },
      };
      setSettings(loadedSettings);
    }
  }, [dbSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'general', value: settings.general, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'localization', value: settings.localization, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'notifications', value: settings.notifications, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'security', value: settings.security, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'marketplace', value: settings.marketplace, category: 'platform' }),
      ]);
      setLastSaved(new Date());
      toast({ 
        title: '✓ Setări salvate', 
        description: 'Toate setările au fost actualizate cu succes.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Eroare la salvare', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateGeneral = (key: keyof PlatformSettings['general'], value: string) => {
    setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
  };

  const updateLocalization = (key: keyof PlatformSettings['localization'], value: string) => {
    setSettings(prev => ({ ...prev, localization: { ...prev.localization, [key]: value } }));
  };

  const updateNotifications = (key: keyof PlatformSettings['notifications'], value: boolean) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  };

  const updateSecurity = (key: keyof PlatformSettings['security'], value: any) => {
    setSettings(prev => ({ ...prev, security: { ...prev.security, [key]: value } }));
  };

  const updateMarketplace = (key: keyof PlatformSettings['marketplace'], value: any) => {
    setSettings(prev => ({ ...prev, marketplace: { ...prev.marketplace, [key]: value } }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Se încarcă setările...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Setări Platformă</h1>
              <p className="text-sm text-muted-foreground">
                Configurează setările globale ale platformei C.Market
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Salvat la {lastSaved.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="lg"
              className="gap-2 shadow-md"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvează
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
            <TabsTrigger value="general" className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificări</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Securitate</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Informații Generale</CardTitle>
                </div>
                <CardDescription>Configurează detaliile de bază ale platformei</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nume Platformă</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => updateGeneral('siteName', e.target.value)}
                      placeholder="C.Market"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email Suport</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                      placeholder="support@cmarket.com"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descriere Platformă</Label>
                  <Textarea
                    id="description"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateGeneral('siteDescription', e.target.value)}
                    placeholder="Descrie marketplace-ul tău..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Această descriere apare în SEO și meta taguri
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Limba Implicită</Label>
                    <Select
                      value={settings.localization.defaultLanguage}
                      onValueChange={(value) => updateLocalization('defaultLanguage', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="ro">🇷🇴 Română</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moneda Implicită</Label>
                    <Select
                      value={settings.localization.defaultCurrency}
                      onValueChange={(value) => updateLocalization('defaultCurrency', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">£ Liră Sterlină (GBP)</SelectItem>
                        <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                        <SelectItem value="RON">Lei (RON)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Setări Notificări</CardTitle>
                </div>
                <CardDescription>Configurează notificările email pentru utilizatori și admin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <SettingSwitch
                  label="Notificări Email Globale"
                  description="Activează/dezactivează toate notificările prin email"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
                  badge={settings.notifications.emailNotifications ? 'Activ' : 'Inactiv'}
                />

                <Separator />

                <SettingSwitch
                  label="Confirmări Comenzi"
                  description="Email automat când o comandă este plasată"
                  checked={settings.notifications.orderConfirmation}
                  onCheckedChange={(checked) => updateNotifications('orderConfirmation', checked)}
                  disabled={!settings.notifications.emailNotifications}
                />

                <SettingSwitch
                  label="Actualizări Livrare"
                  description="Notifică clienții când statusul livrării se schimbă"
                  checked={settings.notifications.shippingUpdates}
                  onCheckedChange={(checked) => updateNotifications('shippingUpdates', checked)}
                  disabled={!settings.notifications.emailNotifications}
                />

                <SettingSwitch
                  label="Alerte Admin"
                  description="Primește alerte pentru comenzi noi, dispute și evenimente critice"
                  checked={settings.notifications.adminAlerts}
                  onCheckedChange={(checked) => updateNotifications('adminAlerts', checked)}
                  disabled={!settings.notifications.emailNotifications}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Setări Securitate</CardTitle>
                </div>
                <CardDescription>Configurează regulile de autentificare și securitate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <SettingSwitch
                  label="Verificare Email Obligatorie"
                  description="Utilizatorii trebuie să confirme emailul înainte de a folosi platforma"
                  checked={settings.security.requireEmailVerification}
                  onCheckedChange={(checked) => updateSecurity('requireEmailVerification', checked)}
                />

                <Separator />

                <div className="grid gap-5 sm:grid-cols-2 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Timeout Sesiune (minute)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value) || 60)}
                      min={15}
                      max={1440}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sesiunea expiră după perioada de inactivitate (15-1440 min)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Încercări Maxime Login</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSecurity('maxLoginAttempts', parseInt(e.target.value) || 5)}
                      min={3}
                      max={10}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contul se blochează temporar după încercări eșuate (3-10)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <CardTitle>Reguli Marketplace</CardTitle>
                </div>
                <CardDescription>Configurează comportamentul și limitele marketplace-ului</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <SettingSwitch
                  label="Verificare Vânzători Obligatorie"
                  description="Vânzătorii trebuie verificați KYC înainte de a lista produse"
                  checked={settings.marketplace.requireSellerVerification}
                  onCheckedChange={(checked) => updateMarketplace('requireSellerVerification', checked)}
                  badge={settings.marketplace.requireSellerVerification ? 'Securizat' : 'Deschis'}
                />

                <SettingSwitch
                  label="Aprobare Automată Listări"
                  description="Listările noi sunt publicate imediat fără revizuire manuală"
                  checked={settings.marketplace.autoApproveListings}
                  onCheckedChange={(checked) => updateMarketplace('autoApproveListings', checked)}
                />

                <Separator />

                <div className="grid gap-5 sm:grid-cols-2 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxImages">Imagini Maxime per Produs</Label>
                    <Input
                      id="maxImages"
                      type="number"
                      value={settings.marketplace.maxImagesPerListing}
                      onChange={(e) => updateMarketplace('maxImagesPerListing', parseInt(e.target.value) || 10)}
                      min={1}
                      max={20}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Numărul maxim de imagini permise per listare (1-20)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Preț Maxim Listare (£)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={settings.marketplace.maxListingPrice}
                      onChange={(e) => updateMarketplace('maxListingPrice', parseInt(e.target.value) || 100000)}
                      min={100}
                      max={10000000}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Prețul maxim permis pentru o singură listare
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Reusable Switch Component
interface SettingSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

const SettingSwitch = ({ label, description, checked, onCheckedChange, disabled, badge }: SettingSwitchProps) => (
  <div className={`flex items-center justify-between py-4 ${disabled ? 'opacity-50' : ''}`}>
    <div className="space-y-0.5 pr-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {badge && (
          <Badge variant={checked ? 'default' : 'secondary'} className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

export default AdminPlatformSettings;
