import React, { useState } from 'react';
import { Package, RotateCcw, Truck, CheckCircle, XCircle, Clock, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useMyReturns, useAddReturnTracking, useUpdateReturnStatus, useSellerReturnAddress } from '@/hooks/useReturns';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const CARRIERS = [
  { value: 'fan_courier', label: 'FAN Courier' },
  { value: 'sameday', label: 'Sameday' },
  { value: 'cargus', label: 'Cargus' },
  { value: 'dpd', label: 'DPD' },
  { value: 'gls', label: 'GLS' },
  { value: 'royal_mail', label: 'Royal Mail' },
  { value: 'dhl', label: 'DHL' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'other', label: 'Altul' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'În Așteptare', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock className="h-4 w-4" /> },
  approved: { label: 'Aprobat', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Respins', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-4 w-4" /> },
  completed: { label: 'Finalizat', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="h-4 w-4" /> },
  refunded_no_return: { label: 'Rambursat (Fără Retur)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <DollarSign className="h-4 w-4" /> },
  cancelled: { label: 'Anulat', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300', icon: <XCircle className="h-4 w-4" /> },
};

interface ReturnCardProps {
  returnItem: any;
  type: 'buyer' | 'seller';
}

const ReturnCard = React.forwardRef<HTMLDivElement, ReturnCardProps>(({ returnItem, type }, ref) => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'full_refund' | 'partial_refund'>('approve');
  const [partialAmount, setPartialAmount] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { formatPrice } = useCurrency();
  const addTracking = useAddReturnTracking();
  const updateStatus = useUpdateReturnStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get seller address for buyer view
  const { data: sellerAddress } = useSellerReturnAddress(
    type === 'buyer' && returnItem.status === 'approved' ? returnItem.seller_id : undefined
  );

  const status = statusConfig[returnItem.status] || statusConfig.pending;
  const listing = returnItem.orders?.listings;
  const orderAmount = returnItem.orders?.amount || 0;
  const primaryImage = listing?.listing_images?.find((img: any) => img.is_primary)?.image_url
    || listing?.listing_images?.[0]?.image_url;

  const handleAddTracking = () => {
    if (!trackingNumber) return;
    const fullTracking = carrier ? `${carrier}:${trackingNumber}` : trackingNumber;
    addTracking.mutate(
      { returnId: returnItem.id, trackingNumber: fullTracking },
      { onSuccess: () => {
        setTrackingOpen(false);
        setTrackingNumber('');
        setCarrier('');
      }}
    );
  };

  // Handle seller action
  const handleSellerAction = async () => {
    setIsProcessing(true);
    
    try {
      switch (selectedAction) {
        case 'approve':
          // Approve with physical return required
          await updateStatus.mutateAsync({
            returnId: returnItem.id,
            status: 'approved',
            adminNotes: sellerNote || 'Returul a fost aprobat. Vă rugăm să trimiteți produsul înapoi.',
          });
          toast({
            title: 'Retur Aprobat',
            description: 'Cumpărătorul va primi instrucțiuni pentru returnarea produsului.',
          });
          break;

        case 'reject':
          // Reject return request
          await updateStatus.mutateAsync({
            returnId: returnItem.id,
            status: 'rejected',
            adminNotes: sellerNote || 'Cererea de retur a fost respinsă.',
          });
          toast({
            title: 'Retur Respins',
            description: 'Cererea de retur a fost respinsă.',
          });
          break;

        case 'full_refund':
          // Full refund WITHOUT requiring product return
          // Create refund record and update return status
          const { error: fullRefundError } = await supabase
            .from('refunds')
            .insert({
              order_id: returnItem.order_id,
              buyer_id: returnItem.buyer_id,
              seller_id: returnItem.seller_id,
              amount: orderAmount,
              reason: `Rambursare completă pentru cererea de retur: ${returnItem.reason}`,
              requested_by: returnItem.seller_id,
              status: 'completed',
              completed_at: new Date().toISOString(),
            });

          if (fullRefundError) throw fullRefundError;

          // Update return status
          await updateStatus.mutateAsync({
            returnId: returnItem.id,
            status: 'refunded_no_return' as any,
            refundAmount: orderAmount,
            adminNotes: sellerNote || 'Rambursare completă acordată. Nu este necesară returnarea produsului.',
          });

          // Update order status
          await supabase
            .from('orders')
            .update({ 
              status: 'refunded',
              refund_amount: orderAmount,
              refunded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', returnItem.order_id);

          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['refunds'] });

          toast({
            title: 'Rambursare Completă Acordată',
            description: `Suma de ${formatPrice(orderAmount)} a fost rambursată. Cumpărătorul poate păstra produsul.`,
          });
          break;

        case 'partial_refund':
          // Partial refund WITHOUT requiring product return
          const refundAmount = parseFloat(partialAmount);
          if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > orderAmount) {
            toast({
              title: 'Sumă Invalidă',
              description: 'Introduceți o sumă validă mai mică sau egală cu prețul comenzii.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            return;
          }

          const { error: partialRefundError } = await supabase
            .from('refunds')
            .insert({
              order_id: returnItem.order_id,
              buyer_id: returnItem.buyer_id,
              seller_id: returnItem.seller_id,
              amount: refundAmount,
              reason: `Rambursare parțială pentru cererea de retur: ${returnItem.reason}`,
              requested_by: returnItem.seller_id,
              status: 'completed',
              completed_at: new Date().toISOString(),
            });

          if (partialRefundError) throw partialRefundError;

          // Update return status
          await updateStatus.mutateAsync({
            returnId: returnItem.id,
            status: 'refunded_no_return' as any,
            refundAmount: refundAmount,
            adminNotes: sellerNote || `Rambursare parțială de ${formatPrice(refundAmount)} acordată. Nu este necesară returnarea produsului.`,
          });

          // Update order status
          await supabase
            .from('orders')
            .update({ 
              status: 'partially_refunded',
              refund_amount: refundAmount,
              refunded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', returnItem.order_id);

          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['refunds'] });

          toast({
            title: 'Rambursare Parțială Acordată',
            description: `Suma de ${formatPrice(refundAmount)} a fost rambursată. Cumpărătorul poate păstra produsul.`,
          });
          break;
      }

      setActionOpen(false);
      setSelectedAction('approve');
      setPartialAmount('');
      setSellerNote('');
    } catch (error: any) {
      console.error('Error processing action:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'A apărut o eroare. Vă rugăm încercați din nou.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    updateStatus.mutate(
      { returnId: returnItem.id, status: 'completed', refundAmount: returnItem.orders?.amount },
      { onSuccess: () => setActionOpen(false) }
    );
  };

  // Parse tracking info
  const parseTracking = (tracking: string | null) => {
    if (!tracking) return null;
    const parts = tracking.split(':');
    if (parts.length === 2) {
      return { carrier: parts[0], number: parts[1] };
    }
    return { carrier: null, number: tracking };
  };

  const trackingInfo = parseTracking(returnItem.tracking_number);

  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <img src={primaryImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate text-sm">{listing?.title || 'Produs'}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(returnItem.created_at), 'dd MMM yyyy')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Motiv: {returnItem.reason}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  Valoare: {formatPrice(orderAmount)}
                </p>
              </div>
              <Badge className={`${status.color} flex items-center gap-1 text-xs`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>

            {/* Refund amount if exists */}
            {returnItem.refund_amount && (
              <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs text-emerald-700 dark:text-emerald-300">
                <DollarSign className="h-3 w-3 inline mr-1" />
                Rambursat: {formatPrice(returnItem.refund_amount)}
              </div>
            )}

            {/* Tracking info if exists */}
            {trackingInfo && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span className="font-medium">AWB Retur:</span>
                </div>
                {trackingInfo.carrier && (
                  <span className="text-muted-foreground">
                    {CARRIERS.find(c => c.value === trackingInfo.carrier)?.label || trackingInfo.carrier}:{' '}
                  </span>
                )}
                <span>{trackingInfo.number}</span>
              </div>
            )}

            {/* Seller notes if exists */}
            {returnItem.admin_notes && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                <strong>Notă vânzător:</strong> {returnItem.admin_notes}
              </div>
            )}

            {/* Buyer: Show seller address when approved */}
            {type === 'buyer' && returnItem.status === 'approved' && sellerAddress && (
              <Alert className="mt-2">
                <MapPin className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Trimite produsul la:</strong><br />
                  {sellerAddress.first_name} {sellerAddress.last_name}<br />
                  {sellerAddress.address}, {sellerAddress.city} {sellerAddress.postal_code}
                  {sellerAddress.phone && <><br />Tel: {sellerAddress.phone}</>}
                </AlertDescription>
              </Alert>
            )}

            {/* Buyer: Add tracking button when approved */}
            {type === 'buyer' && returnItem.status === 'approved' && !returnItem.tracking_number && (
              <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-2 gap-1">
                    <Truck className="h-3 w-3" />
                    Adaugă AWB Retur
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adaugă AWB Retur</DialogTitle>
                    <DialogDescription>
                      Introdu numărul de urmărire al coletului returnat.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Curier</Label>
                      <Select value={carrier} onValueChange={setCarrier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează curierul" />
                        </SelectTrigger>
                        <SelectContent>
                          {CARRIERS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Număr AWB</Label>
                      <Input
                        placeholder="Numărul de urmărire"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTrackingOpen(false)}>
                      Anulează
                    </Button>
                    <Button onClick={handleAddTracking} disabled={!trackingNumber || addTracking.isPending}>
                      {addTracking.isPending ? 'Se salvează...' : 'Salvează AWB'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Seller: Action buttons for pending returns */}
            {type === 'seller' && returnItem.status === 'pending' && (
              <Dialog open={actionOpen} onOpenChange={setActionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-2 gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <CheckCircle className="h-3 w-3" />
                    Gestionează Cererea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gestionează Cererea de Retur</DialogTitle>
                    <DialogDescription>
                      Alege cum dorești să rezolvi această cerere de retur.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Product Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {primaryImage && (
                      <img src={primaryImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{listing?.title}</p>
                      <p className="text-xs text-muted-foreground">Valoare comandă: {formatPrice(orderAmount)}</p>
                      <p className="text-xs text-muted-foreground">Motiv retur: {returnItem.reason}</p>
                    </div>
                  </div>

                  {/* Action Options */}
                  <div className="space-y-4 py-2">
                    <RadioGroup value={selectedAction} onValueChange={(v) => setSelectedAction(v as any)}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="approve" id="approve" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="approve" className="font-medium cursor-pointer">
                            ✅ Aprobă Returul
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cumpărătorul trebuie să returneze produsul. După primire, vei rambursa suma.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="full_refund" id="full_refund" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="full_refund" className="font-medium cursor-pointer">
                            💰 Rambursare Completă (Fără Retur Produs)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rambursezi {formatPrice(orderAmount)} și cumpărătorul păstrează produsul.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="partial_refund" id="partial_refund" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="partial_refund" className="font-medium cursor-pointer">
                            💵 Rambursare Parțială (Fără Retur Produs)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rambursezi o parte din sumă și cumpărătorul păstrează produsul.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/30 hover:bg-destructive/5 transition-colors">
                        <RadioGroupItem value="reject" id="reject" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="reject" className="font-medium cursor-pointer text-destructive">
                            ❌ Respinge Cererea
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Refuzi cererea de retur. Cumpărătorul poate deschide o dispută.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>

                    {/* Partial refund amount input */}
                    {selectedAction === 'partial_refund' && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <Label htmlFor="partialAmount">Suma de Rambursat (RON)</Label>
                        <Input
                          id="partialAmount"
                          type="number"
                          placeholder={`Max: ${orderAmount}`}
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          max={orderAmount}
                          min={1}
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground">
                          Valoare comandă: {formatPrice(orderAmount)}
                        </p>
                      </div>
                    )}

                    {/* Seller note */}
                    <div className="space-y-2">
                      <Label htmlFor="sellerNote">Notă pentru cumpărător (opțional)</Label>
                      <Textarea
                        id="sellerNote"
                        placeholder="Adaugă un mesaj explicativ..."
                        value={sellerNote}
                        onChange={(e) => setSellerNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setActionOpen(false)} disabled={isProcessing}>
                      Anulează
                    </Button>
                    <Button 
                      onClick={handleSellerAction}
                      disabled={isProcessing || (selectedAction === 'partial_refund' && !partialAmount)}
                      className={selectedAction === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        'Confirmă'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Seller: Mark complete when tracking received */}
            {type === 'seller' && returnItem.status === 'approved' && returnItem.tracking_number && (
              <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={updateStatus.isPending}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Am Primit Produsul - Rambursează
              </Button>
            )}

            {/* Seller: Waiting for tracking */}
            {type === 'seller' && returnItem.status === 'approved' && !returnItem.tracking_number && (
              <p className="mt-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                ⏳ Așteptăm AWB-ul de retur de la cumpărător...
              </p>
            )}

            {/* Success message for refunded without return */}
            {returnItem.status === 'refunded_no_return' && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                ✅ Cererea a fost rezolvată. Rambursare acordată fără returnarea produsului.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ReturnCard.displayName = 'ReturnCard';

interface ReturnsSectionProps {
  type: 'buyer' | 'seller';
}

export const ReturnsSection: React.FC<ReturnsSectionProps> = ({ type }) => {
  const { data: returns, isLoading } = useMyReturns(type);

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Se încarcă...</p>;
  }

  if (!returns || returns.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="py-8 text-center">
          <RotateCcw className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-1">Nu ai {type === 'buyer' ? 'cereri de retur' : 'returnări primite'}</h3>
          <p className="text-sm text-muted-foreground">
            {type === 'buyer' 
              ? 'Returnările solicitate vor apărea aici.'
              : 'Cererile de retur de la cumpărători vor apărea aici.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {returns.map((returnItem: any) => (
        <ReturnCard key={returnItem.id} returnItem={returnItem} type={type} />
      ))}
    </div>
  );
};

export default ReturnsSection;