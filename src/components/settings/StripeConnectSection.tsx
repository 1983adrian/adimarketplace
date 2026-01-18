import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, Check, AlertCircle, ExternalLink, Loader2, 
  Wallet, Shield, BadgeCheck, RefreshCw, ChevronRight, Building2,
  Banknote, ArrowUpRight, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StripeAccountStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export const StripeConnectSection: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus>({ connected: false });

  // Check URL params for success/refresh
  useEffect(() => {
    const connected = searchParams.get('connected');
    const refresh = searchParams.get('refresh');
    
    if (connected === 'true') {
      toast({
        title: '🎉 Stripe Conectat!',
        description: 'Contul tău Stripe a fost conectat cu succes. Acum poți primi plăți!',
      });
    }
    
    if (refresh === 'true') {
      checkStripeStatus();
    }
  }, [searchParams]);

  // Check Stripe status on mount
  useEffect(() => {
    checkStripeStatus();
  }, [user]);

  const checkStripeStatus = async () => {
    if (!user) return;
    
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
        body: { action: 'status' },
      });

      if (error) throw error;
      
      setAccountStatus(data || { connected: false });
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
        body: { action: 'create' },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ 
        title: 'Eroare', 
        description: error.message || 'Nu am putut inițializa conexiunea Stripe', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetupProgress = () => {
    if (!accountStatus.connected) return 0;
    let progress = 25; // Account exists
    if (accountStatus.detailsSubmitted) progress += 25;
    if (accountStatus.chargesEnabled) progress += 25;
    if (accountStatus.payoutsEnabled) progress += 25;
    return progress;
  };

  const isFullySetup = accountStatus.connected && 
    accountStatus.detailsSubmitted && 
    accountStatus.chargesEnabled && 
    accountStatus.payoutsEnabled;

  if (checkingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Se verifică statusul Stripe...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className={isFullySetup ? 'border-green-500/50 bg-green-500/5' : 'border-orange-500/50 bg-orange-500/5'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isFullySetup ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                <Wallet className={`h-6 w-6 ${isFullySetup ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Stripe Connect
                  {isFullySetup && (
                    <Badge className="bg-green-500 text-white gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Activ
                    </Badge>
                  )}
                  {accountStatus.connected && !isFullySetup && (
                    <Badge variant="outline" className="text-orange-600 border-orange-500 gap-1">
                      <Clock className="h-3 w-3" />
                      Configurare Incompletă
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isFullySetup 
                    ? 'Contul tău este complet configurat și gata să primească plăți'
                    : 'Conectează-ți contul Stripe pentru a primi plăți din vânzări'}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={checkStripeStatus}
              disabled={checkingStatus}
            >
              <RefreshCw className={`h-4 w-4 ${checkingStatus ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {accountStatus.connected && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progres configurare</span>
                <span className="font-medium">{getSetupProgress()}%</span>
              </div>
              <Progress value={getSetupProgress()} className="h-2" />
            </div>
          )}

          {/* Status Checklist */}
          <div className="grid gap-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${accountStatus.connected ? 'bg-green-500/10' : 'bg-muted/50'}`}>
              {accountStatus.connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">Cont Stripe Creat</p>
                <p className="text-xs text-muted-foreground">Contul tău Stripe Express</p>
              </div>
              {accountStatus.accountId && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {accountStatus.accountId.slice(0, 12)}...
                </Badge>
              )}
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${accountStatus.detailsSubmitted ? 'bg-green-500/10' : 'bg-muted/50'}`}>
              {accountStatus.detailsSubmitted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">Detalii Completate</p>
                <p className="text-xs text-muted-foreground">Date personale și documente de identitate</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${accountStatus.chargesEnabled ? 'bg-green-500/10' : 'bg-muted/50'}`}>
              {accountStatus.chargesEnabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">Poate Primi Plăți</p>
                <p className="text-xs text-muted-foreground">Contul poate accepta plăți de la cumpărători</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${accountStatus.payoutsEnabled ? 'bg-green-500/10' : 'bg-muted/50'}`}>
              {accountStatus.payoutsEnabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">Poate Transfera Bani</p>
                <p className="text-xs text-muted-foreground">Transferuri către contul bancar</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          {!isFullySetup && (
            <Button 
              onClick={handleConnectStripe} 
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {accountStatus.connected ? 'Continuă Configurarea Stripe' : 'Conectează Cont Stripe'}
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {isFullySetup && (
            <div className="flex gap-3">
              <Button 
                onClick={handleConnectStripe} 
                disabled={loading}
                variant="outline"
                className="flex-1 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Dashboard Stripe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements Alert */}
      {!accountStatus.connected && (
        <Alert className="border-primary/50 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertTitle className="font-bold">Obligatoriu pentru Vânzători</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Pentru a vinde pe marketplace și a primi banii din vânzări, trebuie să îți conectezi contul Stripe.
            </p>
            <div className="grid gap-2 mt-3">
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Proces simplu și sigur - durează aproximativ 5-10 minute</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Dacă ai deja un cont Stripe, te vei conecta automat</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Dacă nu ai cont, vei crea unul nou în câțiva pași</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Stripe garantează securitatea tranzacțiilor tale</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* What you need */}
      {!accountStatus.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Ce ai nevoie pentru înregistrare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                <div>
                  <p className="font-medium text-sm">Document de Identitate</p>
                  <p className="text-xs text-muted-foreground">Buletin, pașaport sau permis de conducere</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                <div>
                  <p className="font-medium text-sm">Adresă Completă</p>
                  <p className="text-xs text-muted-foreground">Adresa ta de reședință din UK</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                <div>
                  <p className="font-medium text-sm">Cont Bancar UK</p>
                  <p className="text-xs text-muted-foreground">Sort code și număr de cont pentru transferuri</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">4</div>
                <div>
                  <p className="font-medium text-sm">Număr de Telefon</p>
                  <p className="text-xs text-muted-foreground">Pentru verificare prin SMS</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How payouts work */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Cum primești banii
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">✓</div>
              <div>
                <p className="font-medium text-sm">Vânzare Confirmată</p>
                <p className="text-xs text-muted-foreground">Cumpărătorul plătește și banii sunt reținuți în siguranță</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">📦</div>
              <div>
                <p className="font-medium text-sm">Livrare și Confirmare</p>
                <p className="text-xs text-muted-foreground">Cumpărătorul confirmă primirea coletului</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">💰</div>
              <div>
                <p className="font-medium text-sm">Transfer Automat</p>
                <p className="text-xs text-muted-foreground">Banii sunt transferați automat în contul tău Stripe (minus comisionul platformei)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">🏦</div>
              <div>
                <p className="font-medium text-sm">În Contul Bancar</p>
                <p className="text-xs text-muted-foreground">Stripe transferă automat în contul tău bancar (1-2 zile lucrătoare)</p>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Comision platformă:</strong> Din fiecare vânzare, platforma reține un comision de 10% pentru operare și mentenanță.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
