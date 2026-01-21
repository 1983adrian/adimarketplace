import { useState, useEffect } from 'react';
import { Save, Globe, Palette, Bell, Shield, Mail, Upload, Loader2 } from 'lucide-react';
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
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    logoUrl: string;
    faviconUrl: string;
  };
  localization: {
    defaultLanguage: string;
    defaultCurrency: string;
    supportedLanguages: string[];
    supportedCurrencies: string[];
  };
  notifications: {
    emailNotifications: boolean;
    orderConfirmation: boolean;
    shippingUpdates: boolean;
    promotionalEmails: boolean;
    adminAlerts: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  marketplace: {
    allowGuestCheckout: boolean;
    requireSellerVerification: boolean;
    autoApproveListings: boolean;
    maxImagesPerListing: number;
    maxListingPrice: number;
  };
}

const defaultSettings: PlatformSettings = {
  general: {
    siteName: 'CMarket',
    siteDescription: 'Your trusted online marketplace - Buy & Sell Smart',
    supportEmail: 'support@cmarket.com',
    logoUrl: '',
    faviconUrl: '',
  },
  localization: {
    defaultLanguage: 'en',
    defaultCurrency: 'GBP',
    supportedLanguages: ['en', 'ro'],
    supportedCurrencies: ['GBP', 'EUR', 'USD', 'RON'],
  },
  notifications: {
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    promotionalEmails: false,
    adminAlerts: true,
  },
  security: {
    requireEmailVerification: false,
    twoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  marketplace: {
    allowGuestCheckout: false,
    requireSellerVerification: false,
    autoApproveListings: true,
    maxImagesPerListing: 10,
    maxListingPrice: 100000,
  },
};

export default function AdminPlatformSettings() {
  const { toast } = useToast();
  const { data: dbSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database when available
  useEffect(() => {
    if (dbSettings) {
      const loadedSettings: PlatformSettings = {
        general: dbSettings['general'] || defaultSettings.general,
        localization: dbSettings['localization'] || defaultSettings.localization,
        notifications: dbSettings['notifications'] || defaultSettings.notifications,
        security: dbSettings['security'] || defaultSettings.security,
        marketplace: dbSettings['marketplace'] || defaultSettings.marketplace,
      };
      setSettings(loadedSettings);
    }
  }, [dbSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each category as a separate setting
      await Promise.all([
        updateSetting.mutateAsync({ key: 'general', value: settings.general, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'localization', value: settings.localization, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'notifications', value: settings.notifications, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'security', value: settings.security, category: 'platform' }),
        updateSetting.mutateAsync({ key: 'marketplace', value: settings.marketplace, category: 'platform' }),
      ]);
      toast({ title: 'Setări salvate', description: 'Setările platformei au fost actualizate în baza de date.' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateGeneral = (key: keyof PlatformSettings['general'], value: string) => {
    setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
  };

  const updateLocalization = (key: keyof PlatformSettings['localization'], value: any) => {
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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Se încarcă setările...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Setări Platformă</h1>
            <p className="text-muted-foreground">Configurează setările globale ale platformei (salvate în baza de date)</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvează Setările
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="localization" className="gap-2">
              <Palette className="h-4 w-4" />
              Localizare
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificări
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Securitate
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Mail className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Setări Generale</CardTitle>
                <CardDescription>Informații de bază și branding al platformei</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nume Site</Label>
                    <Input
                      value={settings.general.siteName}
                      onChange={(e) => updateGeneral('siteName', e.target.value)}
                      placeholder="AdiMarket"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Suport</Label>
                    <Input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                      placeholder="support@adimarket.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descriere Site</Label>
                  <Textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateGeneral('siteDescription', e.target.value)}
                    placeholder="Descrie marketplace-ul tău..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>URL Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.general.logoUrl}
                        onChange={(e) => updateGeneral('logoUrl', e.target.value)}
                        placeholder="https://..."
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL Favicon</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.general.faviconUrl}
                        onChange={(e) => updateGeneral('faviconUrl', e.target.value)}
                        placeholder="https://..."
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization">
            <Card>
              <CardHeader>
                <CardTitle>Setări Localizare</CardTitle>
                <CardDescription>Preferințe pentru limbă și monedă</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Limba Implicită</Label>
                    <Select
                      value={settings.localization.defaultLanguage}
                      onValueChange={(value) => updateLocalization('defaultLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ro">Română</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moneda Implicită</Label>
                    <Select
                      value={settings.localization.defaultCurrency}
                      onValueChange={(value) => updateLocalization('defaultCurrency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">Liră Sterlină (£)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dolar American ($)</SelectItem>
                        <SelectItem value="RON">Leu Românesc (RON)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Setări Notificări</CardTitle>
                <CardDescription>Configurează preferințele de email și alerte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificări Email</Label>
                      <p className="text-sm text-muted-foreground">Activează toate notificările prin email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmări Comenzi</Label>
                      <p className="text-sm text-muted-foreground">Trimite email de confirmare pentru comenzi noi</p>
                    </div>
                    <Switch
                      checked={settings.notifications.orderConfirmation}
                      onCheckedChange={(checked) => updateNotifications('orderConfirmation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Actualizări Livrare</Label>
                      <p className="text-sm text-muted-foreground">Notifică utilizatorii despre schimbările de status livrare</p>
                    </div>
                    <Switch
                      checked={settings.notifications.shippingUpdates}
                      onCheckedChange={(checked) => updateNotifications('shippingUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Emailuri Promoționale</Label>
                      <p className="text-sm text-muted-foreground">Trimite conținut de marketing și promoții</p>
                    </div>
                    <Switch
                      checked={settings.notifications.promotionalEmails}
                      onCheckedChange={(checked) => updateNotifications('promotionalEmails', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alerte Admin</Label>
                      <p className="text-sm text-muted-foreground">Primește alerte pentru evenimente importante ale platformei</p>
                    </div>
                    <Switch
                      checked={settings.notifications.adminAlerts}
                      onCheckedChange={(checked) => updateNotifications('adminAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Setări Securitate</CardTitle>
                <CardDescription>Configurare autentificare și securitate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verificare Email Obligatorie</Label>
                      <p className="text-sm text-muted-foreground">Utilizatorii trebuie să verifice emailul înainte de a accesa funcționalitățile</p>
                    </div>
                    <Switch
                      checked={settings.security.requireEmailVerification}
                      onCheckedChange={(checked) => updateSecurity('requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autentificare în Doi Pași</Label>
                      <p className="text-sm text-muted-foreground">Activează 2FA pentru securitate sporită</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSecurity('twoFactorAuth', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Timeout Sesiune (minute)</Label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                        min={5}
                        max={1440}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Încercări Maxime Autentificare</Label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSecurity('maxLoginAttempts', parseInt(e.target.value))}
                        min={3}
                        max={10}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Setări Marketplace</CardTitle>
                <CardDescription>Configurează comportamentul și regulile marketplace-ului</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permite Checkout Oaspeți</Label>
                      <p className="text-sm text-muted-foreground">Permite achiziții fără crearea unui cont</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.allowGuestCheckout}
                      onCheckedChange={(checked) => updateMarketplace('allowGuestCheckout', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verificare Vânzători Obligatorie</Label>
                      <p className="text-sm text-muted-foreground">Vânzătorii trebuie verificați înainte de a lista produse</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.requireSellerVerification}
                      onCheckedChange={(checked) => updateMarketplace('requireSellerVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aprobare Automată Listări</Label>
                      <p className="text-sm text-muted-foreground">Aprobă automat listările noi fără revizuire manuală</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.autoApproveListings}
                      onCheckedChange={(checked) => updateMarketplace('autoApproveListings', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Imagini Maxime per Listare</Label>
                      <Input
                        type="number"
                        value={settings.marketplace.maxImagesPerListing}
                        onChange={(e) => updateMarketplace('maxImagesPerListing', parseInt(e.target.value))}
                        min={1}
                        max={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preț Maxim Listare (£)</Label>
                      <Input
                        type="number"
                        value={settings.marketplace.maxListingPrice}
                        onChange={(e) => updateMarketplace('maxListingPrice', parseInt(e.target.value))}
                        min={100}
                        max={10000000}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}