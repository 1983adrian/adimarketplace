import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Shield, AlertTriangle, Unlink, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayPalStatus {
  connected: boolean;
  merchant_id?: string;
  permissions_granted?: boolean;
  connected_at?: string;
  payments_receivable?: boolean;
  primary_email?: string;
  kyc_required?: boolean;
  products?: string[];
}

export const PayPalConnect: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<PayPalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const callEdgeFunction = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Nu ești autentificat');

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-onboard-seller`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Eroare comunicare PayPal');
    return data;
  };

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await callEdgeFunction({ action: 'get-status' });
      setStatus(data);
    } catch (err) {
      console.error('PayPal status check failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle PayPal return — capture merchantIdInPayPal from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const merchantIdInPayPal = params.get('merchantIdInPayPal');
    const trackingId = params.get('trackingId') || params.get('merchantId');

    if (merchantIdInPayPal) {
      completeOnboarding(merchantIdInPayPal, trackingId);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const completeOnboarding = async (merchantIdInPayPal: string, trackingId: string | null) => {
    if (!user) return;
    setConnecting(true);
    try {
      const data = await callEdgeFunction({
        action: 'complete-onboarding',
        merchantIdInPayPal,
        trackingId,
      });

      if (data.kyc_completed === false || !data.payments_receivable) {
        toast({
          title: '⚠️ PayPal conectat — verificare necesară',
          description: 'PayPal necesită verificare suplimentară (KYC). Verifică email-ul PayPal.',
        });
      } else {
        toast({ title: '✅ PayPal conectat cu succes!', description: 'Poți primi plăți acum.' });
      }

      fetchStatus();
    } catch (err: any) {
      toast({ title: 'Eroare conectare PayPal', description: err.message, variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    setConnecting(true);
    try {
      // Get user profile for pre-fill
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const returnUrl = `${window.location.origin}/profile-settings`;

      const data = await callEdgeFunction({
        action: 'connect',
        return_url: returnUrl,
        seller_email: user.email,
        seller_name: profile?.display_name,
      });

      // Redirect to PayPal Partner Referrals onboarding
      window.location.href = data.action_url;
    } catch (err: any) {
      toast({ title: 'Eroare', description: err.message, variant: 'destructive' });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      await callEdgeFunction({ action: 'disconnect' });
      toast({ title: 'PayPal deconectat', description: 'Contul PayPal a fost deconectat.' });
      setStatus({ connected: false });
    } catch (err: any) {
      toast({ title: 'Eroare', description: err.message, variant: 'destructive' });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Se verifică contul PayPal...</span>
      </div>
    );
  }

  // Connected state
  if (status?.connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">PayPal Conectat</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {status.primary_email || status.merchant_id}
              </p>
              {status.connected_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Conectat la: {new Date(status.connected_at).toLocaleDateString('ro-RO')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {status.payments_receivable ? (
              <Badge variant="outline" className="text-green-600 border-green-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verificat
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <FileWarning className="h-3 w-3" />
                Verificare necesară
              </Badge>
            )}
          </div>
        </div>

        {/* KYC Required Alert */}
        {status.kyc_required && (
          <Alert className="bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>⚠️ PayPal necesită verificare suplimentară (KYC)!</strong>
              <br />
              PayPal solicită documente sau informații suplimentare pentru a activa complet plățile. 
              Poți primi notificări prin email de la PayPal cu instrucțiuni specifice.
              <br />
              <a 
                href="https://www.paypal.com/myaccount/settings/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-amber-900 dark:text-amber-100 underline font-bold"
              >
                Completează verificarea în contul PayPal <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Info */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Verificare PayPal:</strong> PayPal verifică automat identitatea vânzătorilor conform 
            regulamentelor de conformitate (KYC/AML). Poți primi solicitări de documente prin email 
            sau în contul PayPal. Verifică periodic:
            <a 
              href="https://www.paypal.com/myaccount/settings/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 underline font-semibold inline-flex items-center gap-1"
            >
              Contul meu PayPal <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          {disconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Unlink className="h-4 w-4 mr-2" />
          )}
          Deconectează PayPal
        </Button>
      </div>
    );
  }

  // Not connected state
  return (
    <div className="space-y-4">
      <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
          <strong>PayPal neconectat.</strong> Conectează-ți contul PayPal pentru a putea primi plăți 
          de la cumpărători. Fără PayPal nu poți vinde pe platformă.
        </AlertDescription>
      </Alert>

      <Card className="border-dashed border-2 border-[#0070ba]/30">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#0070ba]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#0070ba]" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.774.774 0 0 1 .763-.642h6.153c2.048 0 3.542.586 4.376 1.595.748.904 1.012 2.15.786 3.704l-.013.088v.773l.555.313c.482.261.872.585 1.163.979.382.52.614 1.163.687 1.905.075.772-.014 1.687-.265 2.718-.288 1.18-.747 2.21-1.373 3.06-.577.784-1.3 1.422-2.135 1.888-.797.445-1.727.738-2.762.87-.505.064-1.135.107-1.89.107H9.924a.781.781 0 0 0-.77.647l-.087.515-.632 4.002-.07.4a.648.648 0 0 1-.639.545h-2.4z"/>
            </svg>
          </div>
          
          <div>
            <h3 className="font-bold text-lg">Conectează-te cu PayPal</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vei fi redirecționat către PayPal pentru a-ți crea sau conecta contul de vânzător. 
              PayPal va verifica automat identitatea ta conform cerințelor de conformitate (KYC).
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 text-left bg-muted/50 rounded-lg p-3">
            <p className="font-semibold text-foreground">Ce se întâmplă:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Ești redirecționat la PayPal pentru autorizare</li>
              <li>PayPal verifică identitatea și conformitatea (KYC)</li>
              <li>Primești notificări dacă PayPal solicită documente</li>
              <li>Devii vânzător activ imediat ce verificarea este completă</li>
            </ul>
          </div>

          <Button
            onClick={handleConnect}
            disabled={connecting}
            size="lg"
            className="bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold px-8 h-12 gap-2"
          >
            {connecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.774.774 0 0 1 .763-.642h6.153c2.048 0 3.542.586 4.376 1.595.748.904 1.012 2.15.786 3.704l-.013.088v.773l.555.313c.482.261.872.585 1.163.979.382.52.614 1.163.687 1.905.075.772-.014 1.687-.265 2.718-.288 1.18-.747 2.21-1.373 3.06-.577.784-1.3 1.422-2.135 1.888-.797.445-1.727.738-2.762.87-.505.064-1.135.107-1.89.107H9.924a.781.781 0 0 0-.77.647l-.087.515-.632 4.002-.07.4a.648.648 0 0 1-.639.545h-2.4z"/>
              </svg>
            )}
            {connecting ? 'Se conectează...' : 'Conectează PayPal — Verificare Vânzător'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Nu ai cont PayPal?{' '}
            <a
              href="https://www.paypal.com/ro/webapps/mpp/account-selection"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-[#0070ba]"
            >
              Creează unul gratuit →
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
