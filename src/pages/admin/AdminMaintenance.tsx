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
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';

export default function AdminMaintenance() {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("Revenim în curând!");
  const [message, setMessage] = useState('Platforma este în mentenanță programată. Vă rugăm reveniți în curând.');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.maintenance_mode === true || settings.maintenance_mode === 'true');
      if (settings.maintenance_message) setMessage(settings.maintenance_message as string);
      if (settings.maintenance_title) setTitle(settings.maintenance_title as string);
      if (settings.maintenance_end_time) setEstimatedEndTime(settings.maintenance_end_time as string);
      if (typeof settings.maintenance_allow_admin === 'boolean') setAllowAdminAccess(settings.maintenance_allow_admin as boolean);
      if (typeof settings.maintenance_show_countdown === 'boolean') setShowCountdown(settings.maintenance_show_countdown as boolean);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'maintenance_mode', value: enabled, category: 'system' }),
        updateSetting.mutateAsync({ key: 'maintenance_message', value: message, category: 'system' }),
        updateSetting.mutateAsync({ key: 'maintenance_title', value: title, category: 'system' }),
        updateSetting.mutateAsync({ key: 'maintenance_end_time', value: estimatedEndTime, category: 'system' }),
        updateSetting.mutateAsync({ key: 'maintenance_allow_admin', value: allowAdminAccess, category: 'system' }),
        updateSetting.mutateAsync({ key: 'maintenance_show_countdown', value: showCountdown, category: 'system' }),
      ]);
      
      toast({ 
        title: enabled ? '🔧 Mod mentenanță activat' : '✅ Mod mentenanță dezactivat',
        description: enabled 
          ? 'Utilizatorii vor vedea pagina de mentenanță.' 
          : 'Site-ul este accesibil tuturor.'
      });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
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
            <h1 className="text-2xl font-bold">Mod Mentenanță</h1>
            <p className="text-muted-foreground text-sm">Dezactivează temporar accesul la site</p>
          </div>
          <Button onClick={handleSave} disabled={updateSetting.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            Salvează
          </Button>
        </div>

        {/* Status Banner */}
        <Alert variant={enabled ? 'destructive' : 'default'}>
          <Power className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Mod Mentenanță
            <Badge variant={enabled ? 'destructive' : 'secondary'}>
              {enabled ? 'ACTIV' : 'INACTIV'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {enabled 
              ? 'Site-ul este în mentenanță. Doar adminii pot accesa.' 
              : 'Site-ul este accesibil tuturor utilizatorilor.'}
          </AlertDescription>
        </Alert>

        {/* Main Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Activare Mod Mentenanță
            </CardTitle>
            <CardDescription>
              Vizitatorii vor vedea pagina de mentenanță în loc de site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-base">Mod Mentenanță</Label>
                <p className="text-sm text-muted-foreground">
                  {enabled ? 'Site-ul este offline' : 'Site-ul este online'}
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Conținut Pagină Mentenanță</CardTitle>
            <CardDescription>Personalizează mesajul afișat vizitatorilor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titlu</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Revenim în curând!" />
            </div>
            <div className="space-y-2">
              <Label>Mesaj</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Timp Estimat Sfârșit</Label>
                <Input type="datetime-local" value={estimatedEndTime} onChange={(e) => setEstimatedEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Afișează Cronometru</Label>
                <p className="text-sm text-muted-foreground">Arată timpul rămas până la finalizare</p>
              </div>
              <Switch checked={showCountdown} onCheckedChange={setShowCountdown} />
            </div>
          </CardContent>
        </Card>

        {/* Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setări Acces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permite Acces Admin</Label>
                <p className="text-sm text-muted-foreground">Adminii pot accesa site-ul în continuare</p>
              </div>
              <Switch checked={allowAdminAccess} onCheckedChange={setAllowAdminAccess} />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Previzualizare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 bg-gradient-to-br from-background to-muted text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{title || "Revenim în curând!"}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
              {estimatedEndTime && showCountdown && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Revenim la: {new Date(estimatedEndTime).toLocaleString('ro-RO')}
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