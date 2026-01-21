import React, { useState } from 'react';
import { 
  User, Building, Globe, MapPin, CreditCard, 
  Loader2, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

interface KYCFormData {
  businessType: 'individual' | 'company';
  firstName: string;
  lastName: string;
  birthday: string;
  nationality: string;
  countryOfResidence: string;
  email: string;
  companyName: string;
  companyRegistration: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  iban: string;
  bic: string;
}

interface KYCOnboardingFormProps {
  onComplete?: () => void;
}

export const KYCOnboardingForm: React.FC<KYCOnboardingFormProps> = ({ onComplete }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<KYCFormData>({
    businessType: 'individual',
    firstName: (profile as any)?.display_name?.split(' ')[0] || '',
    lastName: (profile as any)?.display_name?.split(' ').slice(1).join(' ') || '',
    birthday: '',
    nationality: 'GB',
    countryOfResidence: 'GB',
    email: user?.email || '',
    companyName: (profile as any)?.company_name || '',
    companyRegistration: (profile as any)?.company_registration || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    iban: (profile as any)?.iban || '',
    bic: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof KYCFormData, string>> = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) newErrors.firstName = 'Prenumele este obligatoriu';
      if (!form.lastName.trim()) newErrors.lastName = 'Numele este obligatoriu';
      if (!form.email.trim()) newErrors.email = 'Email-ul este obligatoriu';
      if (form.businessType === 'company') {
        if (!form.companyName.trim()) newErrors.companyName = 'Numele firmei este obligatoriu';
      }
    }

    if (currentStep === 2) {
      if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Adresa este obligatorie';
      if (!form.city.trim()) newErrors.city = 'Orașul este obligatoriu';
      if (!form.postalCode.trim()) newErrors.postalCode = 'Codul poștal este obligatoriu';
    }

    if (currentStep === 3) {
      if (form.iban && form.iban.length < 15) {
        newErrors.iban = 'IBAN-ul trebuie să aibă minim 15 caractere';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('kyc-onboarding', {
        body: {
          business_type: form.businessType,
          first_name: form.firstName,
          last_name: form.lastName,
          birthday: form.birthday || undefined,
          nationality: form.nationality,
          country_of_residence: form.countryOfResidence,
          email: form.email,
          company_name: form.companyName || undefined,
          company_registration: form.companyRegistration || undefined,
          address_line1: form.addressLine1,
          address_line2: form.addressLine2 || undefined,
          city: form.city,
          region: form.region || undefined,
          postal_code: form.postalCode,
          iban: form.iban || undefined,
          bic: form.bic || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Verificare KYC Inițiată!',
          description: 'Documentele tale vor fi verificate în 1-3 zile lucrătoare.',
        });
        onComplete?.();
      } else {
        throw new Error(data?.error || 'Eroare la trimiterea datelor');
      }
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field: keyof KYCFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Verificare Identitate (KYC)
        </CardTitle>
        <CardDescription>
          Completează datele pentru a putea primi plăți din vânzări conform reglementărilor Adyen/Mangopay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-primary text-primary-foreground' : 
                  step > s ? 'bg-green-500 text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className="hidden sm:inline text-sm">
                  {s === 1 ? 'Identitate' : s === 2 ? 'Adresă' : 'Cont Bancar'}
                </span>
              </div>
              {s < 3 && <div className="flex-1 h-0.5 bg-border mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>De ce avem nevoie de aceste date?</AlertTitle>
              <AlertDescription>
                Procesatorii de plăți (Adyen, Mangopay) necesită verificarea identității conform reglementărilor europene anti-spălare de bani (AML/KYC).
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label>Tip Vânzător</Label>
              <RadioGroup
                value={form.businessType}
                onValueChange={(v: 'individual' | 'company') => updateForm('businessType', v)}
                className="grid grid-cols-2 gap-4"
              >
                <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${form.businessType === 'individual' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="individual" id="kyc-individual" />
                  <Label htmlFor="kyc-individual" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-5 w-5" />
                    <span>Persoană Fizică</span>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${form.businessType === 'company' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="company" id="kyc-company" />
                  <Label htmlFor="kyc-company" className="flex items-center gap-2 cursor-pointer">
                    <Building className="h-5 w-5" />
                    <span>Firmă</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prenume *</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nume *</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data Nașterii</Label>
                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => updateForm('birthday', e.target.value)}
                  max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Naționalitate</Label>
                <Select value={form.nationality} onValueChange={(v) => updateForm('nationality', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.businessType === 'company' && (
              <>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nume Firmă *</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) => updateForm('companyName', e.target.value)}
                      placeholder="SC Exemplu SRL"
                      className={errors.companyName ? 'border-destructive' : ''}
                    />
                    {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>CUI / Nr. Înregistrare</Label>
                    <Input
                      value={form.companyRegistration}
                      onChange={(e) => updateForm('companyRegistration', e.target.value)}
                      placeholder="RO12345678"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Adresa de Rezidență</h3>
            </div>

            <div className="space-y-2">
              <Label>Țara de Rezidență *</Label>
              <Select value={form.countryOfResidence} onValueChange={(v) => updateForm('countryOfResidence', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Adresa (Stradă, Număr) *</Label>
              <Input
                value={form.addressLine1}
                onChange={(e) => updateForm('addressLine1', e.target.value)}
                placeholder="Str. Exemplu nr. 10"
                className={errors.addressLine1 ? 'border-destructive' : ''}
              />
              {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1}</p>}
            </div>

            <div className="space-y-2">
              <Label>Adresa (Bloc, Scară, Apt)</Label>
              <Input
                value={form.addressLine2}
                onChange={(e) => updateForm('addressLine2', e.target.value)}
                placeholder="Bloc 4, Sc. B, Apt. 12"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Oraș *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label>Județ / Regiune</Label>
                <Input
                  value={form.region}
                  onChange={(e) => updateForm('region', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cod Poștal *</Label>
                <Input
                  value={form.postalCode}
                  onChange={(e) => updateForm('postalCode', e.target.value)}
                  className={errors.postalCode ? 'border-destructive' : ''}
                />
                {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Cont Bancar pentru Încasări</h3>
            </div>

            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                Banii din vânzări vor fi transferați automat în acest cont după confirmarea livrării de către cumpărător.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input
                value={form.iban}
                onChange={(e) => updateForm('iban', e.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="GB00XXXX00000000000000"
                maxLength={34}
                className={errors.iban ? 'border-destructive' : ''}
              />
              {errors.iban && <p className="text-xs text-destructive">{errors.iban}</p>}
              <p className="text-xs text-muted-foreground">
                Introdu IBAN-ul complet, fără spații
              </p>
            </div>

            <div className="space-y-2">
              <Label>BIC / SWIFT (opțional)</Label>
              <Input
                value={form.bic}
                onChange={(e) => updateForm('bic', e.target.value.toUpperCase())}
                placeholder="XXXXGB2L"
                maxLength={11}
              />
            </div>

            <Alert className="border-green-500/50 bg-green-500/5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Gata de Trimitere!</AlertTitle>
              <AlertDescription>
                După trimitere, verificarea durează de obicei 1-3 zile lucrătoare. Vei fi notificat când procesul este complet.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Înapoi
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext}>
              Continuă
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se trimite...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Trimite pentru Verificare
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
