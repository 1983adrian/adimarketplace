import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  listingId: string;
  className?: string;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (err: Error) => void;
      }) => {
        render: (selector: string) => void;
      };
    };
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ listingId, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerId = `paypal-button-${listingId}`;

  useEffect(() => {
    let mounted = true;

    const loadPayPal = async () => {
      try {
        // Get client ID from edge function
        const { data, error: fnError } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'get-client-id' },
        });

        if (fnError || !data?.clientId) {
          throw new Error('Failed to get PayPal configuration');
        }

        // Check if script already loaded
        if (window.paypal) {
          if (mounted) {
            setScriptLoaded(true);
            setLoading(false);
          }
          return;
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=GBP`;
        script.async = true;
        
        script.onload = () => {
          if (mounted) {
            setScriptLoaded(true);
            setLoading(false);
          }
        };
        
        script.onerror = () => {
          if (mounted) {
            setError('Failed to load PayPal');
            setLoading(false);
          }
        };

        document.body.appendChild(script);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize PayPal');
          setLoading(false);
        }
      }
    };

    loadPayPal();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.paypal) return;

    const container = document.getElementById(containerId);
    if (!container || container.hasChildNodes()) return;

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: async () => {
        if (!user) {
          toast({
            title: 'Please log in',
            description: 'You need to be logged in to make a purchase',
            variant: 'destructive',
          });
          navigate('/login');
          throw new Error('Not authenticated');
        }

        const { data, error: orderError } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'create-order', listingId },
        });

        if (orderError || !data) {
          throw new Error('Failed to create order');
        }

        // Return a PayPal order ID format (in production this would be from PayPal API)
        // For now we use the listing data to create a client-side order
        return data.listingId;
      },
      onApprove: async (data: { orderID: string }) => {
        try {
          const { error: captureError } = await supabase.functions.invoke('paypal-checkout', {
            body: { 
              action: 'capture-order', 
              orderId: data.orderID,
              listingId,
            },
          });

          if (captureError) {
            throw captureError;
          }

          toast({
            title: 'Payment Successful!',
            description: 'Your order has been placed. Check your dashboard for details.',
          });

          navigate('/dashboard?tab=orders');
        } catch (err) {
          toast({
            title: 'Payment Failed',
            description: 'There was an error processing your payment. Please try again.',
            variant: 'destructive',
          });
        }
      },
      onCancel: () => {
        toast({
          title: 'Payment Cancelled',
          description: 'You cancelled the payment.',
        });
      },
      onError: (err: Error) => {
        console.error('PayPal error:', err);
        toast({
          title: 'Payment Error',
          description: 'An error occurred with PayPal. Please try again.',
          variant: 'destructive',
        });
      },
    }).render(`#${containerId}`);
  }, [scriptLoaded, listingId, user, toast, navigate, containerId]);

  if (!user) {
    return (
      <Button 
        className={className}
        onClick={() => {
          toast({
            title: 'Please log in',
            description: 'You need to be logged in to make a purchase',
          });
          navigate('/login');
        }}
      >
        Buy Now
      </Button>
    );
  }

  if (loading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="destructive" disabled className={className}>
        Payment unavailable
      </Button>
    );
  }

  return <div id={containerId} className={className} />;
};
