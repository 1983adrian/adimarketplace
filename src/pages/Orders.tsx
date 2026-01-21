import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, Star, RotateCcw, AlertTriangle } from 'lucide-react';
import { useMyOrders, useUpdateTracking, useConfirmDelivery, Order } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { ReturnRequestDialog } from '@/components/dashboard/ReturnRequestDialog';

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

const OrderCard = ({ order, type }: { order: Order; type: 'buying' | 'selling' }) => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { formatPrice } = useCurrency();

  const updateTracking = useUpdateTracking();
  const confirmDelivery = useConfirmDelivery();

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

  const handleConfirmDelivery = () => {
    confirmDelivery.mutate(order.id, {
      onSuccess: () => setConfirmOpen(false),
    });
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
                {/* Seller: Add tracking when order is pending or paid */}
                {type === 'selling' && (order.status === 'pending' || order.status === 'paid') && !order.tracking_number && (
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

                {/* Buyer: Confirm delivery when shipped */}
                {type === 'buying' && order.status === 'shipped' && (
                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmă Primirea
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmă Livrarea</DialogTitle>
                        <DialogDescription>
                          Prin confirmare, recunoști că ai primit produsul.
                          Vânzătorul va fi plătit după deducerea comisioanelor.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <p className="text-sm"><strong>Produs:</strong> {order.listings?.title}</p>
                          <p className="text-sm"><strong>Curier:</strong> {CARRIERS.find(c => c.value === order.carrier)?.label || order.carrier}</p>
                          <p className="text-sm"><strong>AWB:</strong> {order.tracking_number}</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                          Anulează
                        </Button>
                        <Button 
                          onClick={handleConfirmDelivery}
                          disabled={confirmDelivery.isPending}
                        >
                          {confirmDelivery.isPending ? 'Se procesează...' : 'Confirmă Primirea'}
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
            {type === 'selling' && order.status === 'delivered' && order.payout_amount && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                <p>💰 Încasat: £{Number(order.payout_amount).toFixed(2)}</p>
                <p className="text-xs text-green-600">
                  Comision dedus: £{Number(order.seller_commission || 0).toFixed(2)}
                </p>
              </div>
            )}

            {/* Review button for buyer after delivery */}
            {type === 'buying' && order.status === 'delivered' && (
              <div className="mt-3 flex gap-2">
                <ReviewDialog 
                  orderId={order.id} 
                  sellerId={order.seller_id}
                  sellerName={order.seller_profile?.display_name || order.seller_profile?.username}
                >
                  <Button size="sm" variant="outline" className="gap-2">
                    <Star className="h-4 w-4" />
                    Lasă o recenzie
                  </Button>
                </ReviewDialog>
                <ReturnRequestDialog
                  orderId={order.id}
                  buyerId={order.buyer_id}
                  sellerId={order.seller_id}
                  productTitle={order.listings?.title || 'Produs'}
                >
                  <Button size="sm" variant="ghost" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Solicită Retur
                  </Button>
                </ReturnRequestDialog>
              </div>
            )}

            {/* Dispute button for problematic orders */}
            {type === 'buying' && (order.status === 'shipped' || order.status === 'delivered') && (
              <div className="mt-2">
                <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  Raportează o problemă
                </Button>
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
  const { data: buyingOrders, isLoading: buyingLoading } = useMyOrders('buying');
  const { data: sellingOrders, isLoading: sellingLoading } = useMyOrders('selling');

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Comenzile Mele</h1>

        <Tabs defaultValue="buying">
          <TabsList className="mb-6">
            <TabsTrigger value="buying">Cumpărături</TabsTrigger>
            <TabsTrigger value="selling">Vânzări</TabsTrigger>
          </TabsList>

          <TabsContent value="buying">
            {buyingLoading ? (
              <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
            ) : buyingOrders?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nu ai cumpărături încă</h3>
                  <p className="text-muted-foreground mb-4">Începe să cauți produse grozave</p>
                  <Button onClick={() => navigate('/browse')}>Caută Produse</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyingOrders?.map((order) => (
                  <OrderCard key={order.id} order={order} type="buying" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="selling">
            {sellingLoading ? (
              <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
            ) : sellingOrders?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nu ai vânzări încă</h3>
                  <p className="text-muted-foreground mb-4">Creează anunțuri pentru a începe să vinzi</p>
                  <Button onClick={() => navigate('/sell')}>Creează Anunț</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellingOrders?.map((order) => (
                  <OrderCard key={order.id} order={order} type="selling" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Orders;
