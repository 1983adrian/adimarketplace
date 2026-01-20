import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [showApiSecret, setShowApiSecret] = useState<Record<string, boolean>>({});
  const [editedSettings, setEditedSettings] = useState<Record<string, Partial<ProcessorSettings>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch processor settings
  const { data: processors, isLoading } = useQuery({
    queryKey: ['payment-processors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_processor_settings')
        .select('*')
        .order('processor_name');
      
      if (error) throw error;
      return data as ProcessorSettings[];
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
      queryClient.invalidateQueries({ queryKey: ['payment-processors'] });
      toast({ title: 'Setări salvate', description: 'Configurația procesorului a fost actualizată.' });
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = async (processorId: string) => {
    const settings = editedSettings[processorId];
    if (!settings) return;
    
    await updateProcessor.mutateAsync({ id: processorId, ...settings });
    setEditedSettings(prev => {
      const updated = { ...prev };
      delete updated[processorId];
      return updated;
    });
  };

  const updateField = (processorId: string, field: keyof ProcessorSettings, value: any) => {
    setEditedSettings(prev => ({
      ...prev,
      [processorId]: {
        ...prev[processorId],
        [field]: value,
      },
    }));
  };

  const getProcessorValue = (processor: ProcessorSettings, field: keyof ProcessorSettings) => {
    return editedSettings[processor.id]?.[field] ?? processor[field];
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
              Procesatori de Plăți
            </h1>
            <p className="text-muted-foreground">Configurează Adyen și Mangopay pentru procesarea plăților</p>
          </div>
        </div>

        {/* Alert - No Stripe */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle>Fără Stripe</AlertTitle>
          <AlertDescription>
            Platforma folosește exclusiv Adyen și Mangopay pentru procesarea plăților. 
            Acești procesatori oferă verificare automată KYC a vânzătorilor și transfer direct către conturile lor bancare sau carduri.
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

        <Tabs defaultValue="adyen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adyen" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Adyen
            </TabsTrigger>
            <TabsTrigger value="mangopay" className="gap-2">
              <Wallet className="h-4 w-4" />
              Mangopay
            </TabsTrigger>
          </TabsList>

          {processors?.map((processor) => (
            <TabsContent key={processor.id} value={processor.processor_name} className="space-y-6">
              {/* Status Card */}
              <Card className={`border-2 ${getProcessorValue(processor, 'is_active') ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-muted'}`}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full ${getProcessorValue(processor, 'is_active') ? 'bg-green-500/20' : 'bg-muted'}`}>
                        {getProcessorValue(processor, 'is_active') ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold capitalize">{processor.processor_name}</h3>
                        <p className="text-muted-foreground">
                          {getProcessorValue(processor, 'is_active') 
                            ? `Activ - ${getProcessorValue(processor, 'environment') === 'live' ? 'Producție' : 'Sandbox'}` 
                            : 'Dezactivat'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getProcessorValue(processor, 'environment') === 'live' ? 'default' : 'secondary'}>
                        {getProcessorValue(processor, 'environment') === 'live' ? '🔴 LIVE' : '🟡 SANDBOX'}
                      </Badge>
                      <Switch
                        checked={getProcessorValue(processor, 'is_active') as boolean}
                        onCheckedChange={(checked) => updateField(processor.id, 'is_active', checked)}
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
                    Chei API
                  </CardTitle>
                  <CardDescription>
                    Configurează cheile API pentru {processor.processor_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Mediu</Label>
                      <Select
                        value={getProcessorValue(processor, 'environment') as string}
                        onValueChange={(v) => updateField(processor.id, 'environment', v)}
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
                      <Label>Merchant ID</Label>
                      <Input
                        value={(getProcessorValue(processor, 'merchant_id') as string) || ''}
                        onChange={(e) => updateField(processor.id, 'merchant_id', e.target.value)}
                        placeholder={`${processor.processor_name} Merchant ID`}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey[processor.id] ? 'text' : 'password'}
                          value={(getProcessorValue(processor, 'api_key_encrypted') as string) || ''}
                          onChange={(e) => updateField(processor.id, 'api_key_encrypted', e.target.value)}
                          placeholder="Introdu API Key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowApiKey(prev => ({ ...prev, [processor.id]: !prev[processor.id] }))}
                        >
                          {showApiKey[processor.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>API Secret</Label>
                      <div className="relative">
                        <Input
                          type={showApiSecret[processor.id] ? 'text' : 'password'}
                          value={(getProcessorValue(processor, 'api_secret_encrypted') as string) || ''}
                          onChange={(e) => updateField(processor.id, 'api_secret_encrypted', e.target.value)}
                          placeholder="Introdu API Secret"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowApiSecret(prev => ({ ...prev, [processor.id]: !prev[processor.id] }))}
                        >
                          {showApiSecret[processor.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      value={(getProcessorValue(processor, 'webhook_url') as string) || ''}
                      onChange={(e) => updateField(processor.id, 'webhook_url', e.target.value)}
                      placeholder="https://your-domain.com/webhooks/processor"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-ul unde procesatorul va trimite notificări despre plăți
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleSave(processor.id)} 
                    disabled={!editedSettings[processor.id] || updateProcessor.isPending}
                    className="w-full gap-2"
                  >
                    {updateProcessor.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvează Setările {processor.processor_name}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Despre {processor.processor_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processor.processor_name === 'adyen' ? (
                    <div className="space-y-3 text-sm">
                      <p><strong>Adyen</strong> este un procesor global de plăți folosit de companii precum Uber, Spotify, și eBay.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Suportă plăți cu carduri, Apple Pay, Google Pay</li>
                        <li>Verificare automată KYC a vânzătorilor</li>
                        <li>Transfer direct către conturi bancare</li>
                        <li>Protecție împotriva fraudei</li>
                      </ul>
                      <a href="https://www.adyen.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Accesează Adyen Dashboard →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <p><strong>Mangopay</strong> este specializat în marketplace-uri și platforme P2P.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Soluție nativă pentru marketplace-uri</li>
                        <li>Wallet-uri electronice pentru utilizatori</li>
                        <li>KYC și AML integrate</li>
                        <li>Escrow (fonduri în custodie) inclus</li>
                      </ul>
                      <a href="https://www.mangopay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Accesează Mangopay Dashboard →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
