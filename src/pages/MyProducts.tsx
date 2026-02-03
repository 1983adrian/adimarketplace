import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, Eye, Edit, Trash2, Tag, Loader2, Boxes, Crown, QrCode } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings, useDeleteListing } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import { PromoteListingDialog } from '@/components/listings/PromoteListingDialog';
import { useListingPromotion } from '@/hooks/usePromotions';

const MyProducts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedListingForPromotion, setSelectedListingForPromotion] = useState<{id: string, title: string} | null>(null);
  
  const { data: listings, isLoading } = useMyListings(user?.id);
  const deleteListing = useDeleteListing();

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Ștergi produsul "${title}"?`)) {
      try {
        await deleteListing.mutateAsync(id);
        toast({ title: 'Produs șters cu succes' });
      } catch (error: any) {
        toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handlePromote = (id: string, title: string) => {
    setSelectedListingForPromotion({ id, title });
    setPromoteDialogOpen(true);
  };

  // Filter only active (for sale) products - not sold
  const activeListings = listings?.filter(l => !l.is_sold && l.is_active) || [];

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-violet-500" />
              Produsele Mele
            </h1>
            <p className="text-muted-foreground">Produse scoase la vânzare</p>
          </div>
          <Button asChild className="gap-2 shadow-lg">
            <Link to="/sell">
              <Plus className="h-4 w-4" />
              Adaugă
            </Link>
          </Button>
        </div>

        {activeListings.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Niciun produs la vânzare</h3>
              <p className="text-muted-foreground mb-4">
                Adaugă primul tău produs pentru a începe să vinzi
              </p>
              <Button asChild>
                <Link to="/sell">
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Produs
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeListings.map((listing) => {
              const primaryImage = listing.listing_images?.find(img => img.is_primary) || listing.listing_images?.[0];
              
              return (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-muted relative">
                        {primaryImage ? (
                          <img 
                            src={primaryImage.image_url} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 py-3 pr-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{listing.title}</h3>
                            <p className="text-lg font-bold text-primary mt-1">
                              {listing.price.toFixed(2)} {(listing as any).price_currency || 'RON'}
                            </p>
                            {/* SKU Code - Unique Product ID for Google */}
                            {(listing as any).sku && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <QrCode className="h-3 w-3" />
                                      {(listing as any).sku}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cod unic produs pentru Google</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-300 flex-shrink-0"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              Activ
                            </Badge>
                            <PromotionBadge listingId={listing.id} />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views_count} vizualizări
                          </span>
                          <span className="flex items-center gap-1">
                            <Boxes className="h-4 w-4" />
                            <span className={(listing.quantity || 1) <= 2 ? 'text-orange-600 font-medium' : ''}>
                              {listing.quantity || 1} în stoc
                            </span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            Vezi
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => navigate(`/listing/${listing.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                            Editează
                          </Button>
                          {/* Promote Button */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                            onClick={() => handlePromote(listing.id, listing.title)}
                          >
                            <Crown className="h-4 w-4" />
                            Promovează
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(listing.id, listing.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Count */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {activeListings.length} / 10 produse active
        </div>

        {/* Promote Dialog */}
        {selectedListingForPromotion && (
          <PromoteListingDialog
            open={promoteDialogOpen}
            onOpenChange={setPromoteDialogOpen}
            listingId={selectedListingForPromotion.id}
            listingTitle={selectedListingForPromotion.title}
          />
        )}
      </div>
    </Layout>
  );
};

// Sub-component to show promotion status badge
const PromotionBadge: React.FC<{ listingId: string }> = ({ listingId }) => {
  const { data: promotion, isLoading } = useListingPromotion(listingId);
  
  if (isLoading || !promotion) return null;
  
  const endsAt = new Date(promotion.ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
      <Crown className="h-3 w-3" />
      {daysLeft}d promovat
    </Badge>
  );
};

export default MyProducts;
