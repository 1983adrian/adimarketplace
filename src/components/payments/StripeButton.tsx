import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface StripeButtonProps {
  listingId: string;
  className?: string;
  shippingAddress?: string;
  shippingMethod?: string;
}

export const StripeButton: React.FC<StripeButtonProps> = ({ 
  listingId, 
  className,
  shippingAddress,
  shippingMethod = 'standard'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Autentificare necesară',
        description: 'Trebuie să fii autentificat pentru a face o achiziție',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stripe-product-checkout', {
        body: { 
          listingId,
          shippingAddress,
          shippingMethod,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      toast({
        title: 'Eroare',
        description: err instanceof Error ? err.message : 'Nu am putut inițializa plata',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        className={className}
        size="lg"
        onClick={() => {
          toast({
            title: 'Autentificare necesară',
            description: 'Trebuie să fii autentificat pentru a cumpăra',
          });
          navigate('/login');
        }}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Cumpără Acum
      </Button>
    );
  }

  return (
    <Button 
      className={className}
      size="lg"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Se procesează...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Cumpără Acum
        </>
      )}
    </Button>
  );
};
