import { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Wallet,
  Key,
  Eye,
  EyeOff,
  Save,
  Globe,
  Percent,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  
  const [showPaypalKey, setShowPaypalKey] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [paypalEdited, setPaypalEdited] = useState<Partial<ProcessorSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch PayPal settings
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

  // Fetch platform fees
  const { data: fees } = useQuery({
    queryKey: ['platform-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  const savePaypal = useMutation({
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
      toast({ title: '✅ Setări PayPal salvate', description: 'Configurația PayPal a fost actualizată cu succes.' });
      setPaypalEdited({});
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSavePaypal = () => {
    if (Object.keys(paypalEdited).length === 0) return;
    savePaypal.mutate(paypalEdited);
  };

  const getPaypalValue = (field: keyof ProcessorSettings) => {
    return paypalEdited[field] ?? paypal?.[field];
  };

  const updatePaypalField = (field: keyof ProcessorSettings, value: any) => {
    setPaypalEdited(prev => ({ ...prev, [field]: value }));
  };

  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Procesator de Plăți — PayPal
          </h1>
          <p className="text-muted-foreground">Configurează PayPal pentru procesarea plăților pe platformă</p>
        </div>

        {/* Alert */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Wallet className="h-4 w-4 text-blue-600" />
          <AlertTitle>PayPal Developer (Standard)</AlertTitle>
          <AlertDescription>
            Folosește un cont PayPal Developer standard pentru a primi plăți. 
            Obține Client ID și Secret Key din <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">PayPal Developer Dashboard</a> → My Apps & Credentials.
          </AlertDescription>
        </Alert>

        {/* Commission Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Comisioane Platformă
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Comision Vânzător</p>
                <p className="text-2xl font-bold text-green-600">0%</p>
                <p className="text-xs text-muted-foreground mt-1">Fără comision la vânzare</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">Taxă Cumpărător</p>
                <p className="text-2xl font-bold text-blue-600">0 RON</p>
                <p className="text-xs text-muted-foreground mt-1">Fără taxe suplimentare</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-muted-foreground">Venituri</p>
                <p className="text-2xl font-bold text-purple-600">Abonamente</p>
                <p className="text-xs text-muted-foreground mt-1">START / SILVER / GOLD / etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayPal Status */}
        <Card className={`border-2 ${getPaypalValue('is_active') ? 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10' : 'border-muted'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${getPaypalValue('is_active') ? 'bg-blue-500/20' : 'bg-muted'}`}>
                  {getPaypalValue('is_active') ? (
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">PayPal</h3>
                  <p className="text-muted-foreground">
                    {getPaypalValue('is_active') 
                      ? `Activ — ${getPaypalValue('environment') === 'live' ? 'Producție (LIVE)' : 'Sandbox (TEST)'}` 
                      : 'Dezactivat — adaugă cheile pentru a activa'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getPaypalValue('environment') === 'live' ? 'default' : 'secondary'}>
                  {getPaypalValue('environment') === 'live' ? '🔴 LIVE' : '🟡 SANDBOX'}
                </Badge>
                <Switch
                  checked={getPaypalValue('is_active') as boolean || false}
                  onCheckedChange={(checked) => updatePaypalField('is_active', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayPal API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Chei API PayPal
            </CardTitle>
            <CardDescription>
              Introdu Client ID și Secret Key din contul tău PayPal Developer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mediu</Label>
                <Select
                  value={getPaypalValue('environment') as string || 'sandbox'}
                  onValueChange={(v) => updatePaypalField('environment', v)}
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

              <div className="space-y-2">
                <Label>Merchant ID (opțional)</Label>
                <Input
                  value={(getPaypalValue('merchant_id') as string) || ''}
                  onChange={(e) => updatePaypalField('merchant_id', e.target.value)}
                  placeholder="PayPal Merchant ID"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Client ID</Label>
                <div className="relative">
                  <Input
                    type={showPaypalKey ? 'text' : 'password'}
                    value={paypalEdited.api_key_encrypted ?? ''}
                    onChange={(e) => updatePaypalField('api_key_encrypted', e.target.value)}
                    placeholder={paypal?.api_key_masked === '••••••••' ? '••••••••  (configurat - introdu valoare nouă pentru a schimba)' : 'PayPal Client ID (ex: AXx...)'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPaypalKey(!showPaypalKey)}
                  >
                    {showPaypalKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="relative">
                  <Input
                    type={showPaypalSecret ? 'text' : 'password'}
                    value={paypalEdited.api_secret_encrypted ?? ''}
                    onChange={(e) => updatePaypalField('api_secret_encrypted', e.target.value)}
                    placeholder={paypal?.api_secret_masked === '••••••••' ? '••••••••  (configurat - introdu valoare nouă pentru a schimba)' : 'PayPal Secret Key (ex: ELx...)'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                  >
                    {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Webhook URL (opțional)</Label>
              <Input
                value={(getPaypalValue('webhook_url') as string) || ''}
                onChange={(e) => updatePaypalField('webhook_url', e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                URL-ul unde PayPal va trimite notificări IPN/Webhook. Se configurează automat la activare.
              </p>
            </div>

            <Button 
              onClick={handleSavePaypal} 
              disabled={Object.keys(paypalEdited).length === 0 || savePaypal.isPending}
              className="w-full gap-2"
            >
              {savePaypal.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvează Setările PayPal
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cum funcționează PayPal pe platformă
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cont Developer Standard</strong> — nu necesită cont Business</li>
                <li>Fiecare vânzător își configurează propriul email PayPal în profil</li>
                <li>AWB-urile se sincronizează automat cu PayPal pentru protecția vânzătorului</li>
                <li>Fondurile sunt eliberate după confirmarea livrării de către cumpărător</li>
                <li><strong>0% comision platformă</strong> — venituri exclusiv din abonamente</li>
                <li>Retrageri procesate manual de admin prin PayPal</li>
              </ul>
              <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Accesează PayPal Developer Dashboard →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
