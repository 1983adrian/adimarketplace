import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Power, Clock, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MaintenanceSettings {
  enabled: boolean;
  title: string;
  message: string;
  estimatedEndTime: string;
  allowAdminAccess: boolean;
  allowedIPs: string;
  showCountdown: boolean;
  redirectUrl: string;
}

const defaultSettings: MaintenanceSettings = {
  enabled: false,
  title: 'We\'ll be back soon!',
  message: 'We\'re currently performing scheduled maintenance. Please check back shortly.',
  estimatedEndTime: '',
  allowAdminAccess: true,
  allowedIPs: '',
  showCountdown: true,
  redirectUrl: '',
};

export default function AdminMaintenance() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MaintenanceSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('maintenance_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('maintenance_settings', JSON.stringify(settings));
      toast({ 
        title: settings.enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
        description: settings.enabled 
          ? 'Users will see the maintenance page.' 
          : 'Site is now accessible to all users.'
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Mode</h1>
            <p className="text-muted-foreground">Temporarily disable site access for maintenance</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Status Banner */}
        <Alert variant={settings.enabled ? 'destructive' : 'default'}>
          <Power className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Maintenance Mode
            <Badge variant={settings.enabled ? 'destructive' : 'secondary'}>
              {settings.enabled ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {settings.enabled 
              ? 'Site is currently in maintenance mode. Only admins can access.' 
              : 'Site is accessible to all users.'}
          </AlertDescription>
        </Alert>

        {/* Main Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Enable Maintenance Mode
            </CardTitle>
            <CardDescription>
              When enabled, visitors will see a maintenance page instead of the site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? 'Site is currently offline' : 'Site is online and accessible'}
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggleMaintenance}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Page Content */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Page Content</CardTitle>
            <CardDescription>Customize the message shown to visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="We'll be back soon!"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={settings.message}
                onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value }))}
                placeholder="We're currently performing scheduled maintenance..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Estimated End Time</Label>
                <Input
                  type="datetime-local"
                  value={settings.estimatedEndTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, estimatedEndTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Redirect URL (optional)</Label>
                <Input
                  value={settings.redirectUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, redirectUrl: e.target.value }))}
                  placeholder="https://status.yoursite.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Countdown Timer</Label>
                <p className="text-sm text-muted-foreground">Display time remaining until maintenance ends</p>
              </div>
              <Switch
                checked={settings.showCountdown}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showCountdown: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Settings
            </CardTitle>
            <CardDescription>Control who can access the site during maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Admin Access</Label>
                <p className="text-sm text-muted-foreground">Admins can still access the site</p>
              </div>
              <Switch
                checked={settings.allowAdminAccess}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowAdminAccess: checked }))}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Allowed IP Addresses</Label>
              <Textarea
                value={settings.allowedIPs}
                onChange={(e) => setSettings(prev => ({ ...prev, allowedIPs: e.target.value }))}
                placeholder="192.168.1.1&#10;10.0.0.1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Enter one IP address per line. These IPs can bypass maintenance mode.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 bg-gradient-to-br from-background to-muted text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{settings.title || "We'll be back soon!"}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {settings.message || 'We\'re currently performing scheduled maintenance.'}
              </p>
              {settings.estimatedEndTime && settings.showCountdown && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Expected back: {new Date(settings.estimatedEndTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
