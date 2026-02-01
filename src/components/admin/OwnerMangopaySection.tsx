import { useState } from 'react';
import { 
  Wallet, CheckCircle, AlertTriangle, Shield, Key, ExternalLink, 
  FileCheck, Building2, CreditCard, User, Save, Eye, EyeOff, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface OwnerVerification {
  identityVerified: boolean;
  bankVerified: boolean;
  businessVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_started';
}

export function OwnerMangopaySection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    apiKey: '',
    environment: 'sandbox',
    webhookUrl: '',
  });

  // Fetch MangoPay settings
  const { data: mangopaySettings, isLoading } = useQuery({
    queryKey: ['mangopay-owner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_processor_settings')
        .select('*')
        .eq('processor_name', 'mangopay')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch platform fees for commission info
  const { data: fees } = useQuery({
    queryKey: ['platform-fees-owner'],
    queryFn: async () => {
      const { data } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true);
      return data || [];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData = {
        processor_name: 'mangopay',
        merchant_id: formData.clientId || mangopaySettings?.merchant_id,
        api_key_encrypted: formData.apiKey || mangopaySettings?.api_key_encrypted,
        environment: formData.environment || mangopaySettings?.environment || 'sandbox',
        webhook_url: formData.webhookUrl || mangopaySettings?.webhook_url,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (mangopaySettings?.id) {
        const { error } = await supabase
          .from('payment_processor_settings')
          .update(updateData)
          .eq('id', mangopaySettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_processor_settings')
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mangopay-owner-settings'] });
      toast({ title: '✓ Setări MangoPay salvate', description: 'Configurația a fost actualizată cu succes.' });
      setEditMode(false);
      setFormData({ clientId: '', apiKey: '', environment: 'sandbox', webhookUrl: '' });
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const isConfigured = mangopaySettings?.merchant_id && mangopaySettings?.api_key_encrypted;
  const isLive = mangopaySettings?.environment === 'live';
  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission')?.amount || 8;
  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee')?.amount || 2;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={isConfigured ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10' : 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10'}>
        {isConfigured ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        )}
        <AlertTitle className="text-lg">
          {isConfigured ? 'MangoPay Conectat' : 'MangoPay Neconfigurat'}
        </AlertTitle>
        <AlertDescription>
          {isConfigured 
            ? `Platforma este conectată la MangoPay în modul ${isLive ? 'LIVE (Producție)' : 'SANDBOX (Test)'}.`
            : 'Configurează MangoPay pentru a primi plăți și a procesa comisioanele platformei.'
          }
        </AlertDescription>
      </Alert>

      {/* MangoPay Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status Configurare MangoPay
          </CardTitle>
          <CardDescription>
            Configurația MangoPay pentru procesarea plăților platformei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className={`p-2 rounded-full ${isConfigured ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">API MangoPay</p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured ? 'Configurat' : 'Neconfigurat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className={`p-2 rounded-full ${mangopaySettings?.webhook_url ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Webhook</p>
                <p className="text-sm text-muted-foreground">
                  {mangopaySettings?.webhook_url ? 'Activ' : 'Neconfigurat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className={`p-2 rounded-full ${isLive ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Mediu</p>
                <p className="text-sm text-muted-foreground">
                  {isLive ? 'Producție (Live)' : 'Sandbox (Test)'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ℹ️ Configurează cheile API MangoPay în tab-ul de mai jos pentru a activa plățile reale.
          </p>
        </CardContent>
      </Card>

      {/* Commission Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Comisioane Platformă
          </CardTitle>
          <CardDescription>
            Comisioanele configurate care vor fi încasate de platformă
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Comision Vânzător</p>
              <p className="text-3xl font-bold text-green-600">{sellerCommission}%</p>
              <p className="text-xs text-muted-foreground">Din fiecare vânzare</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-muted-foreground">Taxă Cumpărător</p>
              <p className="text-3xl font-bold text-blue-600">£{buyerFee}</p>
              <p className="text-xs text-muted-foreground">Per comandă</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            ℹ️ Modifică comisioanele din <a href="/admin/fees" className="text-primary hover:underline">Setări Comisioane</a>
          </p>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Configurare MangoPay API</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? 'default' : 'secondary'}>
                {isLive ? '🔴 LIVE' : '🟡 SANDBOX'}
              </Badge>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Modifică
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Introdu cheile API din dashboard-ul MangoPay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {editMode ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mediu</Label>
                  <Select
                    value={formData.environment || mangopaySettings?.environment || 'sandbox'}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v }))}
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
                  <Label>Client ID</Label>
                  <Input
                    value={formData.clientId || mangopaySettings?.merchant_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="MangoPay Client ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={mangopaySettings?.api_key_encrypted ? '••••••••••••' : 'Introdu API Key'}
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
                <Label>Webhook URL</Label>
                <Input
                  value={formData.webhookUrl || mangopaySettings?.webhook_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-domain.supabase.co/functions/v1/mangopay-webhook"
                />
                <p className="text-xs text-muted-foreground">
                  Configurează acest URL în dashboard-ul MangoPay pentru a primi notificări
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => saveMutation.mutate()} 
                  disabled={saveMutation.isPending}
                  className="gap-2"
                >
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvează
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ clientId: '', apiKey: '', environment: 'sandbox', webhookUrl: '' });
                  }}
                >
                  Anulează
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Client ID</p>
                  <p className="font-mono text-sm">{mangopaySettings?.merchant_id || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">API Key</p>
                  <p className="font-mono text-sm">{mangopaySettings?.api_key_encrypted ? '••••••••••••' : '—'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Webhook URL</p>
                <p className="font-mono text-sm break-all">{mangopaySettings?.webhook_url || '—'}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Documentație MangoPay</span>
            <a 
              href="https://docs.mangopay.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Accesează Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
