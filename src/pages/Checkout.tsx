import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { 
  CreditCard, Lock, Truck, MapPin, ChevronLeft, 
  Check, ShieldCheck, Package, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useListing } from '@/hooks/useListings';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';

// Validation schemas
const shippingSchema = z.object({
  firstName: z.string().trim().min(1, 'Prenumele este obligatoriu').max(50, 'Prenume prea lung'),
  lastName: z.string().trim().min(1, 'Numele este obligatoriu').max(50, 'Nume prea lung'),
  address: z.string().trim().min(5, 'Adresa este obligatorie').max(200, 'Adresă prea lungă'),
  apartment: z.string().max(50, 'Text prea lung').optional(),
  city: z.string().trim().min(2, 'Orașul este obligatoriu').max(100, 'Oraș prea lung'),
  state: z.string().min(2, 'Județul este obligatoriu'),
  zipCode: z.string().min(4, 'Codul poștal este obligatoriu'),
  phone: z.string().min(10, 'Numărul de telefon este obligatoriu'),
});

const Checkout = () => {
  const { user, loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  const listingId = searchParams.get('listing');
  const { data: listing, isLoading: listingLoading } = useListing(listingId || '');

  const [step, setStep] = useState<'shipping' | 'review'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(true);

  // Shipping form state
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!listingId) {
      navigate('/browse');
    }
  }, [listingId, navigate]);

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      const displayName = (profile as any).display_name || '';
      const nameParts = displayName.split(' ');
      setShipping(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: (profile as any).phone || '',
      }));
    }
  }, [profile]);

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 15);
  };

  const validateShipping = () => {
    const result = shippingSchema.safeParse(shipping);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setShippingErrors(errors);
      return false;
    }
    setShippingErrors({});
    return true;
  };

  const handleContinueToReview = () => {
    if (validateShipping()) {
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    if (!listing || !user) return;
    
    setProcessing(true);

    try {
      // Get platform fees
      const { data: fees } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true);

      const buyerFeeConfig = fees?.find(f => f.fee_type === 'buyer_fee');
      const sellerCommissionConfig = fees?.find(f => f.fee_type === 'seller_commission');

      const buyerFee = buyerFeeConfig?.amount || 2;
      const sellerCommissionRate = sellerCommissionConfig?.amount || 15;

      const shippingCost = shippingMethod === 'express' ? 14.99 : shippingMethod === 'overnight' ? 29.99 : 5.99;
      const subtotal = listing.price;
      const sellerCommission = subtotal * (sellerCommissionRate / 100);
      const payoutAmount = subtotal - sellerCommission;
      const total = subtotal + shippingCost + buyerFee;

      const shippingAddress = `${shipping.firstName} ${shipping.lastName}, ${shipping.address}${shipping.apartment ? `, ${shipping.apartment}` : ''}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}, Tel: ${shipping.phone}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: total,
          buyer_fee: buyerFee,
          seller_commission: sellerCommission,
          payout_amount: payoutAmount,
          shipping_address: shippingAddress,
          status: 'pending',
          payout_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Save address if requested
      if (saveAddress) {
        await supabase.from('saved_addresses').insert({
          user_id: user.id,
          first_name: shipping.firstName,
          last_name: shipping.lastName,
          address: shipping.address,
          apartment: shipping.apartment,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.zipCode,
          phone: shipping.phone,
          label: 'Adresa principală',
          is_default: true,
        });
      }

      // Notify seller
      const sellerProfile = (listing as any).profiles;
      if (sellerProfile) {
        await supabase.from('notifications').insert({
          user_id: listing.seller_id,
          type: 'new_order',
          title: 'Comandă Nouă!',
          message: `Ai primit o comandă pentru "${listing.title}" în valoare de ${formatPrice(total)}`,
          data: { orderId: order.id, listingId: listing.id },
        });

        // Send email notification
        const sellerEmail = sellerProfile.user_id ? 
          (await supabase.auth.admin?.getUserById(sellerProfile.user_id))?.data?.user?.email : null;
        
        if (sellerEmail || sellerProfile.paypal_email) {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'email',
              to: sellerProfile.paypal_email || sellerEmail,
              subject: `🎉 Comandă nouă: ${listing.title}`,
              message: `
                <h1>🎉 Ai o comandă nouă!</h1>
                <p>Produsul tău "${listing.title}" a fost comandat.</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p><strong>Produs:</strong> ${listing.title}</p>
                  <p><strong>Total:</strong> ${formatPrice(total)}</p>
                  <p><strong>Adresa livrare:</strong> ${shippingAddress}</p>
                </div>
                <p>Accesează dashboard-ul pentru a procesa comanda.</p>
              `,
            },
          });
        }
      }

      // Redirect to PayPal payment
      navigate(`/listing/${listing.id}?payment=pending&order=${order.id}`);

      toast({
        title: 'Comandă creată!',
        description: 'Te redirecționăm către plată...',
      });
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu am putut procesa comanda.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const shippingCost = shippingMethod === 'express' ? 14.99 : shippingMethod === 'overnight' ? 29.99 : 5.99;
  const subtotal = listing?.price || 0;
  const buyerFee = 2; // £2 buyer fee
  const total = subtotal + shippingCost + buyerFee;

  if (authLoading || listingLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Produsul nu a fost găsit</p>
          <Button onClick={() => navigate('/browse')} className="mt-4">
            Înapoi la produse
          </Button>
        </div>
      </Layout>
    );
  }

  const listingImage = (listing as any).listing_images?.[0]?.image_url || '/placeholder.svg';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Finalizare Comandă</h1>
              <p className="text-muted-foreground">Completează detaliile pentru livrare</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {['shipping', 'review'].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-primary text-primary-foreground' : 
                    ['shipping', 'review'].indexOf(step) > i ? 'bg-green-500 text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {['shipping', 'review'].indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden sm:inline text-sm font-medium ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 'shipping' ? 'Livrare' : 'Confirmare'}
                  </span>
                </div>
                {i < 1 && <div className="w-12 h-0.5 bg-border" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Step */}
              {step === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Adresa de Livrare
                    </CardTitle>
                    <CardDescription>Unde să livrăm comanda?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prenume *</Label>
                        <Input
                          id="firstName"
                          value={shipping.firstName}
                          onChange={(e) => setShipping(s => ({ ...s, firstName: e.target.value }))}
                          className={shippingErrors.firstName ? 'border-destructive' : ''}
                        />
                        {shippingErrors.firstName && <p className="text-xs text-destructive">{shippingErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nume *</Label>
                        <Input
                          id="lastName"
                          value={shipping.lastName}
                          onChange={(e) => setShipping(s => ({ ...s, lastName: e.target.value }))}
                          className={shippingErrors.lastName ? 'border-destructive' : ''}
                        />
                        {shippingErrors.lastName && <p className="text-xs text-destructive">{shippingErrors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresa *</Label>
                      <Input
                        id="address"
                        value={shipping.address}
                        onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
                        placeholder="Strada, număr"
                        className={shippingErrors.address ? 'border-destructive' : ''}
                      />
                      {shippingErrors.address && <p className="text-xs text-destructive">{shippingErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartament, Bloc, Scară</Label>
                      <Input
                        id="apartment"
                        value={shipping.apartment}
                        onChange={(e) => setShipping(s => ({ ...s, apartment: e.target.value }))}
                        placeholder="Bloc 4, Scara B, Apt 12"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">Oraș *</Label>
                        <Input
                          id="city"
                          value={shipping.city}
                          onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                          className={shippingErrors.city ? 'border-destructive' : ''}
                        />
                        {shippingErrors.city && <p className="text-xs text-destructive">{shippingErrors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Județ *</Label>
                        <Input
                          id="state"
                          value={shipping.state}
                          onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                          placeholder="București"
                          className={shippingErrors.state ? 'border-destructive' : ''}
                        />
                        {shippingErrors.state && <p className="text-xs text-destructive">{shippingErrors.state}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Cod Poștal *</Label>
                        <Input
                          id="zipCode"
                          value={shipping.zipCode}
                          onChange={(e) => setShipping(s => ({ ...s, zipCode: e.target.value }))}
                          placeholder="010101"
                          className={shippingErrors.zipCode ? 'border-destructive' : ''}
                        />
                        {shippingErrors.zipCode && <p className="text-xs text-destructive">{shippingErrors.zipCode}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        value={shipping.phone}
                        onChange={(e) => setShipping(s => ({ ...s, phone: formatPhone(e.target.value) }))}
                        placeholder="0721234567"
                        className={shippingErrors.phone ? 'border-destructive' : ''}
                      />
                      {shippingErrors.phone && <p className="text-xs text-destructive">{shippingErrors.phone}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="saveAddress" checked={saveAddress} onCheckedChange={(c) => setSaveAddress(!!c)} />
                      <Label htmlFor="saveAddress" className="text-sm font-normal">Salvează adresa pentru comenzi viitoare</Label>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Metodă de Livrare
                      </h4>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('standard')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div>
                              <Label htmlFor="standard" className="cursor-pointer font-medium">Livrare Standard</Label>
                              <p className="text-sm text-muted-foreground">5-7 zile lucrătoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(5.99)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('express')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="express" id="express" />
                            <div>
                              <Label htmlFor="express" className="cursor-pointer font-medium">Livrare Express</Label>
                              <p className="text-sm text-muted-foreground">2-3 zile lucrătoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(14.99)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('overnight')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="overnight" id="overnight" />
                            <div>
                              <Label htmlFor="overnight" className="cursor-pointer font-medium">Livrare în 24h</Label>
                              <p className="text-sm text-muted-foreground">Ziua lucrătoare următoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(29.99)}</span>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleContinueToReview}>
                      Continuă la Confirmare
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Review Step */}
              {step === 'review' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Confirmă Comanda
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Summary */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Adresa de Livrare
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setStep('shipping')}>Modifică</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipping.firstName} {shipping.lastName}<br />
                          {shipping.address}{shipping.apartment && `, ${shipping.apartment}`}<br />
                          {shipping.city}, {shipping.state} {shipping.zipCode}<br />
                          Tel: {shipping.phone}
                        </p>
                      </div>

                      {/* Shipping Method */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4" />
                          Metodă Livrare
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {shippingMethod === 'overnight' ? 'Livrare în 24h (Ziua următoare)' :
                           shippingMethod === 'express' ? 'Livrare Express (2-3 zile)' :
                           'Livrare Standard (5-7 zile)'} - {formatPrice(shippingCost)}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4" />
                          Plată
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Plata se va face prin PayPal după confirmare
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('shipping')}>Înapoi</Button>
                    <Button className="flex-1 gap-2" size="lg" onClick={handlePlaceOrder} disabled={processing}>
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          Plasează Comanda - {formatPrice(total)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Sumar Comandă</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={listingImage} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{listing.condition?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livrare</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxă cumpărător</span>
                      <span>{formatPrice(buyerFee)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Protecție Cumpărător Garantată</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
