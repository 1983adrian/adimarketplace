import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet as WalletIcon, Clock, ArrowUpRight, 
  CheckCircle2, Loader2, AlertCircle, CreditCard,
  Building2, Banknote
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const Wallet = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [payoutBalance, setPayoutBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [iban, setIban] = useState('');
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('payout_balance, pending_balance, payout_method, iban, sort_code, account_number, kyc_status')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        const p = data as any;
        setPayoutBalance(p.payout_balance || 0);
        setPendingBalance(p.pending_balance || 0);
        setPayoutMethod(p.payout_method || 'iban');
        setIban(p.iban || p.sort_code && p.account_number ? `${p.sort_code} / ${p.account_number}` : '');
        setKycStatus(p.kyc_status || 'pending');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Sumă invalidă', variant: 'destructive' });
      return;
    }
    if (amount > payoutBalance) {
      toast({ title: 'Fonduri insuficiente', variant: 'destructive' });
      return;
    }
    if (kycStatus !== 'verified' && kycStatus !== 'approved') {
      toast({ title: 'Verificare KYC necesară', description: 'Completează verificarea identității pentru a retrage fonduri.', variant: 'destructive' });
      return;
    }

    setWithdrawing(true);
    try {
      // Simulate withdrawal - in production this would call an edge function
      const { error } = await supabase
        .from('profiles')
        .update({
          payout_balance: payoutBalance - amount,
          pending_balance: pendingBalance + amount,
        } as any)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPayoutBalance(prev => prev - amount);
      setPendingBalance(prev => prev + amount);
      setWithdrawOpen(false);
      setWithdrawAmount('');
      
      toast({ 
        title: 'Retragere inițiată', 
        description: `£${amount.toFixed(2)} vor fi transferați în 1-3 zile lucrătoare.` 
      });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setWithdrawing(false);
    }
  };

  if (authLoading || loading) {
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
            <WalletIcon className="h-6 w-6 text-amber-500" />
            {t('wallet.title')}
          </h1>
          <p className="text-muted-foreground">{t('wallet.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Sold Disponibil - Main Card */}
          <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <WalletIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('wallet.availableBalance')}</CardTitle>
                  <CardDescription className="text-green-700/70 dark:text-green-300/70">
                    {t('wallet.readyForTransfer')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-5xl font-bold text-green-600 mb-4">
                £{payoutBalance.toFixed(2)}
              </p>
              
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full gap-2 h-14 text-lg shadow-lg"
                    disabled={payoutBalance <= 0 || (kycStatus !== 'verified' && kycStatus !== 'approved')}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                    {t('wallet.withdrawFunds')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Retrage Fonduri
                    </DialogTitle>
                    <DialogDescription>
                      Fondurile vor fi transferate în contul tău bancar în 1-3 zile lucrătoare.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sold disponibil:</span>
                        <span className="font-semibold text-green-600">£{payoutBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Metoda:</span>
                        <span className="font-medium flex items-center gap-1">
                          {payoutMethod === 'iban' ? (
                            <><Building2 className="h-4 w-4" /> IBAN</>
                          ) : (
                            <><CreditCard className="h-4 w-4" /> Card UK</>
                          )}
                        </span>
                      </div>
                      {iban && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cont:</span>
                          <span className="font-mono text-xs">{iban.slice(0, 10)}...</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Suma de retras (£)</Label>
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        max={payoutBalance}
                        min={1}
                        step={0.01}
                        className="h-12 text-lg font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setWithdrawAmount(payoutBalance.toString())}
                      >
                        Retrage tot (£{payoutBalance.toFixed(2)})
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                      Anulează
                    </Button>
                    <Button onClick={handleWithdraw} disabled={withdrawing} className="gap-2">
                      {withdrawing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Confirmă Retragerea
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* În Așteptare */}
          <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/20">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('wallet.pending')}</CardTitle>
                  <CardDescription className="text-orange-700/70 dark:text-orange-300/70">
                    {t('wallet.processing')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-4xl font-bold text-orange-600">
                £{pendingBalance.toFixed(2)}
              </p>
              {pendingBalance > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('wallet.fundsAvailableAfter')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* KYC Warning */}
          {kycStatus !== 'verified' && kycStatus !== 'approved' && (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700 dark:text-amber-300">{t('wallet.kycWarning')}</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                {t('wallet.kycWarningDesc')}{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-700 underline"
                  onClick={() => navigate('/seller-mode')}
                >
                  {t('seller.title')}
                </Button>
                .
              </AlertDescription>
            </Alert>
          )}

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('wallet.howItWorks')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">{t('wallet.step1Title')}</p>
                  <p className="text-sm text-muted-foreground">{t('wallet.step1Desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">{t('wallet.step2Title')}</p>
                  <p className="text-sm text-muted-foreground">{t('wallet.step2Desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">{t('wallet.step3Title')}</p>
                  <p className="text-sm text-muted-foreground">{t('wallet.step3Desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
