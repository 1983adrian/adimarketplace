import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { 
  CreditCard, Lock, Truck, MapPin, ChevronLeft,
  Check, ShieldCheck, Package, Loader2, Trash2, Banknote
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useListing } from '@/hooks/useListing';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Numele complet este obligatoriu'),
  email: z.string().email('Email invalid'),
  phone: z.string().min(10, 'Număr de telefon invalid'),
  address: z.string().min(5, 'Adresa este obligatorie'),
  city: z.string().min(2, 'Orașul este obligatoriu'),
  county: z.string().min(2, 'Județul este obligatoriu'),
  postalCode: z.string().min(6, 'Cod poștal invalid'),
});

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulare procesare
    setTimeout(() => {
      toast({ title: "Comandă plasată!", description: "Vei primi un email de confirmare." });
      clearCart();
      navigate('/checkout-success');
    }, 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizare Comandă</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Date Livrare</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Nume Complet" required />
              <Input placeholder="Adresă" required />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Oraș" required />
                <Input placeholder="Județ" required />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Sumar și Plată</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-bold text-xl">
                <span>Total:</span>
                <span>{total} RON</span>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Card Online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Ramburs (Cash la livrare)</Label>
                </div>
              </RadioGroup>
              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Plătește Acum"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
