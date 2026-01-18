import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Shield,
  Wallet,
  ArrowRightLeft,
  Receipt,
  Settings,
  Ban,
  Zap,
  Globe,
  Clock,
  FileText
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
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';
import { usePlatformFees, useUpdatePlatformFee } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface StripeSettings {
  mode: 'live' | 'test';
  currency: string;
  autoPayouts: boolean;
  payoutDelay: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  minimumPayout: number;
  requireSellerVerification: boolean;
  enableConnectExpress: boolean;
  webhooksEnabled: boolean;
  captureMethod: 'automatic' | 'manual';
  statementDescriptor: string;
  allowRefunds: boolean;
  refundWindow: number;
  fraud3DSecure: boolean;
  radarEnabled: boolean;
}

const defaultStripeSettings: StripeSettings = {
  mode: 'live',
  currency: 'GBP',
  autoPayouts: true,
  payoutDelay: 7,
  payoutSchedule: 'daily',
  minimumPayout: 10,
  requireSellerVerification: true,
  enableConnectExpress: true,
  webhooksEnabled: true,
  captureMethod: 'automatic',
  statementDescriptor: 'ADIMARKET',
  allowRefunds: true,
  refundWindow: 30,
  fraud3DSecure: true,
  radarEnabled: true,
};

export default function AdminStripeSettings() {
  const { toast } = useToast();
  const { data: platformSettings, isLoading: settingsLoading } = usePlatformSettings();
  const { data: fees, isLoading: feesLoading } = usePlatformFees();
  const updateSetting = useUpdatePlatformSetting();
  const updateFee = useUpdatePlatformFee();
  
  const [settings, setSettings] = useState<StripeSettings>(defaultStripeSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Stripe status
  const { data: stripeStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: async () => {
      // Check if STRIPE_SECRET_KEY is configured (can't check actual value)
      // We'll check if we can make a basic call
      try {
        const { data, error } = await supabase.functions.invoke('check-seller-subscription', {
          body: { test: true }
        });
        return { 
          configured: true, 
          mode: 'live',
          connected: !error 
        };
      } catch {
        return { configured: false, mode: 'test', connected: false };
      }
    },
    retry: false
  });

  // Load settings from database
  useEffect(() => {
    if (platformSettings?.stripe_settings) {
      setSettings(platformSettings.stripe_settings as unknown as StripeSettings);
    }
  }, [platformSettings]);

  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');
  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const sellerSubscription = fees?.find(f => f.fee_type === 'seller_subscription');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({
        key: 'stripe_settings',
        value: settings as unknown as Record<string, unknown>,
        category: 'payments'
      });
      toast({ 
        title: 'Setări Stripe salvate', 
        description: 'Configurația Stripe a fost actualizată cu succes.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Eroare', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFee = async (feeId: string, amount: number) => {
    try {
      await updateFee.mutateAsync({ id: feeId, amount });
      toast({ title: 'Taxă actualizată', description: 'Comisionul a fost salvat.' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const isLoading = settingsLoading || feesLoading || statusLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Se încarcă setările Stripe...</span>
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
              Stripe - Plăți Reale
            </h1>
            <p className="text-muted-foreground">Configurează sistemul de plăți pentru bani reali</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchStatus()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Verifică Status
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-primary to-primary/80">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Salvează Setările
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${stripeStatus?.configured ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${stripeStatus?.configured ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {stripeStatus?.configured ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {stripeStatus?.configured ? 'Stripe LIVE - Bani Reali' : 'Stripe Neconfigurat'}
                  </h3>
                  <p className="text-muted-foreground">
                    {stripeStatus?.configured 
                      ? 'Platforma acceptă plăți reale prin Stripe' 
                      : 'Configurează STRIPE_SECRET_KEY pentru a activa plățile'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={settings.mode === 'live' ? 'default' : 'secondary'}
                  className={settings.mode === 'live' ? 'bg-green-500' : ''}
                >
                  {settings.mode === 'live' ? '🔴 LIVE MODE' : '🟡 TEST MODE'}
                </Badge>
                <a 
                  href="https://dashboard.stripe.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Stripe Dashboard
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Comisioane
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Securitate
            </TabsTrigger>
            <TabsTrigger value="connect" className="gap-2">
              <Users className="h-4 w-4" />
              Connect
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Setări Generale Plăți
                </CardTitle>
                <CardDescription>Configurația principală pentru procesarea plăților</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mod Operare</Label>
                    <Select 
                      value={settings.mode} 
                      onValueChange={(v: 'live' | 'test') => setSettings({...settings, mode: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">🔴 LIVE - Bani Reali</SelectItem>
                        <SelectItem value="test">🟡 TEST - Mod Testare</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      În mod LIVE, toate tranzacțiile sunt cu bani reali!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Monedă Principală</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(v) => setSettings({...settings, currency: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">🇬🇧 GBP - Liră Sterlină</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                        <SelectItem value="USD">🇺🇸 USD - Dolar American</SelectItem>
                        <SelectItem value="RON">🇷🇴 RON - Leu Românesc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Descriptor Extras Bancar</Label>
                    <Input
                      value={settings.statementDescriptor}
                      onChange={(e) => setSettings({...settings, statementDescriptor: e.target.value.toUpperCase().slice(0, 22)})}
                      placeholder="ADIMARKET"
                      maxLength={22}
                    />
                    <p className="text-xs text-muted-foreground">
                      Apare pe extrasul bancar al clientului (max 22 caractere)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Metoda de Captare</Label>
                    <Select 
                      value={settings.captureMethod} 
                      onValueChange={(v: 'automatic' | 'manual') => setSettings({...settings, captureMethod: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automată - Încasare imediată</SelectItem>
                        <SelectItem value="manual">Manuală - Autorizare + Captare separată</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Webhooks Stripe</Label>
                    <p className="text-sm text-muted-foreground">
                      Primește notificări automate pentru evenimente de plată
                    </p>
                  </div>
                  <Switch
                    checked={settings.webhooksEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, webhooksEnabled: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Settings */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Structura Comisioanelor
                </CardTitle>
                <CardDescription>Configurează taxele platformei pentru tranzacții</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buyer Fee */}
                <div className="p-4 rounded-xl border-2 border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Receipt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold">Taxă Cumpărător</h4>
                        <p className="text-sm text-muted-foreground">Sumă fixă adăugată la fiecare comandă</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 text-lg px-4 py-1">
                      £{buyerFee?.amount?.toFixed(2) || '2.00'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={buyerFee?.amount || 2}
                      className="max-w-[150px]"
                      id="buyer-fee-input"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('buyer-fee-input') as HTMLInputElement;
                        if (buyerFee?.id) handleUpdateFee(buyerFee.id, parseFloat(input.value));
                      }}
                    >
                      Actualizează
                    </Button>
                  </div>
                </div>

                {/* Seller Commission */}
                <div className="p-4 rounded-xl border-2 border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold">Comision Vânzător</h4>
                        <p className="text-sm text-muted-foreground">Procent reținut din fiecare vânzare</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 text-lg px-4 py-1">
                      {sellerCommission?.amount || 10}%
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      defaultValue={sellerCommission?.amount || 10}
                      className="max-w-[150px]"
                      id="seller-commission-input"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('seller-commission-input') as HTMLInputElement;
                        if (sellerCommission?.id) handleUpdateFee(sellerCommission.id, parseFloat(input.value));
                      }}
                    >
                      Actualizează
                    </Button>
                  </div>
                </div>

                {/* Seller Subscription */}
                <div className="p-4 rounded-xl border-2 border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold">Abonament Vânzător</h4>
                        <p className="text-sm text-muted-foreground">Taxă lunară pentru a putea vinde</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 text-lg px-4 py-1">
                      £{sellerSubscription?.amount?.toFixed(2) || '1.00'}/lună
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={sellerSubscription?.amount || 1}
                      className="max-w-[150px]"
                      id="seller-sub-input"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('seller-sub-input') as HTMLInputElement;
                        if (sellerSubscription?.id) handleUpdateFee(sellerSubscription.id, parseFloat(input.value));
                      }}
                    >
                      Actualizează
                    </Button>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Calculul Comisioanelor</AlertTitle>
                  <AlertDescription>
                    Exemplu: Produs £100 → Cumpărător plătește £{100 + (buyerFee?.amount || 2)} | 
                    Vânzător primește £{(100 * (1 - (sellerCommission?.amount || 10) / 100)).toFixed(2)}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Settings */}
          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Setări Payouts către Vânzători
                </CardTitle>
                <CardDescription>Configurează transferurile automate către vânzători</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-green-500/5 to-green-500/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Payouts Automate</Label>
                    <p className="text-sm text-muted-foreground">
                      Transferă automat banii către vânzători după confirmarea livrării
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoPayouts}
                    onCheckedChange={(checked) => setSettings({...settings, autoPayouts: checked})}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Întârziere Payout (zile)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.payoutDelay}
                      onChange={(e) => setSettings({...settings, payoutDelay: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Zile de așteptare după confirmare livrare
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Frecvență Payouts</Label>
                    <Select 
                      value={settings.payoutSchedule} 
                      onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setSettings({...settings, payoutSchedule: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Zilnic</SelectItem>
                        <SelectItem value="weekly">Săptămânal</SelectItem>
                        <SelectItem value="monthly">Lunar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payout Minim (£)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.minimumPayout}
                      onChange={(e) => setSettings({...settings, minimumPayout: parseFloat(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Suma minimă pentru a procesa un payout
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700">Flux Payout</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    1. Cumpărător plătește → 2. Vânzător expediază → 3. Cumpărător confirmă livrare → 
                    4. Așteptare {settings.payoutDelay} zile → 5. Transfer automat către vânzător
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Securitate Plăți
                </CardTitle>
                <CardDescription>Protecție anti-fraud și securitate tranzacții</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        3D Secure
                        <Badge variant="secondary">Recomandat</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Verificare suplimentară pentru plăți cu card (SCA compliant)
                      </p>
                    </div>
                    <Switch
                      checked={settings.fraud3DSecure}
                      onCheckedChange={(checked) => setSettings({...settings, fraud3DSecure: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        Stripe Radar
                        <Badge className="bg-blue-500/10 text-blue-600">Anti-Fraud AI</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Detectare automată a tranzacțiilor frauduloase cu machine learning
                      </p>
                    </div>
                    <Switch
                      checked={settings.radarEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, radarEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Permite Refunduri</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite procesarea refundurilor pentru comenzi
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowRefunds}
                      onCheckedChange={(checked) => setSettings({...settings, allowRefunds: checked})}
                    />
                  </div>

                  {settings.allowRefunds && (
                    <div className="ml-4 p-4 rounded-lg bg-muted/50 space-y-2">
                      <Label>Fereastră Refund (zile)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.refundWindow}
                        onChange={(e) => setSettings({...settings, refundWindow: parseInt(e.target.value)})}
                        className="max-w-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Numărul de zile în care se pot solicita refunduri
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connect Settings */}
          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stripe Connect - Vânzători
                </CardTitle>
                <CardDescription>Configurează cum se conectează vânzătorii pentru a primi plăți</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Stripe Connect Express</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite vânzătorilor să își conecteze contul Stripe pentru a primi plăți
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableConnectExpress}
                    onCheckedChange={(checked) => setSettings({...settings, enableConnectExpress: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Verificare Obligatorie Vânzător</Label>
                    <p className="text-sm text-muted-foreground">
                      Vânzătorii trebuie verificați înainte de a putea primi plăți
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireSellerVerification}
                    onCheckedChange={(checked) => setSettings({...settings, requireSellerVerification: checked})}
                  />
                </div>

                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Cum funcționează Stripe Connect</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Vânzătorul își creează cont pe platformă</li>
                      <li>Merge în Setări → Conectare Stripe</li>
                      <li>Completează procesul Stripe Express (verificare identitate, cont bancar)</li>
                      <li>După aprobare, poate primi plăți automate în contul său</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <h4 className="font-bold">Linkuri Utile Stripe</h4>
                  <div className="grid gap-2">
                    <a 
                      href="https://dashboard.stripe.com/connect/accounts/overview" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Vezi Conturi Connect
                    </a>
                    <a 
                      href="https://dashboard.stripe.com/connect/transfers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Transferuri Connect
                    </a>
                    <a 
                      href="https://dashboard.stripe.com/settings/connect" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Setări Connect
                    </a>
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