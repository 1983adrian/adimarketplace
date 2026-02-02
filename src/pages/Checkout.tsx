import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Plată Confirmată",
        description: "Stocul a fost actualizat de la 10 la 9 unități.",
      });
      clearCart();
      navigate('/');
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-2xl font-bold mb-5">Finalizare Plată</h2>
        <form onSubmit={handlePayment} className="space-y-4">
          <Input placeholder="Număr Card" required />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="MM/YY" required />
            <Input placeholder="CVV" required />
          </div>
          <Button className="w-full" disabled={processing}>
            {processing ? <Loader2 className="animate-spin" /> : "Plătește Acum"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
