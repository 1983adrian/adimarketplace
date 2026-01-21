import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const SellerVerification = () => {
  const { profile } = useAuth();

  const kycStatus = (profile as any)?.kyc_status || 'pending';
  const kycCountry = (profile as any)?.kyc_country;
  const mangopayUserId = (profile as any)?.mangopay_user_id;
  const mangopayWalletId = (profile as any)?.mangopay_wallet_id;

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
      case 'verified':
        return (
          <Badge className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            KYC Verificat
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verificare KYC MangoPay
        </CardTitle>
        <CardDescription>
          Verificarea identității este procesată automat de MangoPay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status KYC:</span>
          {getStatusBadge()}
        </div>

        {/* Status Specific Alerts */}
        {(kycStatus === 'approved' || kycStatus === 'verified') && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Cont Verificat</AlertTitle>
            <AlertDescription className="text-green-700">
              Identitatea ta a fost verificată cu succes de MangoPay. 
              Poți primi plăți în contul tău.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Verificare în Curs</AlertTitle>
            <AlertDescription>
              Documentele tale sunt verificate de MangoPay. Procesul durează de obicei 24-48 ore.
              Vei primi o notificare când verificarea este completă.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === 'rejected' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verificare Respinsă</AlertTitle>
            <AlertDescription>
              Documentele tale nu au fost acceptate. Te rugăm să re-încerci cu documente valide.
            </AlertDescription>
          </Alert>
        )}

        {!kycStatus || kycStatus === 'not_started' && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Verificare Necesară</AlertTitle>
            <AlertDescription>
              Pentru a primi plăți, trebuie să îți verifici identitatea prin MangoPay.
              Procesul este simplu și securizat.
            </AlertDescription>
          </Alert>
        )}

        {/* Account Info */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium">Informații Cont MangoPay</h4>
          
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Țară KYC:</span>
              <span className="font-medium">{kycCountry || 'Neconfigurat'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID MangoPay:</span>
              <span className="font-mono text-xs">
                {mangopayUserId ? `${mangopayUserId.slice(0, 12)}...` : 'Neconfigurat'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono text-xs">
                {mangopayWalletId ? 'Activ' : 'Inactiv'}
              </span>
            </div>
          </div>
        </div>

        {/* Info about MangoPay */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Despre Verificarea MangoPay</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Verificare automată și securizată
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conform regulamentelor UE
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Datele tale sunt protejate
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Proces rapid (24-48 ore)
            </li>
          </ul>
        </div>

        {/* Help Link */}
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href="https://www.mangopay.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Află mai multe despre MangoPay
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
