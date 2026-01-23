import { useState, useEffect } from 'react';
import { DollarSign, Save, Info, Percent, CreditCard, Users, Crown, Megaphone, Calculator } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface FeeState {
  id: string;
  amount: string;
  description: string;
  isActive: boolean;
  isPercentage: boolean;
}

export default function AdminFees() {
  const { data: fees, isLoading, refetch } = usePlatformFees();
  const updateFee = useUpdatePlatformFee();
  const { toast } = useToast();

  const [buyerFee, setBuyerFee] = useState<FeeState>({ id: '', amount: '', description: '', isActive: true, isPercentage: false });
  const [sellerCommission, setSellerCommission] = useState<FeeState>({ id: '', amount: '', description: '', isActive: true, isPercentage: true });
  const [sellerSubscription, setSellerSubscription] = useState<FeeState>({ id: '', amount: '', description: '', isActive: true, isPercentage: false });
  const [weeklyPromotion, setWeeklyPromotion] = useState<FeeState>({ id: '', amount: '', description: '', isActive: true, isPercentage: false });
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (fees) {
      const bf = fees.find(f => f.fee_type === 'buyer_fee');
      const sc = fees.find(f => f.fee_type === 'seller_commission');
      const ss = fees.find(f => f.fee_type === 'seller_subscription');
      const wp = fees.find(f => f.fee_type === 'weekly_promotion');

      if (bf) setBuyerFee({ id: bf.id, amount: String(bf.amount), description: bf.description || '', isActive: bf.is_active, isPercentage: bf.is_percentage });
      if (sc) setSellerCommission({ id: sc.id, amount: String(sc.amount), description: sc.description || '', isActive: sc.is_active, isPercentage: sc.is_percentage });
      if (ss) setSellerSubscription({ id: ss.id, amount: String(ss.amount), description: ss.description || '', isActive: ss.is_active, isPercentage: ss.is_percentage });
      if (wp) setWeeklyPromotion({ id: wp.id, amount: String(wp.amount), description: wp.description || '', isActive: wp.is_active, isPercentage: wp.is_percentage });
    }
  }, [fees]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { id: buyerFee.id, amount: parseFloat(buyerFee.amount) || 0, description: buyerFee.description, is_active: buyerFee.isActive },
        { id: sellerCommission.id, amount: parseFloat(sellerCommission.amount) || 0, description: sellerCommission.description, is_active: sellerCommission.isActive },
        { id: sellerSubscription.id, amount: parseFloat(sellerSubscription.amount) || 0, description: sellerSubscription.description, is_active: sellerSubscription.isActive },
        { id: weeklyPromotion.id, amount: parseFloat(weeklyPromotion.amount) || 0, description: weeklyPromotion.description, is_active: weeklyPromotion.isActive },
      ].filter(u => u.id);

      for (const update of updates) {
        await updateFee.mutateAsync(update);
      }

      await refetch();
      setHasChanges(false);
      toast({ 
        title: '✅ Comisioane salvate', 
        description: 'Toate taxele au fost actualizate și se aplică pentru tranzacții noi.' 
      });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const markChanged = () => setHasChanges(true);

  const examplePrice = 100;
  const buyerTotal = examplePrice + parseFloat(buyerFee.amount || '0');
  const commissionAmount = examplePrice * (parseFloat(sellerCommission.amount || '0') / 100);
  const sellerNet = examplePrice - commissionAmount;
  const platformRevenue = parseFloat(buyerFee.amount || '0') + commissionAmount;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 w-full min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Structura Comisioane
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configurează taxele platformei. Modificările se aplică la tranzacții noi.
            </p>
          </div>
          <Button 
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            size="sm"
            className="gap-2 whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Salvează Toate</span>
            <span className="sm:hidden">Salvează</span>
          </Button>
        </div>

        {hasChanges && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30 py-2">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
              Ai modificări nesalvate.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Fees Section */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
              Toate Taxele & Comisioanele
            </CardTitle>
            <CardDescription className="text-xs">
              Configurează toate tipurile de taxe. Se aplică automat pe platformă.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-4 pt-0">
            
            {/* Buyer Fee */}
            <div className={`flex flex-col gap-3 p-3 rounded-lg border transition-colors ${buyerFee.isActive ? 'bg-card hover:bg-accent/5' : 'bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${buyerFee.isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'}`}>
                  <Users className={`h-4 w-4 ${buyerFee.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                  Taxa Cumpărător
                  <Badge variant={buyerFee.isActive ? "secondary" : "outline"} className="text-[10px] px-1">Fixă</Badge>
                </h4>
                <div className="flex items-center gap-1">
                  <Label htmlFor="buyer-fee-toggle" className="text-[10px] text-muted-foreground hidden sm:inline">
                    {buyerFee.isActive ? 'Activ' : 'Inactiv'}
                  </Label>
                  <Switch
                    id="buyer-fee-toggle"
                    checked={buyerFee.isActive}
                    onCheckedChange={(checked) => { setBuyerFee(prev => ({ ...prev, isActive: checked })); markChanged(); }}
                    className="scale-90"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Taxă adăugată la fiecare comandă pentru cumpărător</p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Sumă (£)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={buyerFee.amount}
                      onChange={(e) => { setBuyerFee(prev => ({ ...prev, amount: e.target.value })); markChanged(); }}
                      className="pl-6 text-sm font-semibold h-8"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descriere</Label>
                  <Textarea 
                    value={buyerFee.description}
                    onChange={(e) => { setBuyerFee(prev => ({ ...prev, description: e.target.value })); markChanged(); }}
                    placeholder="Descrierea taxei..."
                    rows={1}
                    className="text-xs min-h-[32px]"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Seller Commission */}
            <div className={`flex flex-col gap-3 p-3 rounded-lg border transition-colors ${sellerCommission.isActive ? 'bg-card hover:bg-accent/5' : 'bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${sellerCommission.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                  <Percent className={`h-4 w-4 ${sellerCommission.isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                  Comision Vânzător
                  <Badge variant={sellerCommission.isActive ? "secondary" : "outline"} className="text-[10px] px-1">%</Badge>
                </h4>
                <div className="flex items-center gap-1">
                  <Switch
                    id="seller-commission-toggle"
                    checked={sellerCommission.isActive}
                    onCheckedChange={(checked) => { setSellerCommission(prev => ({ ...prev, isActive: checked })); markChanged(); }}
                    className="scale-90"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Procentul reținut din fiecare vânzare</p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Procent (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={sellerCommission.amount}
                      onChange={(e) => { setSellerCommission(prev => ({ ...prev, amount: e.target.value })); markChanged(); }}
                      className="pr-6 text-sm font-semibold h-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descriere</Label>
                  <Textarea 
                    value={sellerCommission.description}
                    onChange={(e) => { setSellerCommission(prev => ({ ...prev, description: e.target.value })); markChanged(); }}
                    placeholder="Descrierea comisionului..."
                    rows={1}
                    className="text-xs min-h-[32px]"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Seller Subscription */}
            <div className={`flex flex-col gap-3 p-3 rounded-lg border transition-colors ${sellerSubscription.isActive ? 'bg-card hover:bg-accent/5' : 'bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${sellerSubscription.isActive ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'}`}>
                  <Crown className={`h-4 w-4 ${sellerSubscription.isActive ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`} />
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                  Abonament Vânzător
                  <Badge variant={sellerSubscription.isActive ? "secondary" : "outline"} className="text-[10px] px-1">Lunar</Badge>
                </h4>
                <div className="flex items-center gap-1">
                  <Switch
                    id="seller-sub-toggle"
                    checked={sellerSubscription.isActive}
                    onCheckedChange={(checked) => { setSellerSubscription(prev => ({ ...prev, isActive: checked })); markChanged(); }}
                    className="scale-90"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Taxa lunară pentru a vinde pe platformă</p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Sumă (£/lună)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={sellerSubscription.amount}
                      onChange={(e) => { setSellerSubscription(prev => ({ ...prev, amount: e.target.value })); markChanged(); }}
                      className="pl-6 text-sm font-semibold h-8"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descriere</Label>
                  <Textarea 
                    value={sellerSubscription.description}
                    onChange={(e) => { setSellerSubscription(prev => ({ ...prev, description: e.target.value })); markChanged(); }}
                    placeholder="Descrierea abonamentului..."
                    rows={1}
                    className="text-xs min-h-[32px]"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Weekly Promotion */}
            <div className={`flex flex-col gap-3 p-3 rounded-lg border transition-colors ${weeklyPromotion.isActive ? 'bg-card hover:bg-accent/5' : 'bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${weeklyPromotion.isActive ? 'bg-orange-100 dark:bg-orange-900' : 'bg-muted'}`}>
                  <Megaphone className={`h-4 w-4 ${weeklyPromotion.isActive ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`} />
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                  Promovare
                  <Badge variant={weeklyPromotion.isActive ? "secondary" : "outline"} className="text-[10px] px-1">Opțional</Badge>
                </h4>
                <div className="flex items-center gap-1">
                  <Switch
                    id="promo-toggle"
                    checked={weeklyPromotion.isActive}
                    onCheckedChange={(checked) => { setWeeklyPromotion(prev => ({ ...prev, isActive: checked })); markChanged(); }}
                    className="scale-90"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Taxa pentru promovarea unui anunț</p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Sumă (£/săpt)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={weeklyPromotion.amount}
                      onChange={(e) => { setWeeklyPromotion(prev => ({ ...prev, amount: e.target.value })); markChanged(); }}
                      className="pl-6 text-sm font-semibold h-8"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descriere</Label>
                  <Textarea 
                    value={weeklyPromotion.description}
                    onChange={(e) => { setWeeklyPromotion(prev => ({ ...prev, description: e.target.value })); markChanged(); }}
                    placeholder="Descrierea promovării..."
                    rows={1}
                    className="text-xs min-h-[32px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Calculator Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculator Taxe - Exemplu Vânzare £{examplePrice}
            </CardTitle>
            <CardDescription>
              Previzualizare în timp real a taxelor aplicate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Buyer View */}
              <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Users className="h-5 w-5" />
                  <h4 className="font-semibold">Cumpărătorul Plătește</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Preț produs</span>
                    <span>£{examplePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>+ Taxa serviciu</span>
                    <span>£{parseFloat(buyerFee.amount || '0').toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>£{buyerTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Seller View */}
              <div className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 space-y-3">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CreditCard className="h-5 w-5" />
                  <h4 className="font-semibold">Vânzătorul Primește</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Preț vânzare</span>
                    <span>£{examplePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- Comision ({sellerCommission.amount || 0}%)</span>
                    <span>-£{commissionAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg text-green-700 dark:text-green-300">
                    <span>Câștig Net</span>
                    <span>£{sellerNet.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Platform View */}
              <div className="p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Crown className="h-5 w-5" />
                  <h4 className="font-semibold">Venit Platformă</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Taxa cumpărător</span>
                    <span>£{parseFloat(buyerFee.amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comision vânzător</span>
                    <span>£{commissionAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg text-purple-700 dark:text-purple-300">
                    <span>Total/Tranzacție</span>
                    <span>£{platformRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Revenue Info */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Venituri Recurente</h4>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div className="flex justify-between">
                  <span>Abonament vânzător/lună:</span>
                  <span className="font-medium">£{parseFloat(sellerSubscription.amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Promovare/săptămână:</span>
                  <span className="font-medium">£{parseFloat(weeklyPromotion.amount || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button Footer */}
        <div className="flex justify-end sticky bottom-4">
          <Button 
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            size="lg"
            className="gap-2 shadow-lg"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Se salvează...' : 'Salvează Toate Modificările'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
