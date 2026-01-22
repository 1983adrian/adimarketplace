import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Shield, ExternalLink, CreditCard, FileText, Building2, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const SellerVerification = () => {
  const { profile } = useAuth();

  const kycStatus = (profile as any)?.kyc_status || 'not_started';
  const kycCountry = (profile as any)?.kyc_country;
  const mangopayUserId = (profile as any)?.mangopay_user_id;
  const mangopayWalletId = (profile as any)?.mangopay_wallet_id;
  const adyenAccountId = (profile as any)?.adyen_account_id;
  const businessType = (profile as any)?.business_type || 'individual';
  const iban = (profile as any)?.iban;
  const sortCode = (profile as any)?.sort_code;
  const kycSubmittedAt = (profile as any)?.kyc_submitted_at;

  // Calculate verification progress
  const getVerificationProgress = () => {
    let steps = 0;
    const total = 4;
    
    if (kycCountry) steps++;
    if (iban || sortCode) steps++;
    if (mangopayUserId || adyenAccountId) steps++;
    if (kycStatus === 'verified' || kycStatus === 'approved') steps++;
    
    return Math.round((steps / total) * 100);
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
      case 'verified':
        return (
          <Badge className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Verificat
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-100">
            <Clock className="h-3 w-3" />
            În Verificare
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Respins
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Neverificat
          </Badge>
        );
    }
  };

  const progress = getVerificationProgress();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Verificare KYC (Know Your Customer)</CardTitle>
              <CardDescription>
                Verificarea identității pentru procesare plăți via MangoPay/Adyen
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progres Verificare</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Status Specific Alerts */}
        {(kycStatus === 'approved' || kycStatus === 'verified') && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Cont Verificat ✅</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Identitatea ta a fost verificată cu succes. Poți primi plăți din vânzări și le poți retrage în contul bancar configurat.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === 'pending' && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Verificare în Curs</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Documentele tale sunt verificate de procesatorul de plăți. Procesul durează de obicei 24-48 ore lucrătoare.
              {kycSubmittedAt && (
                <span className="block mt-1 text-xs">
                  Trimis la: {new Date(kycSubmittedAt).toLocaleDateString('ro-RO')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === 'rejected' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verificare Respinsă</AlertTitle>
            <AlertDescription>
              Documentele tale nu au fost acceptate. Verifică datele introduse și reîncearcă cu documente valide și lizibile.
              <Link to="/settings?tab=payouts" className="underline block mt-2">
                Actualizează documentele →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {(!kycStatus || kycStatus === 'not_started') && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Verificare Necesară</AlertTitle>
            <AlertDescription>
              Pentru a primi plăți din vânzări, trebuie să îți verifici identitatea. 
              Completează formularul KYC din secțiunea Încasări.
              <Link to="/settings?tab=payouts" className="underline block mt-2">
                Începe verificarea →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Details Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tip Entitate</p>
              <p className="text-xs text-muted-foreground">
                {businessType === 'company' ? 'Persoană Juridică (Firmă)' : 'Persoană Fizică'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Țară KYC</p>
              <p className="text-xs text-muted-foreground">
                {kycCountry || 'Neconfigurat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Cont Bancar</p>
              <p className="text-xs text-muted-foreground">
                {iban ? `IBAN: ...${iban.slice(-4)}` : sortCode ? `UK: ••-••-${sortCode.slice(-2)}` : 'Neconfigurat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Wallet Procesator</p>
              <p className="text-xs text-muted-foreground">
                {mangopayWalletId ? '✅ MangoPay Activ' : adyenAccountId ? '✅ Adyen Activ' : '❌ Inactiv'}
              </p>
            </div>
          </div>
        </div>

        {/* Processor Info */}
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Ce înseamnă verificarea KYC?
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              Verificare automată și securizată prin MangoPay sau Adyen
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              Conformitate cu regulamentele UE (PSD2, AML/KYC)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              Datele tale sunt criptate și protejate GDPR
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              Transfer automat al banilor după livrare confirmată
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {kycStatus !== 'verified' && kycStatus !== 'approved' && (
            <Button asChild className="flex-1">
              <Link to="/settings?tab=payouts">
                <FileText className="h-4 w-4 mr-2" />
                {kycStatus === 'rejected' ? 'Reîncepe Verificarea' : 'Completează KYC'}
              </Link>
            </Button>
          )}
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <a href="https://www.mangopay.com/privacy-policy/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Politica de Confidențialitate MangoPay
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
