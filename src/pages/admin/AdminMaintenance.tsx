import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Power, Clock, Shield, Loader2 } from 'lucide-react';
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
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';

export default function AdminMaintenance() {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("We'll be back soon!");
  const [message, setMessage] = useState('We\'re currently performing scheduled maintenance. Please check back shortly.');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.maintenance_mode === true || settings.maintenance_mode === 'true');
      if (settings.maintenance_message) setMessage(settings.maintenance_message);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'maintenance_mode', value: enabled, category: 'system' });
      await updateSetting.mutateAsync({ key: 'maintenance_message', value: message, category: 'system' });
      await updateSetting.mutateAsync({ key: 'maintenance_title', value: title, category: 'system' });
      await updateSetting.mutateAsync({ key: 'maintenance_end_time', value: estimatedEndTime, category: 'system' });
      
      toast({ 
        title: enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
        description: enabled 
          ? 'Users will see the maintenance page.' 
          : 'Site is now accessible to all users.'
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Mode</h1>
            <p className="text-muted-foreground">Temporarily disable site access for maintenance</p>
          </div>
          <Button onClick={handleSave} disabled={updateSetting.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Status Banner */}
        <Alert variant={enabled ? 'destructive' : 'default'}>
          <Power className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Maintenance Mode
            <Badge variant={enabled ? 'destructive' : 'secondary'}>
              {enabled ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {enabled 
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
                  {enabled ? 'Site is currently offline' : 'Site is online and accessible'}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="We'll be back soon!"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="We're currently performing scheduled maintenance..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Estimated End Time</Label>
                <Input
                  type="datetime-local"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Countdown Timer</Label>
                <p className="text-sm text-muted-foreground">Display time remaining until maintenance ends</p>
              </div>
              <Switch
                checked={showCountdown}
                onCheckedChange={setShowCountdown}
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
                checked={allowAdminAccess}
                onCheckedChange={setAllowAdminAccess}
              />
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
              <h2 className="text-2xl font-bold">{title || "We'll be back soon!"}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {message || 'We\'re currently performing scheduled maintenance.'}
              </p>
              {estimatedEndTime && showCountdown && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Expected back: {new Date(estimatedEndTime).toLocaleString()}
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