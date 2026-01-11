import { useState, useEffect } from 'react';
import { DollarSign, Save, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePlatformFees, useUpdatePlatformFee } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminFees() {
  const { data: fees, isLoading } = usePlatformFees();
  const updateFee = useUpdatePlatformFee();
  const { toast } = useToast();

  const [buyerFee, setBuyerFee] = useState({ amount: '', description: '' });
  const [sellerCommission, setSellerCommission] = useState({ amount: '', description: '' });
  const [sellerSubscription, setSellerSubscription] = useState({ amount: '', description: '' });

  useEffect(() => {
    if (fees) {
      const bf = fees.find(f => f.fee_type === 'buyer_fee');
      const sc = fees.find(f => f.fee_type === 'seller_commission');
      const ss = fees.find(f => f.fee_type === 'seller_subscription');

      if (bf) setBuyerFee({ amount: String(bf.amount), description: bf.description || '' });
      if (sc) setSellerCommission({ amount: String(sc.amount), description: sc.description || '' });
      if (ss) setSellerSubscription({ amount: String(ss.amount), description: ss.description || '' });
    }
  }, [fees]);

  const handleSave = async (feeType: string, amount: string, description: string) => {
    const fee = fees?.find(f => f.fee_type === feeType);
    if (!fee) return;

    try {
      await updateFee.mutateAsync({ 
        id: fee.id, 
        amount: parseFloat(amount), 
        description 
      });
      toast({ title: 'Fee updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fees & Pricing</h1>
          <p className="text-muted-foreground">Configure platform fees and commission rates</p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Changes to fees will apply to all new transactions. Existing orders will not be affected.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Buyer Fee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Buyer Service Fee
              </CardTitle>
              <CardDescription>
                Flat fee charged to buyers per transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (£)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={buyerFee.amount}
                    onChange={(e) => setBuyerFee(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={buyerFee.description}
                  onChange={(e) => setBuyerFee(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Fee description..."
                  rows={2}
                />
              </div>
              <Button 
                onClick={() => handleSave('buyer_fee', buyerFee.amount, buyerFee.description)}
                disabled={updateFee.isPending}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Seller Commission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Seller Commission
              </CardTitle>
              <CardDescription>
                Percentage commission on each sale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Percentage (%)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={sellerCommission.amount}
                    onChange={(e) => setSellerCommission(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={sellerCommission.description}
                  onChange={(e) => setSellerCommission(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Fee description..."
                  rows={2}
                />
              </div>
              <Button 
                onClick={() => handleSave('seller_commission', sellerCommission.amount, sellerCommission.description)}
                disabled={updateFee.isPending}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Seller Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Seller Subscription
              </CardTitle>
              <CardDescription>
                Monthly subscription fee for sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (£/month)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellerSubscription.amount}
                    onChange={(e) => setSellerSubscription(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={sellerSubscription.description}
                  onChange={(e) => setSellerSubscription(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Fee description..."
                  rows={2}
                />
              </div>
              <Button 
                onClick={() => handleSave('seller_subscription', sellerSubscription.amount, sellerSubscription.description)}
                disabled={updateFee.isPending}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fee Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Calculation Example</CardTitle>
            <CardDescription>How fees are applied to a £100 sale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium">Buyer Pays</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Item Price</span>
                    <span>£100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>£{parseFloat(buyerFee.amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Total</span>
                    <span>£{(100 + parseFloat(buyerFee.amount || '0')).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium">Seller Receives</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Sale Price</span>
                    <span>£100.00</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Commission ({sellerCommission.amount || 0}%)</span>
                    <span>-£{(100 * parseFloat(sellerCommission.amount || '0') / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Net Earnings</span>
                    <span>£{(100 - (100 * parseFloat(sellerCommission.amount || '0') / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
