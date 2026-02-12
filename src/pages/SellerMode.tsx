import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Package, Shield, Globe, 
  Save, CheckCircle2, AlertCircle, Loader2, User, Briefcase, Info
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SellerMode = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Seller mode
  const [isSeller, setIsSeller] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [hasAcceptedTermsBefore, setHasAcceptedTermsBefore] = useState(false);
  
  // Seller type: 'personal' (occasional) or 'business' (commercial)
  const [sellerType, setSellerType] = useState<'personal' | 'business'>('personal');
  
  // PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setIsSeller(p.is_seller || false);
      setStoreName(p.store_name || '');
      setHasAcceptedTermsBefore(!!p.seller_terms_accepted_at);
      setSellerTermsAccepted(!!p.seller_terms_accepted_at);
      setSellerType(p.seller_type || 'personal');
      setPaypalEmail(p.paypal_email || '');
      setDataLoading(false);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Eroare', description: 'Trebuie să fii autentificat.', variant: 'destructive' });
      return;
    }
    
    if (isSeller && !hasAcceptedTermsBefore && !sellerTermsAccepted) {
      toast({ 
        title: 'Acceptare termeni obligatorie', 
        description: 'Trebuie să accepți Termenii pentru a deveni vânzător.', 
        variant: 'destructive' 
      });
      return;
    }

    // Business sellers must have PayPal Business
    if (isSeller && sellerType === 'business' && !paypalEmail) {
      toast({ 
        title: 'PayPal Business obligatoriu', 
        description: 'Ca vânzător comercial, trebuie să ai un cont PayPal Business conectat conform regulilor PayPal.', 
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
        paypal_email: paypalEmail || null,
      };

      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        updateData.seller_terms_accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Send welcome email when first activating seller mode
      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        setHasAcceptedTermsBefore(true);
        // Send welcome email via edge function (fire and forget)
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
                <Switch 
                  checked={isSeller} 
                  onCheckedChange={setIsSeller}
                  className="scale-125"
                />
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
                      <strong>Planuri Vânzători:</strong> Alege un plan pentru a lista produse (de la 11 LEI).{' '}
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
                        <p className="text-sm text-muted-foreground">Vând obiecte personale ocazional (haine, electrocasnice, etc.). Nu este o activitate comercială regulată.</p>
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
                        <p className="text-sm text-muted-foreground">Vând produse regulat ca activitate comercială (magazin, PFA, SRL, reseller, producător).</p>
                        <p className="text-xs text-primary font-medium">→ PayPal Business obligatoriu (conform regulilor PayPal)</p>
                      </div>
                    </label>
                  </RadioGroup>

                  {sellerType === 'business' && (
                    <Alert className="mt-4 border-primary/30 bg-primary/5">
                      <Briefcase className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Conform regulilor PayPal</strong>, activitatea comercială regulată necesită un cont PayPal Business. Acesta oferă: protecție vânzător extinsă, facturi, rapoarte financiare și conformitate fiscală.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* PayPal */}
              <Card className={`border-2 ${paypalEmail ? 'border-green-500/30' : 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10'}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Cont PayPal {sellerType === 'business' ? 'Business' : ''}
                    {!paypalEmail && (
                      <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                        {sellerType === 'business' ? 'Obligatoriu' : 'Recomandat'}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {sellerType === 'business' 
                      ? 'Contul PayPal Business este obligatoriu pentru activitate comercială'
                      : 'Conectează contul PayPal pentru a primi plăți din vânzări'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!paypalEmail && (
                    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-700 dark:text-amber-300">
                        {sellerType === 'business' 
                          ? 'Cont PayPal Business necesar'
                          : 'Configurează PayPal pentru a primi plăți'
                        }
                      </AlertTitle>
                      <AlertDescription className="space-y-3 text-amber-800 dark:text-amber-200">
                        <p>
                          {sellerType === 'business'
                            ? 'Ca vânzător comercial, ai nevoie de un cont PayPal Business pentru conformitate și protecție. Contul PayPal Business este gratuit.'
                            : 'Fără PayPal, nu vei putea primi banii din vânzări. Poți lista produse, dar configurează PayPal cât mai curând.'
                          }
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <a 
                            href={sellerType === 'business' 
                              ? 'https://www.paypal.com/ro/business/open-business-account'
                              : 'https://www.paypal.com/ro/webapps/mpp/account-selection'
                            }
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                          >
                            <Globe className="h-4 w-4" />
                            {sellerType === 'business' 
                              ? 'Deschide Cont PayPal Business →'
                              : 'Deschide Cont PayPal →'
                            }
                          </a>
                        </div>

                        <div className="text-xs mt-1 space-y-1">
                          <p><strong>Pași:</strong></p>
                          {sellerType === 'business' ? (
                            <>
                              <p>1. Accesează link-ul și creează cont PayPal Business (gratuit)</p>
                              <p>2. Adaugă datele firmei (PFA/SRL/II) sau activitate independentă</p>
                              <p>3. Verifică identitatea și documentele în contul PayPal</p>
                              <p>4. Revino aici și adaugă email-ul PayPal Business</p>
                            </>
                          ) : (
                            <>
                              <p>1. Accesează link-ul și creează cont PayPal Personal (gratuit)</p>
                              <p>2. Verifică-ți identitatea (carte de identitate / pașaport)</p>
                              <p>3. Adaugă un card bancar sau cont bancar</p>
                              <p>4. Revino aici și adaugă email-ul PayPal</p>
                            </>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label className="text-base">
                      Email PayPal {sellerType === 'business' ? 'Business' : ''}
                    </Label>
                    <Input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="email@paypal.com"
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adresa de email asociată contului tău PayPal. Tracking-ul comenzilor se trimite automat la PayPal.
                    </p>
                  </div>

                  {paypalEmail && (
                    <Alert className="border-green-500/50 bg-green-500/10 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-700 text-base">PayPal conectat ✅</AlertTitle>
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <span className="font-semibold text-base block mt-1">📧 {paypalEmail}</span>
                        <span className="text-sm">Vei primi plăți și tracking automat pentru comenzi.</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Cum funcționează */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <h4 className="font-medium text-sm">Cum funcționează plățile:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Cumpărătorul plătește prin platforma noastră</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Tu expediezi produsul și adaugi numărul de tracking (AWB)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>Tracking-ul se trimite automat la PayPal pentru protecția ta</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span className="font-medium">Cumpărătorul confirmă livrarea → banii se eliberează în contul tău PayPal</span>
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
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Se salvează...' : 'Salvează Setările'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SellerMode;
