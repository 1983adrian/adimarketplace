import { useState, useEffect } from 'react';
import { Save, Globe, Palette, Bell, Shield, Mail, Upload } from 'lucide-react';
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
    siteName: 'Marketplace',
    siteDescription: 'Your trusted online marketplace',
    supportEmail: 'support@marketplace.com',
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
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('platform_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('platform_settings', JSON.stringify(settings));
      toast({ title: 'Settings saved', description: 'Platform settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure global platform settings</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            Save All Settings
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
              Localization
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Mail className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={settings.general.siteName}
                      onChange={(e) => updateGeneral('siteName', e.target.value)}
                      placeholder="Your Marketplace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Site Description</Label>
                  <Textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateGeneral('siteDescription', e.target.value)}
                    placeholder="Describe your marketplace..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
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
                    <Label>Favicon URL</Label>
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
                <CardTitle>Localization Settings</CardTitle>
                <CardDescription>Language and currency preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
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
                    <Label>Default Currency</Label>
                    <Select
                      value={settings.localization.defaultCurrency}
                      onValueChange={(value) => updateLocalization('defaultCurrency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="RON">Romanian Leu (RON)</SelectItem>
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
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email and alert preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Enable all email notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Order Confirmations</Label>
                      <p className="text-sm text-muted-foreground">Send confirmation emails for new orders</p>
                    </div>
                    <Switch
                      checked={settings.notifications.orderConfirmation}
                      onCheckedChange={(checked) => updateNotifications('orderConfirmation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Shipping Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify users about shipping status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.shippingUpdates}
                      onCheckedChange={(checked) => updateNotifications('shippingUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">Send marketing and promotional content</p>
                    </div>
                    <Switch
                      checked={settings.notifications.promotionalEmails}
                      onCheckedChange={(checked) => updateNotifications('promotionalEmails', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts for important platform events</p>
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
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Authentication and security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Users must verify email before accessing features</p>
                    </div>
                    <Switch
                      checked={settings.security.requireEmailVerification}
                      onCheckedChange={(checked) => updateSecurity('requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSecurity('twoFactorAuth', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                        min={5}
                        max={1440}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
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
                <CardTitle>Marketplace Settings</CardTitle>
                <CardDescription>Configure marketplace behavior and rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Guest Checkout</Label>
                      <p className="text-sm text-muted-foreground">Allow purchases without account creation</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.allowGuestCheckout}
                      onCheckedChange={(checked) => updateMarketplace('allowGuestCheckout', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Seller Verification</Label>
                      <p className="text-sm text-muted-foreground">Sellers must be verified before listing</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.requireSellerVerification}
                      onCheckedChange={(checked) => updateMarketplace('requireSellerVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Approve Listings</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve new listings</p>
                    </div>
                    <Switch
                      checked={settings.marketplace.autoApproveListings}
                      onCheckedChange={(checked) => updateMarketplace('autoApproveListings', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Max Images per Listing</Label>
                      <Input
                        type="number"
                        value={settings.marketplace.maxImagesPerListing}
                        onChange={(e) => updateMarketplace('maxImagesPerListing', parseInt(e.target.value))}
                        min={1}
                        max={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Listing Price (£)</Label>
                      <Input
                        type="number"
                        value={settings.marketplace.maxListingPrice}
                        onChange={(e) => updateMarketplace('maxListingPrice', parseInt(e.target.value))}
                        min={100}
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
