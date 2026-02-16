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
  Shield,
  Info
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
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  merchant_id: string | null;
  partner_id: string | null;
  bn_code: string | null;
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
        .from('payment_processor_settings')
        .select('id, processor_name, is_active, environment, merchant_id, webhook_url, api_key_encrypted, api_secret_encrypted, partner_id, bn_code')
        .eq('processor_name', 'paypal')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          ...data,
          hasClientId: !!data.api_key_encrypted,
          hasSecret: !!data.api_secret_encrypted,
          hasPartnerId: !!data.partner_id,
          api_key_encrypted: undefined,
          api_secret_encrypted: undefined,
        } as unknown as ProcessorSettings & { hasClientId: boolean; hasSecret: boolean; hasPartnerId: boolean };
      }
      return null;
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
      toast({ title: '✅ Configurație PayPal salvată', description: 'Toate cheile au fost actualizate cu succes.' });
      setEdited({});
    },
    onError: (error: any) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => {
    const clientId = (edited.api_key_encrypted ?? '').trim();
    const secret = (edited.api_secret_encrypted ?? '').trim();
    const partnerId = (edited.partner_id ?? (paypal as any)?.partner_id ?? '').trim();
    
    if (!clientId && !(paypal as any)?.hasClientId) {
      toast({ title: '❌ Client ID lipsă', description: 'Introdu PayPal Client ID.', variant: 'destructive' });
      return;
    }
    if (!secret && !(paypal as any)?.hasSecret) {
      toast({ title: '❌ Secret Key lipsă', description: 'Introdu PayPal Secret Key.', variant: 'destructive' });
      return;
    }
    if (!partnerId) {
      toast({ title: '❌ Partner ID lipsă', description: 'Partner ID (Merchant ID platforma) este obligatoriu pentru marketplace.', variant: 'destructive' });
      return;
    }
    
    const dataToSave: any = {
      ...edited,
      is_active: true,
      environment: edited.environment ?? paypal?.environment ?? 'sandbox',
    };
    
    if (clientId) dataToSave.api_key_encrypted = clientId;
    if (secret) dataToSave.api_secret_encrypted = secret;
    
    save.mutate(dataToSave);
  };

  const getValue = (field: keyof ProcessorSettings) => {
    return edited[field] ?? paypal?.[field];
  };

  const updateField = (field: keyof ProcessorSettings, value: any) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const isConfigured = !!paypal?.id;
  const isActive = getValue('is_active') as boolean || false;
  const hasKeys = (paypal as any)?.hasClientId && (paypal as any)?.hasSecret;
  const hasPartnerId = !!(paypal as any)?.hasPartnerId || !!edited.partner_id;

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
            Chei API — PayPal Commerce Platform
          </h1>
          <p className="text-muted-foreground">
            Configurația completă PayPal pentru marketplace cu mai mulți vânzători (Partner Referrals API v2)
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {isConfigured && isActive && hasKeys && hasPartnerId ? (
            <Badge className="bg-green-500/15 text-green-700 border-green-500/30 gap-1.5 py-1 px-3 text-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              PayPal Marketplace Activ ✅
            </Badge>
          ) : isConfigured && hasKeys ? (
            <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              {!hasPartnerId ? 'Partner ID lipsă!' : 'Activează switch-ul!'}
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

        {/* PayPal Commerce Platform Info */}
        <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            <strong>PayPal Commerce Platform (Marketplace):</strong> Această integrare folosește 
            <strong> Partner Referrals API v2</strong> conform cerințelor PayPal pentru marketplace-uri cu mai mulți vânzători. 
            Vânzătorii sunt onboardați ca sub-comercianți verificați de PayPal (KYC, documente, conformitate).
            <br /><br />
            <strong>Cerințe obligatorii:</strong>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              <li>Cont PayPal Business aprobat ca <strong>Partner/Platform</strong></li>
              <li><strong>Partner ID</strong> = Merchant ID-ul contului tău de platformă</li>
              <li><strong>BN Code</strong> = Attribution ID primit de la PayPal la aprobare</li>
              <li>Cheile API (Client ID + Secret) din aplicația REST API</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* ===== PAYPAL KEYS - MAIN CARD ===== */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                PayPal — Configurare Completă Marketplace
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

            {/* Partner ID — REQUIRED for marketplace */}
            <div className="space-y-2 p-4 rounded-lg border-2 border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
              <Label className="font-bold text-base flex items-center gap-2">
                🏪 Partner ID (Merchant ID Platformă) 
                <Badge variant="destructive" className="text-xs">OBLIGATORIU</Badge>
              </Label>
              <p className="text-xs text-muted-foreground">
                Merchant ID-ul contului PayPal Business al platformei. Îl găsești în PayPal → 
                <a href="https://www.paypal.com/businessmanage/account/aboutBusiness" target="_blank" rel="noopener noreferrer" className="underline text-primary font-medium ml-1">
                  Account Settings → Business Information → PayPal Merchant ID
                </a>
              </p>
              <Input
                value={(edited.partner_id ?? (paypal as any)?.partner_id) || ''}
                onChange={(e) => updateField('partner_id', e.target.value)}
                placeholder="Ex: ABCDEF123456789"
                className="h-12 text-base font-mono"
              />
            </div>

            {/* BN Code */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">
                BN Code (Attribution ID)
                <span className="text-xs text-muted-foreground font-normal ml-2">Opțional — primit la aprobarea ca Partner</span>
              </Label>
              <Input
                value={(edited.bn_code ?? (paypal as any)?.bn_code) || ''}
                onChange={(e) => updateField('bn_code', e.target.value)}
                placeholder="Ex: MarketplaceRomania_SP_PPCP"
                className="h-12"
              />
            </div>

            {/* Client ID */}
            <div className="space-y-2">
              <Label className="font-semibold text-base">Client ID</Label>
              <div className="relative">
                <Input
                  type={showClientId ? 'text' : 'password'}
                  value={edited.api_key_encrypted ?? ''}
                  onChange={(e) => updateField('api_key_encrypted', e.target.value)}
                  placeholder={isConfigured && hasKeys ? '••••••••  (salvat — introdu altul pentru a schimba)' : 'Lipește PayPal Client ID aici (ex: AXx...)'}
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
                  placeholder={isConfigured && hasKeys ? '••••••••  (salvat — introdu altul pentru a schimba)' : 'Lipește PayPal Secret Key aici (ex: ELx...)'}
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

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label>
                Webhook URL 
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  Configurează în PayPal Developer → Webhooks
                </span>
              </Label>
              <Input
                value={(getValue('webhook_url') as string) || ''}
                onChange={(e) => updateField('webhook_url', e.target.value)}
                placeholder={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-webhook`}
                className="h-10 text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">
                <strong>Evenimente necesare:</strong> MERCHANT.ONBOARDING.COMPLETED, MERCHANT.PARTNER-CONSENT.REVOKED, 
                PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.APPROVED
              </p>
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
              💾 SALVEAZĂ CONFIGURAȚIA PAYPAL
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Alert className="border-muted">
          <Globe className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            <strong>Cum funcționează marketplace-ul:</strong> Cheile se salvează securizat în baza de date. 
            Edge Functions folosesc <strong>Partner Referrals API v2</strong> pentru onboarding vânzători. 
            PayPal verifică automat identitatea vânzătorilor (KYC) și trimite notificări când sunt necesare documente suplimentare.
            <strong> 0% comision platformă</strong> — venituri doar din abonamente.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
