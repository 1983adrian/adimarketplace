import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Gavel, Clock, CheckCircle, XCircle, TrendingUp, 
  Search, Eye, Ban, Calendar, Users, Loader2 
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminAuctions = () => {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [auctionsEnabled, setAuctionsEnabled] = useState(true);

  // Fetch all auction listings
  const { data: auctions, isLoading } = useQuery({
    queryKey: ['admin-auctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (image_url, is_primary),
          profiles!listings_seller_id_fkey (display_name, username, avatar_url)
        `)
        .eq('listing_type', 'auction')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch bid counts for each auction
      const auctionsWithBids = await Promise.all(
        (data || []).map(async (auction) => {
          const { count } = await supabase
            .from('bids')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', auction.id);

          const { data: highestBid } = await supabase
            .from('bids')
            .select('amount')
            .eq('listing_id', auction.id)
            .order('amount', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...auction,
            bid_count: count || 0,
            highest_bid: highestBid?.amount || auction.starting_bid,
          };
        })
      );

      return auctionsWithBids;
    },
  });

  // Cancel auction mutation
  const cancelAuction = useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: false })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] });
      toast({ title: 'Licitația a fost anulată' });
      setSelectedAuction(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const now = new Date();
  const activeAuctions = auctions?.filter(a => 
    a.is_active && new Date(a.auction_end_date) > now
  ) || [];
  const endedAuctions = auctions?.filter(a => 
    new Date(a.auction_end_date) <= now
  ) || [];
  const cancelledAuctions = auctions?.filter(a => !a.is_active) || [];

  const getAuctionStatus = (auction: any) => {
    if (!auction.is_active) return 'cancelled';
    if (new Date(auction.auction_end_date) <= now) return 'ended';
    return 'active';
  };

  const filteredAuctions = auctions?.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Licitații</h1>
            <p className="text-xs text-muted-foreground">Monitorizează licitațiile</p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
            <Switch
              id="auctions-enabled"
              checked={auctionsEnabled}
              onCheckedChange={setAuctionsEnabled}
              className="scale-90"
            />
            <Label htmlFor="auctions-enabled" className="text-xs">Active Global</Label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1.5">
                <Gavel className="h-5 w-5 text-green-500" />
                <span className="text-xl font-bold">{activeAuctions.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] font-medium">Încheiate</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-xl font-bold">{endedAuctions.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] font-medium">Anulate</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1.5">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-xl font-bold">{cancelledAuctions.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] font-medium">Oferte</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold">
                  {auctions?.reduce((acc, a) => acc + a.bid_count, 0) || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Caută licitații..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="h-auto p-0.5 flex-wrap">
            <TabsTrigger value="active" className="gap-1 text-xs py-1.5">
              <Gavel className="h-3 w-3" />
              Active ({activeAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="ended" className="gap-1 text-xs py-1.5">
              <CheckCircle className="h-3 w-3" />
              Încheiate ({endedAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1 text-xs py-1.5">
              Toate ({auctions?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-3">
            <AuctionTable
              auctions={activeAuctions}
              isLoading={isLoading}
              formatPrice={formatPrice}
              onView={setSelectedAuction}
              getStatus={getAuctionStatus}
            />
          </TabsContent>

          <TabsContent value="ended" className="mt-3">
            <AuctionTable
              auctions={endedAuctions}
              isLoading={isLoading}
              formatPrice={formatPrice}
              onView={setSelectedAuction}
              getStatus={getAuctionStatus}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-3">
            <AuctionTable
              auctions={filteredAuctions}
              isLoading={isLoading}
              formatPrice={formatPrice}
              onView={setSelectedAuction}
              getStatus={getAuctionStatus}
            />
          </TabsContent>
        </Tabs>

        {/* Auction Detail Dialog */}
        <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm">Detalii Licitație</DialogTitle>
            </DialogHeader>

            {selectedAuction && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <img
                    src={selectedAuction.listing_images?.find((img: any) => img.is_primary)?.image_url || '/placeholder.svg'}
                    alt={selectedAuction.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedAuction.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      Vânzător: {selectedAuction.profiles?.display_name || 'Unknown'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Preț pornire:</span>
                        <span className="ml-2 font-medium">{formatPrice(selectedAuction.starting_bid)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Oferta curentă:</span>
                        <span className="ml-2 font-medium text-primary">{formatPrice(selectedAuction.highest_bid)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rezervă:</span>
                        <span className="ml-2 font-medium">
                          {selectedAuction.reserve_price ? formatPrice(selectedAuction.reserve_price) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nr. oferte:</span>
                        <span className="ml-2 font-medium">{selectedAuction.bid_count}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {getAuctionStatus(selectedAuction) === 'ended' ? 'Încheiată la:' : 'Se încheie la:'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedAuction.auction_end_date), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/listing/${selectedAuction.id}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Vezi Pagina
                    </Link>
                  </Button>
                  {getAuctionStatus(selectedAuction) === 'active' && (
                    <Button
                      variant="destructive"
                      onClick={() => cancelAuction.mutate(selectedAuction.id)}
                      disabled={cancelAuction.isPending}
                    >
                      {cancelAuction.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4 mr-1" />
                      )}
                      Anulează Licitația
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

// Auction Table Component
const AuctionTable: React.FC<{
  auctions: any[];
  isLoading: boolean;
  formatPrice: (price: number) => string;
  onView: (auction: any) => void;
  getStatus: (auction: any) => string;
}> = ({ auctions, isLoading, formatPrice, onView, getStatus }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nu există licitații în această categorie.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produs</TableHead>
            <TableHead>Vânzător</TableHead>
            <TableHead>Preț Curent</TableHead>
            <TableHead>Oferte</TableHead>
            <TableHead>Data Sfârșit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auctions.map((auction) => {
            const status = getStatus(auction);
            return (
              <TableRow key={auction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={auction.listing_images?.find((img: any) => img.is_primary)?.image_url || '/placeholder.svg'}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="font-medium truncate max-w-[200px]">{auction.title}</span>
                  </div>
                </TableCell>
                <TableCell>{auction.profiles?.display_name || 'Unknown'}</TableCell>
                <TableCell className="font-medium text-primary">
                  {formatPrice(auction.highest_bid)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {auction.bid_count}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(auction.auction_end_date), 'dd MMM, HH:mm')}
                </TableCell>
                <TableCell>
                  {status === 'active' && (
                    <Badge className="bg-green-500">Activă</Badge>
                  )}
                  {status === 'ended' && (
                    <Badge variant="secondary">Încheiată</Badge>
                  )}
                  {status === 'cancelled' && (
                    <Badge variant="destructive">Anulată</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(auction)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default AdminAuctions;
