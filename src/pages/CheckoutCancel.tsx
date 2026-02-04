import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState(false);

  const orderIds = searchParams.get('order_ids');
  const shouldRestore = searchParams.get('restore') === 'true';

  useEffect(() => {
    const restoreStock = async () => {
      if (!orderIds || !shouldRestore) {
        setRestored(true);
        return;
      }

      setRestoring(true);
      try {
        const orderIdArray = orderIds.split(',');
        
        // Call cancel function to restore stock
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            orderIds: orderIdArray,
            simulatePayment: true,
            paymentSuccess: false,
            failureReason: 'Plata a fost anulată de utilizator',
          },
        });

        if (error) {
          console.error('Error restoring stock:', error);
        } else if (data?.success) {
          toast({
            title: 'Stoc restaurat',
            description: 'Produsele au fost returnate în stoc.',
          });
        }
      } catch (err) {
        console.error('Restore error:', err);
      } finally {
        setRestoring(false);
        setRestored(true);
      }
    };

    restoreStock();
  }, [orderIds, shouldRestore, toast]);

  if (restoring) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Se restaurează stocul...</h1>
            <p className="text-muted-foreground">
              Te rugăm să aștepți câteva secunde.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-12 w-12 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Checkout Anulat</CardTitle>
            <CardDescription>
              Comanda ta nu a fost finalizată.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Nu ți-a fost debitat niciun ban. Produsele au fost returnate în stoc și le poți cumpăra oricând.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la Checkout
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/browse">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Continuă Cumpărăturile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckoutCancel;
