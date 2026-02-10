import React, { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, Building2, Globe, FileText, 
  CheckCircle2, XCircle, AlertCircle, Loader2, Save,
  Banknote, BadgeCheck, Clock, User, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

interface PayoutSettings {
  payoutMethod: 'iban' | 'card';
  iban: string;
  cardLast4: string;
  cardHolderName: string;
  sortCode: string;
  accountNumber: string;
  kycStatus: string;
  kycCountry: string;
  businessType: 'individual' | 'company';
  companyName: string;
  companyRegistration: string;
  payoutBalance: number;
  pendingBalance: number;
  paypalEmail: string;
}

export const PayoutSection: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PayoutSettings>({
    payoutMethod: 'iban',
    iban: '',
    cardLast4: '',
    cardHolderName: '',
    sortCode: '',
    accountNumber: '',
    kycStatus: 'pending',
    kycCountry: 'GB',
    businessType: 'individual',
    companyName: '',
    companyRegistration: '',
    payoutBalance: 0,
    pendingBalance: 0,
    paypalEmail: '',
  });

  useEffect(() => {
    fetchPayoutSettings();
  }, [user]);

  const fetchPayoutSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        const profileData = data as any;
        setSettings({
          payoutMethod: (profileData.payout_method as 'iban' | 'card') || 'iban',
          iban: profileData.iban || '',
          cardLast4: profileData.card_number_last4 || '',
          cardHolderName: profileData.card_holder_name || '',
          sortCode: profileData.sort_code || '',
          accountNumber: profileData.account_number || '',
          kycStatus: profileData.kyc_status || 'pending',
          kycCountry: profileData.kyc_country || 'GB',
          businessType: (profileData.business_type as 'individual' | 'company') || 'individual',
          companyName: profileData.company_name || '',
          companyRegistration: profileData.company_registration || '',
          payoutBalance: profileData.payout_balance || 0,
          pendingBalance: profileData.pending_balance || 0,
          paypalEmail: profileData.paypal_email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          payout_method: settings.payoutMethod,
          iban: settings.iban,
          card_holder_name: settings.cardHolderName,
          sort_code: settings.sortCode,
          account_number: settings.accountNumber,
          kyc_country: settings.kycCountry,
          business_type: settings.businessType,
          company_name: settings.companyName,
          company_registration: settings.companyRegistration,
          paypal_email: settings.paypalEmail || null,
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ 
        title: 'Setări salvate', 
        description: 'Informațiile de plată au fost actualizate cu succes.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Eroare', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const getKycStatusBadge = () => {
    switch (settings.kycStatus) {
      case 'verified':
        return <Badge className="bg-green-500 text-white gap-1"><CheckCircle2 className="h-3 w-3" />Verificat</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-500 gap-1"><Clock className="h-3 w-3" />În așteptare</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Respins</Badge>;
      default:
        return <Badge variant="secondary">Necunoscut</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Se încarcă setările de plată...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sold Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Sold Disponibil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">£{settings.payoutBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Gata pentru transfer</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              În Așteptare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">£{settings.pendingBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Se procesează</p>
          </CardContent>
        </Card>
      </div>

      {/* Status KYC */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div>
                <CardTitle>Verificare Identitate (KYC)</CardTitle>
                <CardDescription>Status verificare pentru încasarea banilor</CardDescription>
              </div>
            </div>
            {getKycStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {settings.kycStatus === 'pending' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verificare în curs</AlertTitle>
              <AlertDescription>
                Documentele tale sunt în curs de verificare de către procesatorul de plăți (MangoPay). 
                Acest proces poate dura 1-3 zile lucrătoare.
              </AlertDescription>
            </Alert>
          )}
          {settings.kycStatus === 'verified' && (
            <Alert className="border-green-500/50 bg-green-500/5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Verificat cu succes</AlertTitle>
              <AlertDescription>
                Identitatea ta a fost verificată. Poți primi plăți din vânzări.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tipul de Entitate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tip Vânzător
          </CardTitle>
          <CardDescription>Alege dacă vinzi ca persoană fizică sau firmă (opțional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings.businessType}
            onValueChange={(value: 'individual' | 'company') => setSettings({ ...settings, businessType: value })}
            className="grid grid-cols-2 gap-4"
          >
            <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${settings.businessType === 'individual' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer flex-1">
                <User className="h-5 w-5" />
                <div>
                  <p className="font-medium">Persoană Fizică</p>
                  <p className="text-xs text-muted-foreground">Vinzi în nume propriu</p>
                </div>
              </Label>
            </div>
            <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${settings.businessType === 'company' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building className="h-5 w-5" />
                <div>
                  <p className="font-medium">Firmă</p>
                  <p className="text-xs text-muted-foreground">Vinzi prin companie</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {settings.businessType === 'company' && (
            <div className="grid gap-4 md:grid-cols-2 mt-4 p-4 rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Nume Firmă</Label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="SC Exemplu SRL"
                />
              </div>
              <div className="space-y-2">
                <Label>CUI / Cod Înregistrare</Label>
                <Input
                  value={settings.companyRegistration}
                  onChange={(e) => setSettings({ ...settings, companyRegistration: e.target.value })}
                  placeholder="RO12345678"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Țara */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Țara Contului
          </CardTitle>
          <CardDescription>Țara în care este înregistrat contul bancar sau cardul</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.kycCountry}
            onValueChange={(value) => setSettings({ ...settings, kycCountry: value })}
          >
            <SelectTrigger className="w-full md:w-[300px]">
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
        </CardContent>
      </Card>

      {/* Metoda de Plată */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Metodă de Încasare
          </CardTitle>
          <CardDescription>Alege cum dorești să primești banii din vânzări</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={settings.payoutMethod}
            onValueChange={(value: 'iban' | 'card') => setSettings({ ...settings, payoutMethod: value })}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${settings.payoutMethod === 'iban' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="iban" id="iban" className="mt-1" />
              <Label htmlFor="iban" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5" />
                  <p className="font-medium">Transfer Bancar (IBAN)</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Banii se virează direct în contul tău bancar. Recomandat pentru sume mari.
                </p>
              </Label>
            </div>
            <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${settings.payoutMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="card" id="card" className="mt-1" />
              <Label htmlFor="card" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5" />
                  <p className="font-medium">Card de Debit</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Banii se virează pe cardul tău. Transfer mai rapid (instant în unele cazuri).
                </p>
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          {settings.payoutMethod === 'iban' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={settings.iban}
                  onChange={(e) => setSettings({ ...settings, iban: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  placeholder="GB00XXXX00000000000000"
                  maxLength={34}
                />
                <p className="text-xs text-muted-foreground">
                  Introdu IBAN-ul complet, fără spații
                </p>
              </div>
              <div className="space-y-2">
                <Label>Titular Cont</Label>
                <Input
                  value={settings.cardHolderName}
                  onChange={(e) => setSettings({ ...settings, cardHolderName: e.target.value })}
                  placeholder="Nume Prenume"
                />
              </div>
            </div>
          )}

          {settings.payoutMethod === 'card' && (
            <div className="space-y-4">
              <Alert className="border-blue-500/50 bg-blue-500/5">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-700">Card UK (Sort Code + Account Number)</AlertTitle>
                <AlertDescription>
                  Introdu detaliile contului tău bancar din UK. Plățile sunt procesate în 1-2 zile lucrătoare.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Titular Cont / Card</Label>
                <Input
                  value={settings.cardHolderName}
                  onChange={(e) => setSettings({ ...settings, cardHolderName: e.target.value })}
                  placeholder="Nume Prenume (exact ca pe extras)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Code</Label>
                  <Input
                    value={settings.sortCode}
                    onChange={(e) => {
                      // Format: XX-XX-XX
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 6) value = value.slice(0, 6);
                      if (value.length >= 4) {
                        value = value.slice(0, 2) + '-' + value.slice(2, 4) + (value.length > 4 ? '-' + value.slice(4) : '');
                      } else if (value.length >= 2) {
                        value = value.slice(0, 2) + '-' + value.slice(2);
                      }
                      setSettings({ ...settings, sortCode: value });
                    }}
                    placeholder="00-00-00"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">6 cifre (ex: 04-00-04)</p>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={settings.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                      setSettings({ ...settings, accountNumber: value });
                    }}
                    placeholder="00000000"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">8 cifre</p>
                </div>
              </div>
              
              {settings.sortCode && settings.accountNumber && settings.sortCode.length === 8 && settings.accountNumber.length === 8 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="text-sm font-medium">Cont UK configurat: {settings.sortCode} / ••••{settings.accountNumber.slice(-4)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PayPal Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            PayPal (Opțional)
          </CardTitle>
          <CardDescription>Conectează contul PayPal pentru protecție suplimentară la vânzări</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email PayPal</Label>
            <Input
              type="email"
              value={settings.paypalEmail}
              onChange={(e) => setSettings({ ...settings, paypalEmail: e.target.value })}
              placeholder="email@paypal.com"
            />
            <p className="text-xs text-muted-foreground">
              Adaugă adresa de email asociată contului tău PayPal Business. Tracking-ul comenzilor va fi trimis automat la PayPal.
            </p>
          </div>
          {settings.paypalEmail && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">PayPal conectat: {settings.paypalEmail}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Se salvează...' : 'Salvează Setările de Plată'}
      </Button>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BadgeCheck className="h-5 w-5" />
            Cum funcționează plățile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
            <div>
              <p className="font-medium text-sm">Cumpărătorul plătește</p>
              <p className="text-xs text-muted-foreground">Plata este procesată prin Adyen sau Mangopay</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">2</div>
            <div>
              <p className="font-medium text-sm">Verificare automată</p>
              <p className="text-xs text-muted-foreground">Procesatorul verifică contul tău și tranzacția</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">3</div>
            <div>
              <p className="font-medium text-sm">Livrare confirmată</p>
              <p className="text-xs text-muted-foreground">Cumpărătorul confirmă primirea produsului</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">4</div>
            <div>
              <p className="font-medium text-sm">Transfer automat</p>
              <p className="text-xs text-muted-foreground">Platforma reține 10% comision, restul se virează în contul tău</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
