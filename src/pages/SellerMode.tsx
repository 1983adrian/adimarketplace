import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Package, Shield, User, Building, Globe, 
  Banknote, Building2, CreditCard, Save, Clock,
  CheckCircle2, AlertCircle, Loader2, MapPin
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'RO', name: 'România' },
  { code: 'DE', name: 'Germania' },
  { code: 'FR', name: 'Franța' },
  { code: 'IT', name: 'Italia' },
  { code: 'ES', name: 'Spania' },
  { code: 'PL', name: 'Polonia' },
  { code: 'NL', name: 'Olanda' },
  { code: 'BE', name: 'Belgia' },
  { code: 'AT', name: 'Austria' },
  { code: 'PT', name: 'Portugalia' },
  { code: 'IE', name: 'Irlanda' },
];

const SellerMode = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Seller mode
  const [isSeller, setIsSeller] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [hasAcceptedTermsBefore, setHasAcceptedTermsBefore] = useState(false);
  
  // Address for KYC only
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // KYC & Payout
  const [kycStatus, setKycStatus] = useState('pending');
  const [businessType, setBusinessType] = useState<'individual' | 'company'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [companyRegistration, setCompanyRegistration] = useState('');
  const [kycCountry, setKycCountry] = useState('GB');
  const [payoutMethod, setPayoutMethod] = useState<'iban' | 'card'>('iban');
  const [iban, setIban] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

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
      // Address for KYC
      setAddressLine1(p.address_line1 || '');
      setCity(p.city || '');
      setPostalCode(p.postal_code || '');
      // KYC & Payout
      setKycStatus(p.kyc_status || 'pending');
      setBusinessType(p.business_type || 'individual');
      setCompanyName(p.company_name || '');
      setCompanyRegistration(p.company_registration || '');
      setKycCountry(p.kyc_country || 'GB');
      setPayoutMethod(p.payout_method || 'iban');
      setIban(p.iban || '');
      setCardHolderName(p.card_holder_name || '');
      setSortCode(p.sort_code || '');
      setAccountNumber(p.account_number || '');
      setDataLoading(false);
    }
  }, [profile]);

  const handleSave = async () => {
    console.log('[SellerMode] handleSave called, user:', user?.id);
    if (!user) {
      console.log('[SellerMode] No user, aborting save');
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

    setSaving(true);
    console.log('[SellerMode] Saving data...');
    try {
      const updateData: any = {
        is_seller: isSeller,
        store_name: storeName,
        // Address for KYC
        address_line1: addressLine1,
        city: city,
        postal_code: postalCode,
        // KYC & Payout
        business_type: businessType,
        company_name: companyName,
        company_registration: companyRegistration,
        kyc_country: kycCountry,
        payout_method: payoutMethod,
        iban: iban,
        card_holder_name: cardHolderName,
        sort_code: sortCode,
        account_number: accountNumber,
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
      }
      
      console.log('[SellerMode] Save successful');
      toast({ title: 'Setări salvate cu succes!' });
    } catch (error: any) {
      console.error('[SellerMode] Save error:', error);
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleInitiateKYC = async () => {
    console.log('[SellerMode] handleInitiateKYC called, user:', user?.id);
    if (!user) {
      console.log('[SellerMode] No user, aborting KYC');
      toast({ title: 'Eroare', description: 'Trebuie să fii autentificat.', variant: 'destructive' });
      return;
    }
    
    // Validate required fields
    if (!storeName) {
      toast({ title: 'Eroare', description: 'Introdu numele magazinului.', variant: 'destructive' });
      return;
    }
    if (!kycCountry) {
      toast({ title: 'Eroare', description: 'Selectează țara contului.', variant: 'destructive' });
      return;
    }
    if (payoutMethod === 'iban' && !iban) {
      toast({ title: 'Eroare', description: 'Introdu IBAN-ul.', variant: 'destructive' });
      return;
    }
    if (payoutMethod === 'card' && (!sortCode || !accountNumber)) {
      toast({ title: 'Eroare', description: 'Introdu Sort Code și Account Number.', variant: 'destructive' });
      return;
    }

    setKycLoading(true);
    try {
      // First save all data
      await handleSave();

      // Get profile for name
      const profileData = profile as any;
      const firstName = profileData?.first_name || profileData?.display_name?.split(' ')[0] || 'User';
      const lastName = profileData?.last_name || profileData?.display_name?.split(' ').slice(1).join(' ') || '';

      // Call KYC onboarding edge function
      const { data, error } = await supabase.functions.invoke('kyc-onboarding', {
        body: {
          business_type: businessType,
          first_name: firstName,
          last_name: lastName || firstName,
          nationality: kycCountry,
          country_of_residence: kycCountry,
          email: user.email,
          company_name: businessType === 'company' ? companyName : undefined,
          company_registration: businessType === 'company' ? companyRegistration : undefined,
          address_line1: profileData?.address_line1 || 'Address pending',
          city: profileData?.city || 'City pending',
          postal_code: profileData?.postal_code || '000000',
          payout_method: payoutMethod,
          iban: payoutMethod === 'iban' ? iban : undefined,
          sort_code: payoutMethod === 'card' ? sortCode : undefined,
          account_number: payoutMethod === 'card' ? accountNumber : undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setKycStatus('pending');
        toast({
          title: 'Verificare KYC Inițiată! ✅',
          description: 'Datele tale au fost trimise către MangoPay pentru verificare. Procesul durează 1-3 zile lucrătoare.',
        });
      } else {
        throw new Error(data?.error || 'Eroare la inițierea verificării');
      }
    } catch (error: any) {
      console.error('KYC initiation error:', error);
      toast({ 
        title: 'Eroare la inițierea KYC', 
        description: error.message || 'Verifică datele și încearcă din nou.', 
        variant: 'destructive' 
      });
    } finally {
      setKycLoading(false);
    }
  };

  const getKycStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
      case 'approved':
        return <Badge className="bg-green-500 text-white gap-1"><CheckCircle2 className="h-3 w-3" />Verificat</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-500 gap-1"><Clock className="h-3 w-3" />În așteptare</Badge>;
      default:
        return <Badge variant="secondary">Necunoscut</Badge>;
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
                      <strong>Limită:</strong> Max 10 produse active simultan. Vânzările sunt nelimitate!
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

              {/* KYC - Single unified card */}

              {/* Tip Vânzător */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Tip Vânzător
                  </CardTitle>
                  <CardDescription>Alege dacă vinzi ca persoană fizică sau firmă (opțional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={businessType}
                    onValueChange={(value: 'individual' | 'company') => setBusinessType(value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'individual' ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer flex-1">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">Persoană Fizică</p>
                          <p className="text-xs text-muted-foreground">Vinzi în nume propriu</p>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'company' ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">Firmă</p>
                          <p className="text-xs text-muted-foreground">Vinzi prin companie</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {businessType === 'company' && (
                    <div className="grid gap-4 md:grid-cols-2 mt-4 p-4 rounded-xl bg-muted/50">
                      <div className="space-y-2">
                        <Label>Nume Firmă</Label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="SC Exemplu SRL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CUI / Cod Înregistrare</Label>
                        <Input
                          value={companyRegistration}
                          onChange={(e) => setCompanyRegistration(e.target.value)}
                          placeholder="RO12345678"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Țara Contului */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Țara Contului
                  </CardTitle>
                  <CardDescription>Țara în care este înregistrat contul bancar sau cardul (salvată automat)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={kycCountry} onValueChange={async (value) => {
                    setKycCountry(value);
                    // Salvează imediat în baza de date
                    if (user) {
                      try {
                        await supabase
                          .from('profiles')
                          .update({ kyc_country: value, country: value })
                          .eq('user_id', user.id);
                        toast({ title: 'Țara salvată cu succes!' });
                      } catch (error: any) {
                        toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
                      }
                    }
                  }}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selectează țara" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Aceasta va fi folosită pentru verificarea KYC MangoPay și determinarea metodei de plată (IBAN UE sau Sort Code UK).
                  </p>
                </CardContent>
              </Card>

              {/* Metodă de Încasare */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Metodă de Încasare
                  </CardTitle>
                  <CardDescription>Alege cum dorești să primești banii din vânzări</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={payoutMethod}
                    onValueChange={(value: 'iban' | 'card') => setPayoutMethod(value)}
                    className="space-y-3"
                  >
                    <div className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${payoutMethod === 'iban' ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="iban" id="iban" className="mt-1" />
                      <Label htmlFor="iban" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-5 w-5 text-primary" />
                          <p className="font-semibold">Transfer Bancar (IBAN)</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Banii se virează direct în contul tău bancar. Recomandat pentru sume mari.
                        </p>
                      </Label>
                    </div>
                    <div className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${payoutMethod === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-muted-foreground/30'}`}>
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <Label htmlFor="card" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <p className="font-semibold">Card de Debit</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Banii se virează pe cardul tău. Transfer mai rapid (instant în unele cazuri).
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  {payoutMethod === 'iban' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      <div className="space-y-2">
                        <Label className="text-base">IBAN</Label>
                        <Input
                          value={iban}
                          onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          placeholder="GB00XXXX00000000000000"
                          maxLength={34}
                          className="h-12 font-mono text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          Introdu IBAN-ul complet, fără spații
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">Titular Cont</Label>
                        <Input
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Nume Prenume"
                          className="h-12"
                        />
                      </div>
                    </div>
                  )}

                  {payoutMethod === 'card' && (
                    <div className="space-y-4 animate-in fade-in-50">
                      <Alert className="border-blue-500/50 bg-blue-500/5">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-700">Card UK (Sort Code + Account Number)</AlertTitle>
                        <AlertDescription>
                          Introdu detaliile contului tău bancar din UK.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label className="text-base">Titular Cont / Card</Label>
                        <Input
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Nume Prenume"
                          className="h-12"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sort Code</Label>
                          <Input
                            value={sortCode}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length > 6) value = value.slice(0, 6);
                              if (value.length >= 4) {
                                value = value.slice(0, 2) + '-' + value.slice(2, 4) + (value.length > 4 ? '-' + value.slice(4) : '');
                              } else if (value.length >= 2) {
                                value = value.slice(0, 2) + '-' + value.slice(2);
                              }
                              setSortCode(value);
                            }}
                            placeholder="00-00-00"
                            maxLength={8}
                            className="h-12 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                            placeholder="00000000"
                            maxLength={8}
                            className="h-12 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verificare Identitate (KYC) - SINGLE UNIFIED CARD */}
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Verificare Identitate (KYC)
                      </CardTitle>
                      <CardDescription>Status verificare pentru plăți MangoPay</CardDescription>
                    </div>
                    {getKycStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {kycStatus === 'pending' && (
                    <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-orange-700 dark:text-orange-300">Verificare în curs</AlertTitle>
                      <AlertDescription className="text-orange-600 dark:text-orange-400">
                        Documentele tale sunt în curs de verificare de către MangoPay. 
                        Acest proces poate dura 1-3 zile lucrătoare.
                      </AlertDescription>
                    </Alert>
                  )}
                  {(kycStatus === 'verified' || kycStatus === 'approved') && (
                    <Alert className="border-green-500/50 bg-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-700">Verificat cu succes ✅</AlertTitle>
                      <AlertDescription>
                        Identitatea ta a fost verificată de MangoPay. Poți primi plăți din vânzări.
                      </AlertDescription>
                    </Alert>
                  )}
                  {(!kycStatus || kycStatus === 'not_started') && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Verificare Necesară</AlertTitle>
                      <AlertDescription>
                        Pentru a primi plăți din vânzări, completează datele de mai sus și apasă butonul de mai jos.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* KYC Initiation Button inside the card */}
                  {kycStatus !== 'verified' && kycStatus !== 'approved' && (
                    <div className="pt-2 space-y-2">
                      <Button 
                        onClick={handleInitiateKYC} 
                        disabled={kycLoading || !storeName || !kycCountry || (payoutMethod === 'iban' && !iban) || (payoutMethod === 'card' && (!sortCode || !accountNumber))} 
                        size="lg"
                        className="w-full h-14 text-lg gap-2 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {kycLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Shield className="h-5 w-5" />
                        )}
                        {kycLoading ? 'Se procesează...' : 'Inițiază Verificarea KYC'}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Completează: nume magazin, țară și date bancare pentru a iniția verificarea.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Save Button - Always visible */}
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
