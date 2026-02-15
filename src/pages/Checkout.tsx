import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { 
  CreditCard, Lock, Truck, MapPin, ChevronLeft, 
  Check, ShieldCheck, Package, Loader2, Trash2
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
import { useListing } from '@/hooks/useListings';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PaymentMethodSelector, PaymentMethod } from '@/components/checkout/PaymentMethodSelector';

// Validation schemas
const shippingSchema = z.object({
  firstName: z.string().trim().min(1, 'Prenumele este obligatoriu').max(50, 'Prenume prea lung'),
  lastName: z.string().trim().min(1, 'Numele este obligatoriu').max(50, 'Nume prea lung'),
  email: z.string().trim().email('Email invalid').max(255, 'Email prea lung'),
  address: z.string().trim().min(5, 'Adresa este obligatorie').max(200, 'Adresă prea lungă'),
  apartment: z.string().max(50, 'Text prea lung').optional(),
  city: z.string().trim().min(2, 'Orașul este obligatoriu').max(100, 'Oraș prea lung'),
  country: z.string().min(2, 'Țara este obligatorie'),
  state: z.string().min(2, 'Județul/County este obligatoriu'),
  zipCode: z.string().min(3, 'Codul poștal este obligatoriu'),
  phone: z.string().min(10, 'Numărul de telefon este obligatoriu'),
});

