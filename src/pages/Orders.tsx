import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Star, 
  RotateCcw, 
  AlertTriangle,
  ShoppingBag,
  Store,
  Undo2,
  Inbox,
  LucideIcon,
  XCircle,
  Loader2,
  MapPin
} from 'lucide-react';
import { useMyOrders, useUpdateTracking, useConfirmDelivery, Order } from '@/hooks/useOrders';
import { useCancelOrder } from '@/hooks/useCancelOrder';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { ReturnRequestDialog } from '@/components/dashboard/ReturnRequestDialog';
import { ReturnsSection } from '@/components/dashboard/ReturnsSection';
import { OpenDisputeDialog } from '@/components/orders/OpenDisputeDialog';
import { cn } from '@/lib/utils';

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
  paid: { label: 'Plătit', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
  shipped: { label: 'Expediat', color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Livrat', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4" /> },
  refunded: { label: 'Rambursat', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-4 w-4" /> },
};

// Sidebar menu items
interface MenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 'buying', title: 'Cumpărăturile Mele', icon: ShoppingBag, description: 'Produsele cumpărate de tine', color: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  { id: 'selling', title: 'Vânzările Mele', icon: Store, description: 'Comenzi de la clienți', color: 'bg-gradient-to-br from-lime-500 to-lime-700' },
  { id: 'my-returns', title: 'Returnările Mele', icon: Undo2, description: 'Retururi solicitate de tine', color: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { id: 'received-returns', title: 'Retururi Primite', icon: Inbox, description: 'Retururi de la clienți', color: 'bg-gradient-to-br from-purple-500 to-violet-600' },
];

// Grid navigation component - 2x2 style like reference image
const OrdersNavGrid = ({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
              isActive 
                ? "bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-lg" 
                : "bg-card border-border/50 hover:border-primary/20"
            )}
          >
            {/* Always colored icon */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-2 transition-all",
              item.color,
              isActive && "ring-2 ring-offset-2 ring-primary scale-110"
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className={cn(
              "font-medium text-sm text-center",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Desktop Sidebar component with colored icons
const OrdersSidebar = ({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void;
}) => {
  return (
    <div className="space-y-2">
      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:shadow-md",
              isActive 
                ? "bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-md" 
                : "hover:bg-muted"
            )}
          >
            {/* Always colored icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0",
              item.color,
              isActive && "ring-2 ring-offset-1 ring-primary"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className={cn("font-medium text-sm", isActive ? "text-primary" : "text-foreground")}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs truncate text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Simple purchase card for buyers - shows product photo, details, seller info, cancel button
const BuyerPurchaseCard = ({ 
  order, 
  onHide,
  onCancel,
  onConfirmDelivery,
  isCancelling,
  isConfirming
}: { 
  order: Order; 
  onHide: (orderId: string) => void;
  onCancel: (orderId: string, reason: string) => void;
  onConfirmDelivery: (orderId: string) => void;
  isCancelling: boolean;
  isConfirming: boolean;
}) => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const primaryImage = order.listings?.listing_images?.find(img => img.is_primary)?.image_url
    || order.listings?.listing_images?.[0]?.image_url;
  
  const status = statusConfig[order.status] || statusConfig.pending;
  const { user } = useAuth();
  
  // Can cancel only pending or paid orders within 24h AND no tracking number
  const hoursSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
  const canCancel = ['pending', 'paid'].includes(order.status) && hoursSinceOrder <= 24 && !order.tracking_number;
  // Can review only delivered orders
  const canReview = order.status === 'delivered';
  // Can confirm delivery only for shipped orders
  const canConfirmDelivery = order.status === 'shipped';
  // Can open dispute for shipped or delivered orders (within 14 days)
  const daysSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const canOpenDispute = ['shipped', 'delivered'].includes(order.status) && daysSinceOrder <= 14 && !order.dispute_opened_at;

  const handleCancelOrder = () => {
    if (cancelReason.trim()) {
      onCancel(order.id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image - Larger */}
          <div 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-muted overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => order.listings?.id && navigate(`/listing/${order.listings.id}`)}
          >
            {primaryImage ? (
              <img src={primaryImage} alt={order.listings?.title || 'Produs'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 
                  className="font-semibold text-base sm:text-lg truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => order.listings?.id && navigate(`/listing/${order.listings.id}`)}
                >
                  {order.listings?.title || 'Produs necunoscut'}
                </h3>
                <Badge className={`${status.color} flex items-center gap-1 flex-shrink-0`}>
                  {status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </Badge>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Store className="h-4 w-4" />
                <span>De la: <span className="font-medium text-foreground">
                  {order.seller_profile?.display_name || order.seller_profile?.username || 'Vânzător'}
                </span></span>
              </div>

              {/* Price and Date */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-lg text-primary">{formatPrice(Number(order.amount))}</span>
                <span className="text-muted-foreground">
                  {format(new Date(order.created_at), 'dd MMM yyyy')}
                </span>
              </div>
            </div>

            {/* Tracking Info if shipped */}
            {order.tracking_number && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                <Truck className="h-3.5 w-3.5" />
                <span>AWB: {order.tracking_number}</span>
                <a 
                  href={`https://www.google.com/search?q=${order.carrier}+tracking+${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-auto"
                >
                  Urmărește
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {/* Cancel Button - only for pending/paid orders */}
              {canCancel && (
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Anulează Comanda
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Anulează Comanda
                      </DialogTitle>
                      <DialogDescription>
                        Ești sigur că vrei să anulezi această comandă? Vânzătorul va fi notificat.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {primaryImage && (
                        <img src={primaryImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{order.listings?.title}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(Number(order.amount))}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancelReason">Motivul anulării *</Label>
                      <Textarea
                        id="cancelReason"
                        placeholder="Te rugăm să ne spui de ce vrei să anulezi comanda..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Înapoi
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleCancelOrder}
                        disabled={!cancelReason.trim() || isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Se procesează...
                          </>
                        ) : (
                          'Confirmă Anularea'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Confirm Delivery - for shipped orders */}
              {canConfirmDelivery && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onConfirmDelivery(order.id)}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Confirmă Primirea
                </Button>
              )}

              {/* Review Button - for delivered orders */}
              {canReview && (
                <ReviewDialog
                  orderId={order.id}
                  sellerId={order.seller_id}
                  sellerName={order.seller_profile?.display_name || 'Vânzător'}
                >
                  <Button size="sm" variant="outline" className="gap-1">
                    <Star className="h-4 w-4" />
                    Lasă Recenzie
                  </Button>
                </ReviewDialog>
              )}

              {/* Return Button - for shipped/delivered orders */}
              {['shipped', 'delivered'].includes(order.status) && user && (
                <ReturnRequestDialog
                  orderId={order.id}
                  buyerId={user.id}
                  sellerId={order.seller_id}
                  productTitle={order.listings?.title || 'Produs'}
                >
                  <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                    <RotateCcw className="h-4 w-4" />
                    Solicită Retur
                  </Button>
                </ReturnRequestDialog>
              )}

              {/* Open Dispute Button - for shipped/delivered orders within 14 days */}
              {canOpenDispute && user && (
                <OpenDisputeDialog
                  orderId={order.id}
                  sellerId={order.seller_id}
                  buyerId={user.id}
                >
                  <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                    <AlertTriangle className="h-4 w-4" />
                    Deschide Dispută
                  </Button>
                </OpenDisputeDialog>
              )}

              {/* Show dispute badge if already opened */}
              {order.dispute_opened_at && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Dispută deschisă
                </Badge>
              )}
            </div>
          </div>

          {/* Delete/Hide Button */}
          <div className="flex flex-col justify-start">
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Ascunde din listă"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Șterge din istoric?</DialogTitle>
                  <DialogDescription>
                    Această comandă va fi ascunsă din lista ta de cumpărături. Poți vedea întotdeauna detaliile în setări.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {primaryImage && (
                    <img src={primaryImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{order.listings?.title}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(Number(order.amount))}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Anulează
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      onHide(order.id);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    Șterge din listă
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple sold product card - just displays what was sold (no management buttons)
const SoldProductCard = ({ order }: { order: Order }) => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const updateTracking = useUpdateTracking();
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const status = statusConfig[order.status] || statusConfig.pending;
  const primaryImage = order.listings?.listing_images?.find(img => img.is_primary)?.image_url
    || order.listings?.listing_images?.[0]?.image_url;

  const canAddTracking = ['pending', 'paid'].includes(order.status) && !order.tracking_number;

  const handleAddTracking = () => {
    if (!trackingNumber || !carrier) return;
    updateTracking.mutate(
      { orderId: order.id, trackingNumber, carrier },
      { onSuccess: () => {
        setShowTrackingDialog(false);
        setTrackingNumber('');
        setCarrier('');
      }}
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-muted overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => order.listings?.id && navigate(`/listing/${order.listings.id}`)}
          >
            {primaryImage ? (
              <img src={primaryImage} alt={order.listings?.title || 'Produs'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 
                  className="font-semibold text-base sm:text-lg truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => order.listings?.id && navigate(`/listing/${order.listings.id}`)}
                >
                  {order.listings?.title || 'Produs necunoscut'}
                </h3>
                <Badge className={`${status.color} flex items-center gap-1 flex-shrink-0`}>
                  {status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </Badge>
              </div>

              {/* Buyer Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Cumpărat de: <span className="font-medium text-foreground">
                  {order.buyer_profile?.display_name || order.buyer_profile?.username || 'Cumpărător'}
                </span></span>
              </div>

              {/* Price and Date */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-lg text-green-600">{formatPrice(Number(order.amount))}</span>
                <span className="text-muted-foreground">
                  {format(new Date(order.created_at), 'dd MMM yyyy')}
                </span>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Adresa: {order.shipping_address}
                </div>
              )}
            </div>

            {/* Payout info */}
            {order.status === 'delivered' && order.payout_amount && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  💰 Încasat: {formatPrice(Number(order.payout_amount))}
                </p>
              </div>
            )}

            {/* Tracking Info if shipped */}
            {order.tracking_number && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                <Truck className="h-3.5 w-3.5" />
                <span>AWB: {order.tracking_number}</span>
                {order.carrier && (
                  <span className="text-primary font-medium">
                    ({CARRIERS.find(c => c.value === order.carrier)?.label || order.carrier})
                  </span>
                )}
              </div>
            )}

            {/* Add Tracking Button */}
            {canAddTracking && (
              <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-3 gap-1">
                    <Truck className="h-4 w-4" />
                    Adaugă AWB & Expediază
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adaugă Număr de Urmărire</DialogTitle>
                    <DialogDescription>
                      Introdu AWB-ul coletului pentru a marca comanda ca expediată. Clientul va fi notificat automat.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Product preview */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {primaryImage && (
                      <img src={primaryImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{order.listings?.title}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(Number(order.amount))}</p>
                    </div>
                  </div>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Curier *</Label>
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
                      <Label>Număr AWB *</Label>
                      <Input
                        placeholder="Introdu numărul de urmărire"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>
                      Anulează
                    </Button>
                    <Button 
                      onClick={handleAddTracking} 
                      disabled={!trackingNumber || !carrier || updateTracking.isPending}
                    >
                      {updateTracking.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Se trimite...
                        </>
                      ) : (
                        'Confirmă Expedierea'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cancelOrder = useCancelOrder();
  
  // Read section from URL query params (e.g., /orders?section=selling)
  const searchParams = new URLSearchParams(location.search);
  const sectionFromUrl = searchParams.get('section');
  
  const [activeSection, setActiveSection] = useState(() => {
    // Valid sections
    const validSections = ['buying', 'selling', 'my-returns', 'received-returns'];
    if (sectionFromUrl && validSections.includes(sectionFromUrl)) {
      return sectionFromUrl;
    }
    return 'buying';
  });
  
  // Update section when URL changes
  React.useEffect(() => {
    const validSections = ['buying', 'selling', 'my-returns', 'received-returns'];
    if (sectionFromUrl && validSections.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);
  
  const [hiddenOrders, setHiddenOrders] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenBuyingOrders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { data: buyingOrders, isLoading: buyingLoading } = useMyOrders('buying');
  const { data: sellingOrders, isLoading: sellingLoading } = useMyOrders('selling');

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleHideOrder = (orderId: string) => {
    const newHidden = [...hiddenOrders, orderId];
    setHiddenOrders(newHidden);
    localStorage.setItem('hiddenBuyingOrders', JSON.stringify(newHidden));
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    cancelOrder.mutate({ orderId, reason });
  };

  const confirmDelivery = useConfirmDelivery();
  const handleConfirmDelivery = (orderId: string) => {
    confirmDelivery.mutate(orderId);
  };

  // Filter out hidden orders
  const visibleBuyingOrders = buyingOrders?.filter(order => !hiddenOrders.includes(order.id));

  if (loading || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'buying':
        return buyingLoading ? (
          <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
        ) : !visibleBuyingOrders || visibleBuyingOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Nu ai cumpărături încă</h3>
              <p className="text-muted-foreground mb-4">Începe să cauți produse grozave</p>
              <Button onClick={() => navigate('/browse')}>Caută Produse</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleBuyingOrders.map((order) => (
              <BuyerPurchaseCard 
                key={order.id} 
                order={order} 
                onHide={handleHideOrder}
                onCancel={handleCancelOrder}
                onConfirmDelivery={handleConfirmDelivery}
                isCancelling={cancelOrder.isPending}
                isConfirming={confirmDelivery.isPending}
              />
            ))}
          </div>
        );

      case 'selling':
        return sellingLoading ? (
          <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
        ) : sellingOrders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Nu ai vânzări încă</h3>
              <p className="text-muted-foreground mb-4">Creează anunțuri pentru a începe să vinzi</p>
              <Button onClick={() => navigate('/sell')}>Creează Anunț</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sellingOrders?.map((order) => (
              <SoldProductCard key={order.id} order={order} />
            ))}
          </div>
        );

      case 'my-returns':
        return <ReturnsSection type="buyer" />;

      case 'received-returns':
        return <ReturnsSection type="seller" />;

      default:
        return null;
    }
  };

  const currentMenuItem = menuItems.find(item => item.id === activeSection);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Comenzile Mele</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">NAVIGARE</h2>
              <OrdersSidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
              />
            </div>
          </aside>

          {/* Mobile Navigation - 2x2 Grid like reference image */}
          <div className="lg:hidden">
            <OrdersNavGrid 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {currentMenuItem && <currentMenuItem.icon className="h-5 w-5 text-primary" />}
                {currentMenuItem?.title}
              </h2>
              {currentMenuItem?.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentMenuItem.description}</p>
              )}
            </div>

            {renderContent()}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
