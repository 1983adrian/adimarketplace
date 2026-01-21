import React, { useState } from 'react';
import { Package, RotateCcw, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  pending: { label: 'În Așteptare', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  approved: { label: 'Aprobat', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Respins', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
  completed: { label: 'Finalizat', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Anulat', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-4 w-4" /> },
};

interface ReturnCardProps {
  returnItem: any;
  type: 'buyer' | 'seller';
}

const ReturnCard: React.FC<ReturnCardProps> = ({ returnItem, type }) => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  
  const { formatPrice } = useCurrency();
  const addTracking = useAddReturnTracking();
  const updateStatus = useUpdateReturnStatus();
  
  // Get seller address for buyer view
  const { data: sellerAddress } = useSellerReturnAddress(
    type === 'buyer' && returnItem.status === 'approved' ? returnItem.seller_id : undefined
  );

  const status = statusConfig[returnItem.status] || statusConfig.pending;
  const listing = returnItem.orders?.listings;
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

  const handleApprove = () => {
    updateStatus.mutate(
      { returnId: returnItem.id, status: 'approved' },
      { onSuccess: () => setActionOpen(false) }
    );
  };

  const handleReject = () => {
    updateStatus.mutate(
      { returnId: returnItem.id, status: 'rejected' },
      { onSuccess: () => setActionOpen(false) }
    );
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
    <Card>
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
              </div>
              <Badge className={`${status.color} flex items-center gap-1 text-xs`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>

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

            {/* Seller: Action buttons */}
            {type === 'seller' && returnItem.status === 'pending' && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="default" onClick={handleApprove} disabled={updateStatus.isPending}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aprobă
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={updateStatus.isPending}>
                  <XCircle className="h-3 w-3 mr-1" />
                  Respinge
                </Button>
              </div>
            )}

            {/* Seller: Mark complete when tracking received */}
            {type === 'seller' && returnItem.status === 'approved' && returnItem.tracking_number && (
              <Button size="sm" className="mt-2" onClick={handleComplete} disabled={updateStatus.isPending}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Marchează Finalizat (Rambursează)
              </Button>
            )}

            {/* Seller: Waiting for tracking */}
            {type === 'seller' && returnItem.status === 'approved' && !returnItem.tracking_number && (
              <p className="mt-2 text-xs text-muted-foreground">
                ⏳ Așteptăm AWB-ul de retur de la cumpărător...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
      <Card>
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
