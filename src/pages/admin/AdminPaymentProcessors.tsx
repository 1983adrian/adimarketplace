import { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Shield,
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
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  merchant_id: string | null;
  environment: string;
  webhook_url: string | null;
}

export default function AdminPaymentProcessors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Partial<ProcessorSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch MangoPay settings only
  const { data: mangopay, isLoading } = useQuery({
    queryKey: ['mangopay-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_processor_settings')
        .select('*')
        .eq('processor_name', 'mangopay')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ProcessorSettings | null;
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

  const updateProcessor = useMutation({
    mutationFn: async (settings: Partial<ProcessorSettings> & { id: string }) => {
      const { id, ...updateData } = settings;
      const { error } = await supabase
        .from('payment_processor_settings')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mangopay-settings'] });
      toast({ title: 'Setări salvate', description: 'Configurația MangoPay a fost actualizată.' });
      setEditedSettings({});
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = async () => {
    if (!mangopay?.id || Object.keys(editedSettings).length === 0) return;
    await updateProcessor.mutateAsync({ id: mangopay.id, ...editedSettings });
  };

  const updateField = (field: keyof ProcessorSettings, value: any) => {
    setEditedSettings(prev => ({ ...prev, [field]: value }));
  };

  const getValue = (field: keyof ProcessorSettings) => {
    return editedSettings[field] ?? mangopay?.[field];
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" />
              Procesator de Plăți
            </h1>
            <p className="text-muted-foreground">Configurează MangoPay pentru procesarea plăților</p>
          </div>
        </div>

        {/* Alert - MangoPay Only */}
        <Alert className="border-green-500/50 bg-green-500/5">
          <Wallet className="h-4 w-4 text-green-600" />
          <AlertTitle>Exclusiv MangoPay</AlertTitle>
          <AlertDescription>
            Platforma folosește exclusiv MangoPay pentru procesarea plăților. 
            MangoPay oferă verificare automată KYC a vânzătorilor, wallet-uri electronice și transfer direct către conturile bancare (IBAN) sau carduri (UK Sort Code + Account Number).
          </AlertDescription>
        </Alert>

        {/* Commission Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Comisioane Platformă
            </CardTitle>
            <CardDescription>Comisioanele sunt aplicate automat la fiecare tranzacție</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Comision Vânzător</p>
                <p className="text-2xl font-bold text-green-600">{sellerCommission?.amount || 10}%</p>
                <p className="text-xs text-muted-foreground mt-1">Reținut din fiecare vânzare</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">Taxă Cumpărător</p>
                <p className="text-2xl font-bold text-blue-600">£{buyerFee?.amount?.toFixed(2) || '2.00'}</p>
                <p className="text-xs text-muted-foreground mt-1">Adăugată la comandă</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-muted-foreground">Abonament Vânzător</p>
                <p className="text-2xl font-bold text-purple-600">£1.00/lună</p>
                <p className="text-xs text-muted-foreground mt-1">După 3 luni gratuite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MangoPay Settings */}
        <Card className={`border-2 ${getValue('is_active') ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-muted'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${getValue('is_active') ? 'bg-green-500/20' : 'bg-muted'}`}>
                  {getValue('is_active') ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">MangoPay</h3>
                  <p className="text-muted-foreground">
                    {getValue('is_active') 
                      ? `Activ - ${getValue('environment') === 'live' ? 'Producție' : 'Sandbox'}` 
                      : 'Dezactivat'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getValue('environment') === 'live' ? 'default' : 'secondary'}>
                  {getValue('environment') === 'live' ? '🔴 LIVE' : '🟡 SANDBOX'}
                </Badge>
                <Switch
                  checked={getValue('is_active') as boolean || false}
                  onCheckedChange={(checked) => updateField('is_active', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Chei API MangoPay
            </CardTitle>
            <CardDescription>
              Configurează cheile API pentru MangoPay. Obține-le din dashboard-ul MangoPay.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mediu</Label>
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

              <div className="space-y-2">
                <Label>Client ID (Merchant ID)</Label>
                <Input
                  value={(getValue('merchant_id') as string) || ''}
                  onChange={(e) => updateField('merchant_id', e.target.value)}
                  placeholder="MangoPay Client ID"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={(getValue('api_key_encrypted') as string) || ''}
                    onChange={(e) => updateField('api_key_encrypted', e.target.value)}
                    placeholder="Introdu API Key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Secret (Passphrase)</Label>
                <div className="relative">
                  <Input
                    type={showApiSecret ? 'text' : 'password'}
                    value={(getValue('api_secret_encrypted') as string) || ''}
                    onChange={(e) => updateField('api_secret_encrypted', e.target.value)}
                    placeholder="Introdu API Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                  >
                    {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                value={(getValue('webhook_url') as string) || ''}
                onChange={(e) => updateField('webhook_url', e.target.value)}
                placeholder="https://your-project.supabase.co/functions/v1/mangopay-webhook"
              />
              <p className="text-xs text-muted-foreground">
                URL-ul unde MangoPay va trimite notificări despre plăți. Configurează-l în dashboard-ul MangoPay.
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={Object.keys(editedSettings).length === 0 || updateProcessor.isPending}
              className="w-full gap-2"
            >
              {updateProcessor.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvează Setările MangoPay
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Despre MangoPay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>MangoPay</strong> este specializat în marketplace-uri și platforme P2P.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Soluție nativă pentru marketplace-uri</li>
                <li>Wallet-uri electronice pentru utilizatori</li>
                <li>KYC și AML integrate</li>
                <li>Escrow (fonduri în custodie) inclus</li>
                <li>Suport pentru IBAN (UE) și Sort Code + Account Number (UK)</li>
                <li>Conformitate PSD2 și SCA</li>
              </ul>
              <a href="https://www.mangopay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Accesează MangoPay Dashboard →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}