const Checkout = () => {
  const { user, loading: authLoading, profile } = useAuth();
  const { items, removeItem, total: cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  // Support both cart checkout and single item checkout
  const listingId = searchParams.get('listing');
  const { data: singleListing, isLoading: listingLoading } = useListing(listingId || '');

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(!!user);
  
  // Payment method - only PayPal now
  const paymentMethod: PaymentMethod = 'card';

  // Shipping form state
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    country: 'GB',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Define checkout item type
  type CheckoutItem = {
    id: string;
    title: string;
    price: number;
    image_url: string;
    seller_id: string;
    selectedSize?: string;
    selectedColor?: string;
  };

  // Get checkout items
  const checkoutItems: CheckoutItem[] = listingId && singleListing 
    ? [{ 
        id: singleListing.id, 
        title: singleListing.title, 
        price: singleListing.price, 
        image_url: (singleListing as any).listing_images?.[0]?.image_url || '/placeholder.svg', 
        seller_id: singleListing.seller_id,
      }]
    : items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image_url: item.image_url,
        seller_id: item.seller_id,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));

  // Redirect if no items in cart and no single listing
  useEffect(() => {
    if (!listingId && items.length === 0) {
      navigate('/browse');
    }
  }, [listingId, items, navigate]);

  // Pre-fill from profile if logged in
  useEffect(() => {
    if (user?.email) {
      setShipping(prev => ({ ...prev, email: user.email || '' }));
    }
    if (profile) {
      const displayName = (profile as any).display_name || '';
      const nameParts = displayName.split(' ');
      setShipping(prev => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        phone: (profile as any).phone || prev.phone,
      }));
    }
  }, [profile, user]);

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

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handleContinueToReview = () => {
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) return;
    
    setProcessing(true);

    try {
      // Build shipping address string
      const countryName = shipping.country === 'RO' ? 'România' : shipping.country === 'GB' ? 'United Kingdom' : shipping.country;
      const shippingAddress = `${shipping.firstName} ${shipping.lastName}, ${shipping.address}${shipping.apartment ? `, ${shipping.apartment}` : ''}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}, ${countryName}, Tel: ${shipping.phone}`;

      // Save address if user is logged in and requested
      if (user && saveAddress) {
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

      // Call payment processor
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { 
          items: checkoutItems.map(item => ({ listingId: item.id, price: item.price })),
          shippingAddress,
          shippingMethod,
          shippingCost,
          buyerFee,
          guestEmail: !user ? shipping.email : undefined,
          paymentMethod: 'card',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        clearCart();
        
        const orderIds = data.orders.map((o: any) => o.id).join(',');
        const invoiceNum = data.invoiceNumber;
        
        // PayPal redirect - open PayPal approval URL
        if (data.approvalUrl && data.processor === 'paypal') {
          toast({
            title: '🔄 Redirecționare PayPal...',
            description: 'Vei fi redirecționat către PayPal pentru plată.',
          });
          window.location.href = data.approvalUrl;
          return;
        }
        
        toast({
          title: '✅ Comandă plasată!',
          description: `Factura #${invoiceNum}. Total: ${formatPrice(data.total)}`,
        });
        navigate(`/checkout/success?order_ids=${orderIds}&invoice=${invoiceNum}&verify=true&payment=paypal`);
      } else {
        throw new Error(data?.error || 'Procesarea comenzii a eșuat');
      }
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu am putut procesa comanda.',
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };

  // Calculate totals
  const getShippingCost = () => {
    const baseRates: Record<string, number> = {
      standard: 15.99,
      express: 24.99,
      overnight: 39.99,
    };
    return baseRates[shippingMethod] || 15.99;
  };
  
  const shippingCost = getShippingCost();
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
  const buyerFee = 0; // No buyer fees
  const total = subtotal + shippingCost + buyerFee;

  if (listingLoading || (listingId && !singleListing)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Coșul este gol</p>
          <Button onClick={() => navigate('/browse')} className="mt-4">
            Înapoi la produse
          </Button>
        </div>
      </Layout>
    );
  }

  const steps = ['shipping', 'payment', 'review'];
  const stepLabels = ['Livrare', 'Plată', 'Confirmare'];

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
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-primary text-primary-foreground' : 
                    steps.indexOf(step) > i ? 'bg-green-500 text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {steps.indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden sm:inline text-sm font-medium ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stepLabels[i]}
                  </span>
                </div>
                {i < steps.length - 1 && <div className="w-12 h-0.5 bg-border" />}
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

                    {/* Email for guest checkout */}
                    {!user && (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shipping.email}
                          onChange={(e) => setShipping(s => ({ ...s, email: e.target.value }))}
                          placeholder="email@exemplu.ro"
                          className={shippingErrors.email ? 'border-destructive' : ''}
                        />
                        {shippingErrors.email && <p className="text-xs text-destructive">{shippingErrors.email}</p>}
                        <p className="text-xs text-muted-foreground">Vei primi confirmarea comenzii pe acest email</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresa / Address *</Label>
                      <Input
                        id="address"
                        value={shipping.address}
                        onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
                        placeholder={shipping.country === 'RO' ? 'Strada, număr' : 'Street address, house number'}
                        className={shippingErrors.address ? 'border-destructive' : ''}
                      />
                      {shippingErrors.address && <p className="text-xs text-destructive">{shippingErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">{shipping.country === 'RO' ? 'Apartament, Bloc, Scară' : 'Flat / Apartment (optional)'}</Label>
                      <Input
                        id="apartment"
                        value={shipping.apartment}
                        onChange={(e) => setShipping(s => ({ ...s, apartment: e.target.value }))}
                        placeholder={shipping.country === 'RO' ? 'Bloc 4, Scara B, Apt 12' : 'Flat 2, Building A'}
                      />
                    </div>

                    {/* Country selector */}
                    <div className="space-y-2">
                      <Label htmlFor="country">Țara / Country *</Label>
                      <select
                        id="country"
                        value={shipping.country}
                        onChange={(e) => setShipping(s => ({ ...s, country: e.target.value, state: '' }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="GB">🇬🇧 United Kingdom</option>
                        <option value="RO">🇷🇴 România</option>
                        <option value="DE">🇩🇪 Germany</option>
                        <option value="FR">🇫🇷 France</option>
                        <option value="ES">🇪🇸 Spain</option>
                        <option value="IT">🇮🇹 Italy</option>
                        <option value="NL">🇳🇱 Netherlands</option>
                        <option value="BE">🇧🇪 Belgium</option>
                        <option value="AT">🇦🇹 Austria</option>
                        <option value="IE">🇮🇪 Ireland</option>
                        <option value="PL">🇵🇱 Poland</option>
                        <option value="US">🇺🇸 United States</option>
                      </select>
                      {shippingErrors.country && <p className="text-xs text-destructive">{shippingErrors.country}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">{shipping.country === 'RO' ? 'Oraș *' : 'City / Town *'}</Label>
                        <Input
                          id="city"
                          value={shipping.city}
                          onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                          className={shippingErrors.city ? 'border-destructive' : ''}
                        />
                        {shippingErrors.city && <p className="text-xs text-destructive">{shippingErrors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{shipping.country === 'RO' ? 'Județ *' : shipping.country === 'GB' ? 'County *' : 'State / Region *'}</Label>
                        <Input
                          id="state"
                          value={shipping.state}
                          onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                          placeholder={shipping.country === 'RO' ? 'București' : shipping.country === 'GB' ? 'Greater London' : ''}
                          className={shippingErrors.state ? 'border-destructive' : ''}
                        />
                        {shippingErrors.state && <p className="text-xs text-destructive">{shippingErrors.state}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">{shipping.country === 'GB' ? 'Postcode *' : 'Cod Poștal *'}</Label>
                        <Input
                          id="zipCode"
                          value={shipping.zipCode}
                          onChange={(e) => setShipping(s => ({ ...s, zipCode: e.target.value }))}
                          placeholder={shipping.country === 'RO' ? '010101' : shipping.country === 'GB' ? 'SW1A 1AA' : ''}
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

                    {user && (
                      <div className="flex items-center gap-2">
                        <Checkbox id="saveAddress" checked={saveAddress} onCheckedChange={(c) => setSaveAddress(!!c)} />
                        <Label htmlFor="saveAddress" className="text-sm font-normal">Salvează adresa pentru comenzi viitoare</Label>
                      </div>
                    )}

                    <Button className="w-full" size="lg" onClick={handleContinueToPayment}>
                      Continuă la Plată
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Plată Securizată
                      </CardTitle>
                      <CardDescription>Plata se procesează prin PayPal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PaymentMethodSelector
                        selected={paymentMethod}
                        onSelect={() => {}}
                        productPrice={subtotal}
                      />
                    </CardContent>
                  </Card>

                  {/* Shipping Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Metodă de Livrare
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('standard')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div>
                              <Label htmlFor="standard" className="cursor-pointer font-medium">Livrare Standard</Label>
                              <p className="text-sm text-muted-foreground">5-7 zile lucrătoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(15.99)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('express')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="express" id="express" />
                            <div>
                              <Label htmlFor="express" className="cursor-pointer font-medium">Livrare Express</Label>
                              <p className="text-sm text-muted-foreground">2-3 zile lucrătoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(24.99)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('overnight')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="overnight" id="overnight" />
                            <div>
                              <Label htmlFor="overnight" className="cursor-pointer font-medium">Livrare în 24h</Label>
                              <p className="text-sm text-muted-foreground">Ziua lucrătoare următoare</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(39.99)}</span>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('shipping')}>Înapoi</Button>
                    <Button className="flex-1" size="lg" onClick={handleContinueToReview}>
                      Continuă la Confirmare
                    </Button>
                  </div>
                </div>
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

                      {/* Payment Method Summary */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Metodă Plată
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>Modifică</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Plată Securizată prin PayPal (card sau cont PayPal)
                        </p>
                      </div>

                      {/* Shipping Method */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4" />
                          Livrare
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {shippingMethod === 'overnight' ? 'Livrare în 24h (Ziua următoare)' :
                            shippingMethod === 'express' ? 'Livrare Express (2-3 zile)' :
                            'Livrare Standard (5-7 zile)'
                          } - {formatPrice(shippingCost)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Legal notice before placing order */}
                  <p className="text-xs text-muted-foreground text-center">
                    Plasând această comandă, accepți{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Termenii și Condițiile
                    </Link>
                    {' '}și{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Politica de Confidențialitate
                    </Link>
                  </p>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('payment')}>Înapoi</Button>
                    <Button className="flex-1 gap-2" size="lg" onClick={handlePlaceOrder} disabled={processing}>
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          Plătește cu PayPal - {formatPrice(total)}
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
                  {/* Products */}
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted relative">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">{item.title}</h4>
                        <p className="text-primary font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      {!listingId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

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
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Protecție Cumpărător PayPal Garantată</span>
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