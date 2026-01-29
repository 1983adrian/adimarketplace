import { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Store, Loader2, Settings, CheckCircle2, Volume2, Share2, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
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
import { useCoinSound } from '@/hooks/useCoinSound';

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
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
}

const defaultSettings: PlatformSettings = {
  general: {
    siteName: 'Marketplace România',
    siteDescription: 'Marketplace-ul tău de încredere - Cumpără și Vinde Smart',
    supportEmail: 'support@marketplace-romania.ro',
  },
  localization: {
    defaultLanguage: 'ro',
    defaultCurrency: 'RON',
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
  social: {
    facebook: 'https://facebook.com/marketplace.romania',
    instagram: 'https://instagram.com/marketplace.romania',
    twitter: 'https://twitter.com/marketplace_ro',
    youtube: 'https://youtube.com/@marketplace-romania',
    tiktok: 'https://tiktok.com/@marketplace.romania',
  },
};

const AdminPlatformSettings = () => {
  const { toast } = useToast();
  const { data: dbSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { playCoinSound } = useCoinSound();

  const handleTestCoinSound = () => {
    playCoinSound();
    toast({
      title: '🪙 Sunet Testat!',
      description: 'Acesta este sunetul pe care îl aud vânzătorii când primesc bani.',
    });
  };

  useEffect(() => {
    if (dbSettings) {
      const loadedSettings: PlatformSettings = {
        general: { ...defaultSettings.general, ...dbSettings['general'] },
        localization: { ...defaultSettings.localization, ...dbSettings['localization'] },
        notifications: { ...defaultSettings.notifications, ...dbSettings['notifications'] },
        security: { ...defaultSettings.security, ...dbSettings['security'] },
        marketplace: { ...defaultSettings.marketplace, ...dbSettings['marketplace'] },
        social: { ...defaultSettings.social, ...dbSettings['social'] },
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
        updateSetting.mutateAsync({ key: 'social', value: settings.social, category: 'platform' }),
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

  const updateSocial = (key: keyof PlatformSettings['social'], value: string) => {
    setSettings(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));
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
                Configurează setările globale ale platformei Marketplace România
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto p-1 gap-1">
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
            <TabsTrigger value="social" className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
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
                  <Badge variant="outline" className="text-xs">Funcțional</Badge>
                </div>
                <CardDescription>
                  Aceste setări controlează trimiterea reală a emailurilor și SMS-urilor.
                  Modificările se aplică imediat după salvare.
                </CardDescription>
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

                <Separator />

                {/* Coin Sound Test Section */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Sunet Monedă Vânzători</Label>
                      <Badge variant="secondary" className="text-xs">🪙 Activ</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vânzătorii aud un sunet de monedă căzând când primesc bani
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestCoinSound}
                    className="gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Testează Sunet
                  </Button>
                </div>
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

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    <CardTitle>Link-uri Social Media</CardTitle>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvează Link-urile
                  </Button>
                </div>
                <CardDescription>Apasă pe iconița platformei pentru a adăuga sau modifica link-ul. Link-urile apar în footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Social Media Icons Grid */}
                <div className="grid grid-cols-5 gap-4">
                  {/* Facebook */}
                  <SocialIconInput
                    platform="facebook"
                    icon={<Facebook className="h-6 w-6" />}
                    color="bg-[#1877F2]"
                    value={settings.social.facebook}
                    onChange={(value) => updateSocial('facebook', value)}
                    placeholder="https://facebook.com/pagina-ta"
                  />
                  
                  {/* Instagram */}
                  <SocialIconInput
                    platform="instagram"
                    icon={<Instagram className="h-6 w-6" />}
                    color="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
                    value={settings.social.instagram}
                    onChange={(value) => updateSocial('instagram', value)}
                    placeholder="https://instagram.com/contul-tau"
                  />
                  
                  {/* TikTok */}
                  <SocialIconInput
                    platform="tiktok"
                    icon={
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    }
                    color="bg-black"
                    value={settings.social.tiktok}
                    onChange={(value) => updateSocial('tiktok', value)}
                    placeholder="https://tiktok.com/@contul-tau"
                  />
                  
                  {/* Twitter/X */}
                  <SocialIconInput
                    platform="twitter"
                    icon={<Twitter className="h-6 w-6" />}
                    color="bg-black"
                    value={settings.social.twitter}
                    onChange={(value) => updateSocial('twitter', value)}
                    placeholder="https://twitter.com/contul-tau"
                  />
                  
                  {/* YouTube */}
                  <SocialIconInput
                    platform="youtube"
                    icon={<Youtube className="h-6 w-6" />}
                    color="bg-[#FF0000]"
                    value={settings.social.youtube}
                    onChange={(value) => updateSocial('youtube', value)}
                    placeholder="https://youtube.com/@canalul-tau"
                  />
                </div>

                <div className="pt-4 p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Sfat:</strong> Apasă pe orice iconiță pentru a introduce link-ul. Iconițele cu ✓ verde au link configurat. Lasă câmpul gol pentru a ascunde iconița din footer.
                  </p>
                </div>

                {/* Preview Section */}
                <div className="pt-4">
                  <Label className="text-sm font-medium mb-3 block">Previzualizare Footer</Label>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    {settings.social.facebook && (
                      <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity">
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {settings.social.instagram && (
                      <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-80 transition-opacity">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {settings.social.tiktok && (
                      <a href={settings.social.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black text-white hover:opacity-80 transition-opacity">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {settings.social.twitter && (
                      <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black text-white hover:opacity-80 transition-opacity">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {settings.social.youtube && (
                      <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#FF0000] text-white hover:opacity-80 transition-opacity">
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {!settings.social.facebook && !settings.social.instagram && !settings.social.tiktok && !settings.social.twitter && !settings.social.youtube && (
                      <span className="text-sm text-muted-foreground">Niciun link configurat - adaugă link-uri pentru a vedea previzualizarea</span>
                    )}
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

// Social Media Icon Input Component
interface SocialIconInputProps {
  platform: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const SocialIconInput = ({ platform, icon, color, value, onChange, placeholder }: SocialIconInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasValue = value && value.trim() !== '';
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-4 rounded-xl ${color} text-white transition-all hover:scale-105 hover:shadow-lg ${hasValue ? 'ring-2 ring-green-500 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
        title={hasValue ? `${platform}: ${value}` : `Adaugă link ${platform}`}
      >
        {icon}
        {hasValue && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-72 p-3 bg-popover border rounded-lg shadow-xl">
          <Label className="text-xs font-medium capitalize mb-1.5 block">{platform}</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 text-sm"
            autoFocus
          />
          <div className="flex justify-between mt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange('')}
              className="text-xs h-7"
            >
              Șterge
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs h-7"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlatformSettings;
