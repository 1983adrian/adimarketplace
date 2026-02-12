import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet as WalletIcon, Clock, ArrowUpRight, 
  CheckCircle2, Loader2, AlertCircle, Banknote,
  Package, TrendingUp
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
import { supabase } from '@/integrations/supabase/client';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface OrderSummary {
  totalEarned: number;
  pendingAmount: number;
  deliveredCount: number;
  pendingCount: number;
}

const Wallet = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useLocalizedCurrency();
  
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalEarned: 0, pendingAmount: 0, deliveredCount: 0, pendingCount: 0
  });

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
      // Fetch PayPal email
      const { data: profile } = await supabase
        .from('profiles')
        .select('paypal_email')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setPaypalEmail((profile as any).paypal_email || '');
      }

      // Fetch delivered orders (real earned money - 0% commission)
      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('amount')
        .eq('seller_id', user.id)
        .eq('status', 'delivered');

      // Fetch pending orders (paid/shipped but not yet delivered)
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('amount')
        .eq('seller_id', user.id)
        .in('status', ['paid', 'shipped']);

      const totalEarned = (deliveredOrders || []).reduce((sum, o) => sum + Number(o.amount), 0);
      const pendingAmount = (pendingOrders || []).reduce((sum, o) => sum + Number(o.amount), 0);

      setOrderSummary({
        totalEarned,
        pendingAmount,
        deliveredCount: deliveredOrders?.length || 0,
        pendingCount: pendingOrders?.length || 0,
      });
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
    if (amount > orderSummary.totalEarned) {
      toast({ title: 'Fonduri insuficiente', variant: 'destructive' });
      return;
    }
    if (!paypalEmail) {
      toast({ title: 'PayPal neconfigurat', description: 'Adaugă email-ul PayPal în setări.', variant: 'destructive' });
      return;
    }

    setWithdrawing(true);
    try {
      // NOTE: Retragerea automată PayPal NU este implementată încă.
      // Această acțiune creează o cerere de retragere pe care adminul o procesează manual.
      toast({ 
        title: '⚠️ Funcție în dezvoltare', 
        description: 'Retragerea automată PayPal nu este încă disponibilă. Contactează administratorul platformei pentru a solicita transferul manual.',
        variant: 'destructive',
      });
      setWithdrawOpen(false);
      setWithdrawAmount('');
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
            Portofel
          </h1>
          <p className="text-muted-foreground">Soldurile tale reale din vânzări</p>
        </div>

        <div className="space-y-6">
          {/* Sold Disponibil - calculat din comenzi livrate */}
          <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <WalletIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Sold Disponibil</CardTitle>
                  <CardDescription className="text-green-700/70 dark:text-green-300/70">
                    Din {orderSummary.deliveredCount} comenzi livrate • 0% comision
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-4xl font-bold text-green-600 mb-1">
                {formatPrice(orderSummary.totalEarned)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Bani reali câștigați pe platformă
              </p>
              
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full gap-2 h-14 text-lg shadow-lg"
                    disabled={orderSummary.totalEarned <= 0 || !paypalEmail}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                    Retrage în PayPal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Retrage Fonduri
                    </DialogTitle>
                    <DialogDescription>
                      Fondurile vor fi transferate în contul PayPal în 1-3 zile lucrătoare.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sold disponibil:</span>
                        <span className="font-semibold text-green-600">{formatPrice(orderSummary.totalEarned)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Metoda:</span>
                        <span className="font-medium">PayPal</span>
                      </div>
                      {paypalEmail && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cont:</span>
                          <span className="font-mono text-xs">{paypalEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Suma de retras (RON)</Label>
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        max={orderSummary.totalEarned}
                        min={1}
                        step={0.01}
                        className="h-12 text-lg font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setWithdrawAmount(orderSummary.totalEarned.toString())}
                      >
                        Retrage tot ({formatPrice(orderSummary.totalEarned)})
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

          {/* În Așteptare - calculat din comenzi plătite/expediate */}
          <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/20">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">În Așteptare</CardTitle>
                  <CardDescription className="text-orange-700/70 dark:text-orange-300/70">
                    {orderSummary.pendingCount} comenzi în curs de livrare
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-4xl font-bold text-orange-600">
                {formatPrice(orderSummary.pendingAmount)}
              </p>
              {orderSummary.pendingAmount > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Fondurile devin disponibile după confirmarea livrării
                </p>
              )}
            </CardContent>
          </Card>

          {/* PayPal Warning */}
          {!paypalEmail && (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700 dark:text-amber-300">PayPal neconfigurat</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Pentru a retrage fonduri, configurează email-ul PayPal în{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-700 underline"
                  onClick={() => navigate('/settings')}
                >
                  Setări
                </Button>
                .
              </AlertDescription>
            </Alert>
          )}

          {/* Cum funcționează */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cum funcționează</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Vinzi produse</p>
                  <p className="text-sm text-muted-foreground">Suma apare în „În Așteptare"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Livrare confirmată</p>
                  <p className="text-sm text-muted-foreground">Banii trec în „Sold Disponibil" (0% comision)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Retragere PayPal</p>
                  <p className="text-sm text-muted-foreground">Transfer în 1-3 zile lucrătoare</p>
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
