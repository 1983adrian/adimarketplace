import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Package, ArrowRight, XCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

type PaymentStatus = 'verifying' | 'confirmed' | 'failed' | 'pending' | 'error';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const orderIds = searchParams.get('order_ids');
  const invoiceNumber = searchParams.get('invoice');
  const paymentParam = searchParams.get('payment');
  // PayPal returns token as the PayPal order ID
  const paypalToken = searchParams.get('token');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderIds) {
        setStatus('error');
        setErrorMessage('Informații comandă lipsă');
        return;
      }

      const orderIdArray = orderIds.split(',');
      setOrderId(orderIdArray[0]);
      setPaymentMethod(paymentParam);

      // For COD orders, no verification needed
      if (paymentParam === 'cod') {
        setStatus('confirmed');
        return;
      }

      // For PayPal returns - capture the payment
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            orderIds: orderIdArray,
            invoiceNumber,
            paypalOrderId: paypalToken || undefined,
          },
        });

        if (error) {
          console.error('Payment verification error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Eroare la verificarea plății');
          return;
        }

        if (data.paymentConfirmed) {
          setStatus('confirmed');
          setPaymentMethod(paypalToken ? 'paypal' : paymentParam);
          if (data.amount) {
            setTotalAmount(parseFloat(data.amount));
          } else if (data.results?.[0]?.amount) {
            setTotalAmount(data.results[0].amount);
          }
          toast({
            title: '✅ Plată confirmată!',
            description: 'Comanda ta a fost procesată cu succes.',
          });
        } else if (data.status === 'awaiting_verification') {
          setStatus('pending');
          setErrorMessage('Așteptăm confirmarea plății...');
        } else {
          setStatus('failed');
          setErrorMessage(data.message || 'Plata nu a putut fi procesată');
          toast({
            title: '❌ Plata a eșuat',
            description: data.message || 'Te rugăm să încerci din nou.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Eroare la verificarea plății');
      }
    };

    verifyPayment();
  }, [orderIds, invoiceNumber, paymentParam, paypalToken, toast]);

  // Verifying state
  if (status === 'verifying') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">
              {paypalToken ? 'Se capturează plata PayPal...' : 'Se verifică plata...'}
            </h1>
            <p className="text-muted-foreground">
              Te rugăm să aștepți câteva secunde pentru confirmarea plății.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Pending state
  if (status === 'pending') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Plată în așteptare</CardTitle>
              <CardDescription>Comanda ta este în curs de procesare.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 space-y-2">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Așteptăm confirmarea plății. Vei primi un email când plata este confirmată.
                </p>
              </div>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.location.reload()}>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifică din nou
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard?tab=orders">Vezi Comenzile Mele</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Failed state
  if (status === 'failed' || status === 'error') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">
                {status === 'failed' ? 'Plata a eșuat' : 'Eroare la procesare'}
              </CardTitle>
              <CardDescription>
                {errorMessage || 'Nu am putut procesa plata ta.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-destructive">Ce s-a întâmplat?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Plata PayPal a fost anulată sau a expirat</li>
                  <li>• Fonduri insuficiente în cont</li>
                  <li>• Eroare temporară de comunicare</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Stocul produsului a fost restaurat</strong> și poți încerca din nou.
                </p>
              </div>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/browse')}>
                  Încearcă din nou
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard?tab=orders">Vezi Comenzile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Success state
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              {paymentMethod === 'cod' ? 'Comandă Plasată! 🎉' : 'Plată Reușită! 🎉'}
            </CardTitle>
            <CardDescription>
              {paymentMethod === 'cod' 
                ? 'Vei plăti la livrare când primești coletul.'
                : paymentMethod === 'paypal'
                ? 'Plata prin PayPal a fost confirmată cu succes.'
                : 'Comanda ta a fost procesată cu succes.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Număr comandă:</span>
                <span className="font-mono font-medium">{orderId?.slice(0, 8)}...</span>
              </div>
              {totalAmount && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-green-600">{formatPrice(totalAmount)}</span>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className="flex items-center gap-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                  <span className="text-yellow-800 dark:text-yellow-200">
                    💵 Plătești la livrare (Ramburs)
                  </span>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="flex items-center gap-2 text-sm bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <span className="text-blue-800 dark:text-blue-200">
                    💳 Plătit prin PayPal
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Vei primi un email de confirmare cu detaliile comenzii.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link to="/dashboard?tab=orders">
                  Vezi Comenzile Mele
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/browse">Continuă Cumpărăturile</Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Vânzătorul va fi notificat și va expedia produsul în curând.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;