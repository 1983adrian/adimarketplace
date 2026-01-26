import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Package, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderIds = searchParams.get('order_ids');

  useEffect(() => {
    const processPayment = async () => {
      // Handle new order_ids format
      if (orderIds) {
        setOrderId(orderIds.split(',')[0]); // Take first order ID for display
        setProcessing(false);
        return;
      }

      // No session ID - missing order info
      if (!orderIds) {
        setError('Missing order information');
      }
      setProcessing(false);
    };

    processPayment();
  }, [orderIds]);

  if (processing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Se procesează plata...</h1>
            <p className="text-muted-foreground">
              Te rugăm să aștepți câteva secunde.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <CardTitle>Problemă la procesare</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/dashboard?tab=orders')}>
                Vezi Comenzile
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/browse')}>
                Continuă Cumpărăturile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Plată Reușită! 🎉</CardTitle>
            <CardDescription>
              Comanda ta a fost procesată cu succes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Număr comandă:</span>
                <span className="font-mono font-medium">{orderId?.slice(0, 8)}...</span>
              </div>
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
                <Link to="/browse">
                  Continuă Cumpărăturile
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Vânzătorul va fi notificat și va expedia produsul în curând.
              Poți urmări statusul comenzii în dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
