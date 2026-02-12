import { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProcessorSettings {
  id: string;
  processor_name: string;
  is_active: boolean;
  api_key_masked: string | null;
  api_secret_masked: string | null;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  merchant_id: string | null;
  environment: string;
  webhook_url: string | null;
}

export default function AdminPaymentProcessors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showClientId, setShowClientId] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [edited, setEdited] = useState<Partial<ProcessorSettings>>({});

  const { data: paypal, isLoading } = useQuery({
    queryKey: ['paypal-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_processor_settings_safe' as any)
        .select('*')
        .eq('processor_name', 'paypal')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as ProcessorSettings | null;
    },
  });

  const save = useMutation({
    mutationFn: async (settings: Partial<ProcessorSettings>) => {
      if (paypal?.id) {
        const { error } = await supabase
          .from('payment_processor_settings')
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq('id', paypal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_processor_settings')
          .insert({ processor_name: 'paypal', ...settings });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-settings'] });
      toast({ title: '✅ Chei API salvate', description: 'Configurația a fost actualizată cu succes.' });
      setEdited({});
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (Object.keys(edited).length === 0) return;
    save.mutate(edited);
  };

  const getValue = (field: keyof ProcessorSettings) => {
    return edited[field] ?? paypal?.[field];
  };

  const updateField = (field: keyof ProcessorSettings, value: any) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const isConfigured = paypal?.api_key_masked === '••••••••';
  const isActive = getValue('is_active') as boolean || false;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Se încarcă...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            Chei API
          </h1>
          <p className="text-muted-foreground">Toate cheile API ale platformei într-un singur loc</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          {isConfigured && isActive ? (
            <Badge className="bg-green-500/15 text-green-700 border-green-500/30 gap-1.5 py-1 px-3 text-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              PayPal Activ
            </Badge>
          ) : isConfigured ? (
            <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              Configurat dar dezactivat
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5 py-1 px-3 text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              Neconfigurat
            </Badge>
          )}
          <Badge variant={getValue('environment') === 'live' ? 'default' : 'secondary'}>
            {getValue('environment') === 'live' ? '🔴 LIVE' : '🟡 SANDBOX'}
          </Badge>
        </div>

        {/* ===== PAYPAL KEYS - MAIN CARD ===== */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                PayPal — Client ID & Secret Key
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => updateField('is_active', checked)}
              />
            </CardTitle>
            <CardDescription>
              Obține cheile din{' '}
              <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                PayPal Developer Dashboard
              </a>{' '}
              → My Apps & Credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Environment */}
            <div className="space-y-2">
              <Label className="font-semibold">Mediu</Label>
              <Select
                value={getValue('environment') as string || 'sandbox'}
                onValueChange={(v) => updateField('environment', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">🟡 Sandbox (Test)</SelectItem>
                  <SelectItem value="live">🔴 Live (Producție)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client ID */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">Client ID</Label>
              <div className="relative">
                <Input
                  type={showClientId ? 'text' : 'password'}
                  value={edited.api_key_encrypted ?? ''}
                  onChange={(e) => updateField('api_key_encrypted', e.target.value)}
                  placeholder={isConfigured ? '••••••••  (salvat — introdu altul pentru a schimba)' : 'Lipește PayPal Client ID aici (ex: AXx...)'}
                  className="pr-10 h-12 text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowClientId(!showClientId)}
                >
                  {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">Secret Key</Label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={edited.api_secret_encrypted ?? ''}
                  onChange={(e) => updateField('api_secret_encrypted', e.target.value)}
                  placeholder={isConfigured ? '••••••••  (salvat — introdu altul pentru a schimba)' : 'Lipește PayPal Secret Key aici (ex: ELx...)'}
                  className="pr-10 h-12 text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Merchant ID (optional) */}
            <div className="space-y-2">
              <Label>Merchant ID <span className="text-muted-foreground text-xs">(opțional)</span></Label>
              <Input
                value={(getValue('merchant_id') as string) || ''}
                onChange={(e) => updateField('merchant_id', e.target.value)}
                placeholder="PayPal Merchant ID"
              />
            </div>

            {/* Webhook URL (optional) */}
            <div className="space-y-2">
              <Label>Webhook URL <span className="text-muted-foreground text-xs">(opțional)</span></Label>
              <Input
                value={(getValue('webhook_url') as string) || ''}
                onChange={(e) => updateField('webhook_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* ===== SAVE BUTTON ===== */}
            <Button 
              onClick={handleSave} 
              disabled={Object.keys(edited).length === 0 || save.isPending}
              size="lg"
              className="w-full gap-2 h-14 text-lg font-bold"
            >
              {save.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              💾 SALVEAZĂ CHEILE API
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Alert className="border-muted">
          <Globe className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            <strong>Cum funcționează:</strong> Cheile se salvează în baza de date securizată. 
            Doar Edge Functions (backend) le pot accesa pentru procesarea plăților.
            AWB-urile se sincronizează automat cu PayPal. <strong>0% comision platformă</strong> — venituri doar din abonamente.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
