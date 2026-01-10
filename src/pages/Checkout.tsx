import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { 
  CreditCard, Lock, Truck, MapPin, ChevronLeft, 
  Check, ShieldCheck, Package
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
import { sampleListings } from '@/data/sampleListings';

// Validation schemas
const shippingSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long'),
  address: z.string().trim().min(5, 'Address is required').max(200, 'Address too long'),
  apartment: z.string().max(50, 'Apartment too long').optional(),
  city: z.string().trim().min(2, 'City is required').max(100, 'City too long'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$/, 'Invalid phone number'),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$|^\d{16}$/, 'Invalid card number'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  nameOnCard: z.string().trim().min(2, 'Name is required').max(100, 'Name too long'),
});

const Checkout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const listingId = searchParams.get('listing');
  const listing = sampleListings.find(l => l.id === listingId) || sampleListings[0];

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);

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

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 6) {
      return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6, 10)}`;
    } else if (v.length >= 3) {
      return `(${v.substring(0, 3)}) ${v.substring(3)}`;
    }
    return v;
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

  const validatePayment = () => {
    const result = paymentSchema.safeParse(payment);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setPaymentErrors(errors);
      return false;
    }
    setPaymentErrors({});
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handleContinueToReview = () => {
    if (validatePayment()) {
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Order Placed Successfully!',
      description: 'You will receive a confirmation email shortly.',
    });
    
    navigate('/dashboard?tab=orders');
  };

  const shippingCost = shippingMethod === 'express' ? 14.99 : shippingMethod === 'overnight' ? 29.99 : 5.99;
  const subtotal = listing?.price || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">Complete your purchase securely</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {['shipping', 'payment', 'review'].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-primary text-primary-foreground' : 
                    ['shipping', 'payment', 'review'].indexOf(step) > i ? 'bg-success text-success-foreground' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {['shipping', 'payment', 'review'].indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden sm:inline text-sm font-medium ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </div>
                {i < 2 && <div className="w-12 h-0.5 bg-border" />}
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
                      Shipping Address
                    </CardTitle>
                    <CardDescription>Where should we deliver your order?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={shipping.firstName}
                          onChange={(e) => setShipping(s => ({ ...s, firstName: e.target.value }))}
                          className={shippingErrors.firstName ? 'border-destructive' : ''}
                        />
                        {shippingErrors.firstName && <p className="text-xs text-destructive">{shippingErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
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
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={shipping.address}
                        onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className={shippingErrors.address ? 'border-destructive' : ''}
                      />
                      {shippingErrors.address && <p className="text-xs text-destructive">{shippingErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, Suite, etc.</Label>
                      <Input
                        id="apartment"
                        value={shipping.apartment}
                        onChange={(e) => setShipping(s => ({ ...s, apartment: e.target.value }))}
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shipping.city}
                          onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                          className={shippingErrors.city ? 'border-destructive' : ''}
                        />
                        {shippingErrors.city && <p className="text-xs text-destructive">{shippingErrors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select value={shipping.state} onValueChange={(v) => setShipping(s => ({ ...s, state: v }))}>
                          <SelectTrigger className={shippingErrors.state ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                          </SelectContent>
                        </Select>
                        {shippingErrors.state && <p className="text-xs text-destructive">{shippingErrors.state}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={shipping.zipCode}
                          onChange={(e) => setShipping(s => ({ ...s, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                          placeholder="10001"
                          className={shippingErrors.zipCode ? 'border-destructive' : ''}
                        />
                        {shippingErrors.zipCode && <p className="text-xs text-destructive">{shippingErrors.zipCode}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shipping.phone}
                        onChange={(e) => setShipping(s => ({ ...s, phone: formatPhone(e.target.value) }))}
                        placeholder="(555) 123-4567"
                        className={shippingErrors.phone ? 'border-destructive' : ''}
                      />
                      {shippingErrors.phone && <p className="text-xs text-destructive">{shippingErrors.phone}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="saveAddress" checked={saveAddress} onCheckedChange={(c) => setSaveAddress(!!c)} />
                      <Label htmlFor="saveAddress" className="text-sm font-normal">Save this address for future orders</Label>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping Method
                      </h4>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('standard')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div>
                              <Label htmlFor="standard" className="cursor-pointer font-medium">Standard Shipping</Label>
                              <p className="text-sm text-muted-foreground">5-7 business days</p>
                            </div>
                          </div>
                          <span className="font-medium">$5.99</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('express')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="express" id="express" />
                            <div>
                              <Label htmlFor="express" className="cursor-pointer font-medium">Express Shipping</Label>
                              <p className="text-sm text-muted-foreground">2-3 business days</p>
                            </div>
                          </div>
                          <span className="font-medium">$14.99</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => setShippingMethod('overnight')}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="overnight" id="overnight" />
                            <div>
                              <Label htmlFor="overnight" className="cursor-pointer font-medium">Overnight Shipping</Label>
                              <p className="text-sm text-muted-foreground">Next business day</p>
                            </div>
                          </div>
                          <span className="font-medium">$29.99</span>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleContinueToPayment}>
                      Continue to Payment
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                    <CardDescription>All transactions are secure and encrypted</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                      <Lock className="h-4 w-4" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          value={payment.cardNumber}
                          onChange={(e) => setPayment(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`pl-10 ${paymentErrors.cardNumber ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {paymentErrors.cardNumber && <p className="text-xs text-destructive">{paymentErrors.cardNumber}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date *</Label>
                        <Input
                          id="expiry"
                          value={payment.expiry}
                          onChange={(e) => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={paymentErrors.expiry ? 'border-destructive' : ''}
                        />
                        {paymentErrors.expiry && <p className="text-xs text-destructive">{paymentErrors.expiry}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC *</Label>
                        <Input
                          id="cvc"
                          value={payment.cvc}
                          onChange={(e) => setPayment(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="123"
                          maxLength={4}
                          className={paymentErrors.cvc ? 'border-destructive' : ''}
                        />
                        {paymentErrors.cvc && <p className="text-xs text-destructive">{paymentErrors.cvc}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card *</Label>
                      <Input
                        id="nameOnCard"
                        value={payment.nameOnCard}
                        onChange={(e) => setPayment(p => ({ ...p, nameOnCard: e.target.value }))}
                        placeholder="John Doe"
                        className={paymentErrors.nameOnCard ? 'border-destructive' : ''}
                      />
                      {paymentErrors.nameOnCard && <p className="text-xs text-destructive">{paymentErrors.nameOnCard}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="saveCard" checked={saveCard} onCheckedChange={(c) => setSaveCard(!!c)} />
                      <Label htmlFor="saveCard" className="text-sm font-normal">Save this card for future purchases</Label>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                      <Button className="flex-1" size="lg" onClick={handleContinueToReview}>
                        Review Order
                      </Button>
                    </div>
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
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Summary */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setStep('shipping')}>Edit</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipping.firstName} {shipping.lastName}<br />
                          {shipping.address}{shipping.apartment && `, ${shipping.apartment}`}<br />
                          {shipping.city}, {shipping.state} {shipping.zipCode}<br />
                          {shipping.phone}
                        </p>
                      </div>

                      {/* Payment Summary */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>Edit</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Card ending in {payment.cardNumber.slice(-4)}<br />
                          {payment.nameOnCard}
                        </p>
                      </div>

                      {/* Shipping Method */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4" />
                          Shipping Method
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {shippingMethod === 'overnight' ? 'Overnight Shipping (Next business day)' :
                           shippingMethod === 'express' ? 'Express Shipping (2-3 business days)' :
                           'Standard Shipping (5-7 business days)'} - {formatPrice(shippingCost)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder} disabled={processing}>
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Place Order - {formatPrice(total)}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={listing?.image || '/placeholder.svg'} 
                        alt={listing?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2">{listing?.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{listing?.condition?.replace('_', ' ')}</p>
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
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <span>Buyer Protection Guarantee</span>
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
