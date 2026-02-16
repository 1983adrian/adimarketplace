import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Package, Shield, Globe, 
  Save, CheckCircle2, AlertCircle, Loader2, User, Briefcase, Info, Unlink
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayPalStatus {
  connected: boolean;
  merchant_id?: string;
  permissions_granted?: boolean;
  payments_receivable?: boolean;
  primary_email?: string;
  connected_at?: string;
}

const SellerMode = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [connectingPayPal, setConnectingPayPal] = useState(false);
  const [disconnectingPayPal, setDisconnectingPayPal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [isSeller, setIsSeller] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [hasAcceptedTermsBefore, setHasAcceptedTermsBefore] = useState(false);
  const [sellerType, setSellerType] = useState<'personal' | 'business'>('personal');
  
  // PayPal Commerce Platform status
  const [paypalStatus, setPaypalStatus] = useState<PayPalStatus>({ connected: false });
  const [checkingPayPal, setCheckingPayPal] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  // Handle PayPal return callback (after OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const merchantIdInPayPal = params.get('merchantIdInPayPal');
    const permissionsGranted = params.get('permissionsGranted');
    const accountStatus = params.get('accountStatus');
    const isEmailConfirmed = params.get('isEmailConfirmed');

    if (merchantIdInPayPal) {
      // Complete onboarding via edge function
      setCheckingPayPal(true);
      supabase.functions.invoke('paypal-onboard-seller', {
        body: { action: 'complete-onboarding', merchantIdInPayPal }
      }).then(({ data, error }) => {
        if (!error && data?.success) {
          setPaypalStatus({
            connected: true,
            merchant_id: data.merchant_id,
            permissions_granted: data.permissions_granted,
            payments_receivable: data.payments_receivable,
          });
          toast({ 
            title: '✅ PayPal Business conectat!',
            description: `Merchant ID: ${data.merchant_id}`,
          });
        } else {
          toast({ 
            title: 'Eroare la finalizarea conexiunii',
            description: error?.message || 'Încearcă din nou',
            variant: 'destructive',
          });
        }
        setCheckingPayPal(false);
        // Clean URL
        navigate('/seller-mode', { replace: true });
      });
    }
  }, []);

  // Load profile data
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setIsSeller(p.is_seller || false);
      setStoreName(p.store_name || '');
      setHasAcceptedTermsBefore(!!p.seller_terms_accepted_at);
      setSellerTermsAccepted(!!p.seller_terms_accepted_at);
      setSellerType(p.seller_type || 'personal');
      
      // Check PayPal status
      if (p.paypal_merchant_id) {
        setPaypalStatus({
          connected: true,
          merchant_id: p.paypal_merchant_id,
          permissions_granted: p.paypal_permissions_granted,
        });
      }
      setDataLoading(false);
    }
  }, [profile]);

  // Fetch live PayPal status
  const refreshPayPalStatus = async () => {
    setCheckingPayPal(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-onboard-seller', {
        body: { action: 'get-status' }
      });
      if (!error && data) {
        setPaypalStatus(data);
      }
    } catch (err) {
      console.error('PayPal status check failed:', err);
    } finally {
      setCheckingPayPal(false);
    }
  };

  const handleConnectPayPal = async () => {
    setConnectingPayPal(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-onboard-seller', {
        body: { 
          action: 'connect',
          return_url: 'https://www.marketplaceromania.com/seller-mode'
        }
      });
      if (error) throw error;
      if (data?.action_url) {
        window.location.href = data.action_url;
      } else {
        throw new Error('Nu s-a primit link-ul PayPal');
      }
    } catch (err: any) {
      toast({ title: 'Eroare PayPal', description: err.message, variant: 'destructive' });
    } finally {
      setConnectingPayPal(false);
    }
  };

  const handleDisconnectPayPal = async () => {
    setDisconnectingPayPal(true);
    try {
      const { error } = await supabase.functions.invoke('paypal-onboard-seller', {
        body: { action: 'disconnect' }
      });
      if (error) throw error;
      setPaypalStatus({ connected: false });
      toast({ title: 'PayPal deconectat' });
    } catch (err: any) {
      toast({ title: 'Eroare', description: err.message, variant: 'destructive' });
    } finally {
      setDisconnectingPayPal(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Eroare', description: 'Trebuie să fii autentificat.', variant: 'destructive' });
      return;
    }
    
    if (isSeller && !hasAcceptedTermsBefore && !sellerTermsAccepted) {
      toast({ title: 'Acceptare termeni obligatorie', description: 'Trebuie să accepți Termenii.', variant: 'destructive' });
      return;
    }

    if (isSeller && sellerType === 'business' && !paypalStatus.connected) {
      toast({ 
        title: 'PayPal Business obligatoriu', 
        description: 'Ca vânzător comercial, trebuie să conectezi un cont PayPal Business.',
        variant: 'destructive' 
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        is_seller: isSeller,
        store_name: storeName,
        seller_type: sellerType,
      };

      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        updateData.seller_terms_accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        setHasAcceptedTermsBefore(true);
        supabase.functions.invoke('send-seller-email', {
          body: { type: 'welcome_seller', seller_id: user.id, store_name: storeName }
        }).catch(console.error);
      }
      
      toast({ title: 'Setări salvate cu succes!' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-amber-500" />
            Mod Vânzător
          </h1>
          <p className="text-muted-foreground">Activează pentru a lista produse de vânzare</p>
        </div>

        <div className="space-y-6">
          {/* Activare Mod Vânzător */}
          <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-background shadow-sm border">
                <div className="space-y-1">
                  <p className="font-semibold text-lg">Activează Modul Vânzător</p>
                  <p className="text-sm text-muted-foreground">Permite listarea produselor</p>
                </div>
                <Switch checked={isSeller} onCheckedChange={setIsSeller} className="scale-125" />
              </div>
            </CardContent>
          </Card>

          {isSeller && (
            <>
              {/* Nume Magazin */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-base font-medium">Nume Magazin *</Label>
                    <Input 
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Magazinul Meu" 
                      className="h-12 text-base"
                    />
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                    <Package className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Planuri Vânzători:</strong> Alege un plan pentru a lista produse.{' '}
                      <a href="/seller-plans" className="underline font-semibold">Vezi Planurile →</a>
                    </AlertDescription>
                  </Alert>

                  {/* Termeni */}
                  {!hasAcceptedTermsBefore ? (
                    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-primary">Termeni Vânzător</h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Descriere corectă a produselor</li>
                            <li>Expediere la timp</li>
                            <li>Respectarea politicii de returnări</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-primary/20">
                        <input
                          type="checkbox"
                          id="sellerTerms"
                          checked={sellerTermsAccepted}
                          onChange={(e) => setSellerTermsAccepted(e.target.checked)}
                          className="h-5 w-5 rounded border-primary text-primary cursor-pointer"
                        />
                        <label htmlFor="sellerTerms" className="text-sm cursor-pointer">
                          ✓ Termeni acceptați
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">✓ Termeni acceptați</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tip Vânzător */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Tip de Activitate
                  </CardTitle>
                  <CardDescription>
                    Alege tipul tău de vânzare — determină ce tip de cont PayPal ai nevoie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={sellerType} onValueChange={(v) => setSellerType(v as 'personal' | 'business')} className="space-y-3">
                    <label htmlFor="type-personal" className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${sellerType === 'personal' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="personal" id="type-personal" className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Vânzător Ocazional</span>
                          <Badge variant="secondary" className="text-xs">Personal</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Vând obiecte personale ocazional.</p>
                        <p className="text-xs text-primary font-medium">→ PayPal Personal este suficient</p>
                      </div>
                    </label>
                    
                    <label htmlFor="type-business" className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${sellerType === 'business' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="business" id="type-business" className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Vânzător Comercial / Afacere</span>
                          <Badge variant="default" className="text-xs">Business</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Vând produse regulat ca activitate comercială.</p>
                        <p className="text-xs text-primary font-medium">→ PayPal Business obligatoriu</p>
                      </div>
                    </label>
                  </RadioGroup>

                  {sellerType === 'business' && (
                    <Alert className="mt-4 border-primary/30 bg-primary/5">
                      <Briefcase className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Conform regulilor PayPal</strong>, activitatea comercială necesită un cont PayPal Business.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* ═══ PayPal Commerce Platform Connection ═══ */}
              <Card className={`border-2 ${paypalStatus.connected ? 'border-green-500/30' : 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10'}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#0070ba]" />
                    PayPal Commerce Platform
                    {paypalStatus.connected ? (
                      <Badge variant="outline" className="text-green-600 border-green-400 text-xs">
                        ✓ Verificat
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                        {sellerType === 'business' ? 'Obligatoriu' : 'Recomandat'}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Conectează-ți contul PayPal {sellerType === 'business' ? 'Business ' : ''}direct prin OAuth — fără email, fără parolă
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checkingPayPal ? (
                    <div className="flex items-center gap-3 p-6 justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0070ba]" />
                      <span className="text-muted-foreground">Se verifică conexiunea PayPal...</span>
                    </div>
                  ) : paypalStatus.connected ? (
                    <>
                      {/* Connected State */}
                      <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-green-700 dark:text-green-300 text-lg">
                              PayPal Conectat
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                              Merchant ID: {paypalStatus.merchant_id}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-black/20">
                            <span className={paypalStatus.permissions_granted ? 'text-green-600' : 'text-amber-600'}>
                              {paypalStatus.permissions_granted ? '✅' : '⏳'}
                            </span>
                            <span>Permisiuni acordate</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-black/20">
                            <span className={paypalStatus.payments_receivable ? 'text-green-600' : 'text-amber-600'}>
                              {paypalStatus.payments_receivable ? '✅' : '⏳'}
                            </span>
                            <span>Plăți activate</span>
                          </div>
                        </div>

                        {paypalStatus.primary_email && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Email verificat: {paypalStatus.primary_email}
                          </p>
                        )}

                        {paypalStatus.connected_at && (
                          <p className="text-xs text-muted-foreground">
                            Conectat la: {new Date(paypalStatus.connected_at).toLocaleDateString('ro-RO')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshPayPalStatus}
                          disabled={checkingPayPal}
                        >
                          {checkingPayPal ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'} Verifică Status
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={disconnectingPayPal}
                          onClick={handleDisconnectPayPal}
                        >
                          {disconnectingPayPal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                          Deconectează
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Not Connected — Show Connect Button */}
                      <div className="text-center space-y-4 py-2">
                        <div className="w-16 h-16 rounded-full bg-[#0070ba]/10 flex items-center justify-center mx-auto">
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0070ba">
                            <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.56a.483.483 0 0 1-.477-.558L8.215 21h1.85l.531-3.37a.804.804 0 0 1 .794-.68h.5c3.238 0 5.774-1.314 6.514-5.12.208-1.07.228-1.98-.337-2.852z"/>
                            <path d="M9.293 6.653a.483.483 0 0 1 .477-.558h6.107c.723 0 1.395.047 2.007.144a8.32 8.32 0 0 1 .67.149c.197.053.388.114.574.184.085.032.17.067.252.103l.044.02c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17H8.56l.733-4.653.531-3.37z" opacity=".7"/>
                            <path d="M9.77 6.095h6.107c.723 0 1.395.047 2.007.144.21.034.416.074.618.122.052.012.103.026.155.04a5.547 5.547 0 0 1 .521.164l.044.02c-.324-2.08-2.162-3.49-4.874-3.49H8.615a.805.805 0 0 0-.795.68L6.063 13.27l-.006.045.005-.028L7.215 5h1.85l.531-3.37a.804.804 0 0 1 .794-.68h-.62z" opacity=".35"/>
                          </svg>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">Conectează PayPal Business</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Vei fi redirecționat către PayPal pentru a autoriza platforma ca partener.
                            <br />Nu introduci email sau parolă aici — totul se face securizat pe PayPal.
                          </p>
                        </div>

                        <Button
                          size="lg"
                          className="w-full h-14 text-base gap-3 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold shadow-lg"
                          disabled={connectingPayPal}
                          onClick={handleConnectPayPal}
                        >
                          {connectingPayPal ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.56a.483.483 0 0 1-.477-.558L8.215 21h1.85l.531-3.37a.804.804 0 0 1 .794-.68h.5c3.238 0 5.774-1.314 6.514-5.12.208-1.07.228-1.98-.337-2.852z"/>
                              <path d="M9.293 6.653a.483.483 0 0 1 .477-.558h6.107c.723 0 1.395.047 2.007.144a8.32 8.32 0 0 1 .67.149c.197.053.388.114.574.184.085.032.17.067.252.103l.044.02c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17H8.56l.733-4.653.531-3.37z" opacity=".7"/>
                            </svg>
                          )}
                          {connectingPayPal ? 'Se conectează...' : 'Conectează cu PayPal'}
                        </Button>

                        <p className="text-xs text-muted-foreground">
                          Folosim PayPal Commerce Platform (Partner Referrals API) — standard industrial pentru marketplace-uri
                        </p>
                      </div>

                      {!paypalStatus.connected && sellerType === 'business' && (
                        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Obligatoriu pentru vânzători comerciali.</strong> Conectarea PayPal Business este necesară pentru a putea primi plăți.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  {/* Cum funcționează */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <h4 className="font-medium text-sm">Cum funcționează:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Apeși „Conectează cu PayPal" → ești redirecționat pe PayPal.com</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Te autentifici pe PayPal și autorizezi platforma ca partener</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>PayPal ne trimite Merchant ID-ul tău verificat (fără email/parolă)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span className="font-medium">Plățile cumpărătorilor ajung direct în contul tău PayPal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            size="lg"
            className="w-full h-14 text-lg gap-2 shadow-lg"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Se salvează...' : 'Salvează Setările'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SellerMode;
