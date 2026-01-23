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
  Loader2
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
  { id: 'buying', title: 'Cumpărături', icon: ShoppingBag, description: 'Comenzile tale ca cumpărător', color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { id: 'selling', title: 'Vânzări', icon: Store, description: 'Comenzile primite ca vânzător', color: 'bg-gradient-to-br from-emerald-400 to-green-600' },
  { id: 'my-returns', title: 'Returnările Mele', icon: Undo2, description: 'Retururi solicitate de tine', color: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { id: 'received-returns', title: 'Returnări Primite', icon: Inbox, description: 'Cereri de retur de la cumpărători', color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
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

// Simple purchase card for buyers - shows product photo, details, seller info, and delete option
const BuyerPurchaseCard = ({ 
  order, 
  onHide 
}: { 
  order: Order; 
  onHide: (orderId: string) => void;
}) => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const primaryImage = order.listings?.listing_images?.find(img => img.is_primary)?.image_url
    || order.listings?.listing_images?.[0]?.image_url;
  
  const status = statusConfig[order.status] || statusConfig.pending;

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
          </div>

          {/* Delete/Hide Button */}
          <div className="flex flex-col justify-start">
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

// Seller order card with full functionality
const SellerOrderCard = ({ order }: { order: Order }) => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { formatPrice } = useCurrency();

  const updateTracking = useUpdateTracking();
  const cancelOrder = useCancelOrder();

  const status = statusConfig[order.status] || statusConfig.pending;
  const primaryImage = order.listings?.listing_images?.find(img => img.is_primary)?.image_url
    || order.listings?.listing_images?.[0]?.image_url;

  const handleAddTracking = () => {
    if (!trackingNumber || !carrier) return;
    updateTracking.mutate(
      { orderId: order.id, trackingNumber, carrier },
      { onSuccess: () => setTrackingOpen(false) }
    );
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) return;
    cancelOrder.mutate(
      { orderId: order.id, reason: cancelReason },
      { 
        onSuccess: () => {
          setCancelOpen(false);
          setCancelReason('');
        }
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <img src={primaryImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{order.listings?.title || 'Item'}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge className={`${status.color} flex items-center gap-1`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="font-semibold">{formatPrice(Number(order.amount))}</p>
              
              <div className="flex gap-2">
                {/* Add tracking when order is pending or paid */}
                {(order.status === 'pending' || order.status === 'paid') && !order.tracking_number && (
                  <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Truck className="h-4 w-4 mr-1" />
                        Adaugă Tracking
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adaugă Informații de Livrare</DialogTitle>
                        <DialogDescription>
                          Introdu numărul de urmărire și curierul pentru această comandă.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="carrier">Curier</Label>
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
                          <Label htmlFor="tracking">Număr de Urmărire (AWB)</Label>
                          <Input
                            id="tracking"
                            placeholder="Introdu numărul de urmărire"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTrackingOpen(false)}>
                          Anulează
                        </Button>
                        <Button 
                          onClick={handleAddTracking}
                          disabled={!trackingNumber || !carrier || updateTracking.isPending}
                        >
                          {updateTracking.isPending ? 'Se salvează...' : 'Marchează ca Expediat'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Cancel Order button for pending/paid orders */}
                {(order.status === 'pending' || order.status === 'paid') && (
                  <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Anulează Comanda
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Anulează Comanda
                        </DialogTitle>
                        <DialogDescription>
                          Ești sigur că vrei să anulezi această comandă? Cumpărătorul va fi notificat.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <p className="text-sm"><strong>Produs:</strong> {order.listings?.title}</p>
                          <p className="text-sm"><strong>Sumă:</strong> {formatPrice(Number(order.amount))}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cancel-reason">Motivul anulării *</Label>
                          <Textarea
                            id="cancel-reason"
                            placeholder="Explică de ce anulezi comanda (ex: produs indisponibil, eroare de preț...)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelOpen(false)}>
                          Înapoi
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleCancelOrder}
                          disabled={!cancelReason.trim() || cancelOrder.isPending}
                        >
                          {cancelOrder.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Se procesează...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Confirmă Anularea
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Show tracking link when shipped */}
                {order.tracking_number && order.status === 'shipped' && (
                  <Button size="sm" variant="ghost" asChild>
                    <a 
                      href={`https://www.google.com/search?q=${order.carrier}+tracking+${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Urmărește
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Payout info for seller */}
            {order.status === 'delivered' && order.payout_amount && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded text-sm text-green-800 dark:text-green-200">
                <p>💰 Încasat: £{Number(order.payout_amount).toFixed(2)}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Comision dedus: £{Number(order.seller_commission || 0).toFixed(2)}
                </p>
              </div>
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
  const [activeSection, setActiveSection] = useState('buying');
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
              <SellerOrderCard key={order.id} order={order} />
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
