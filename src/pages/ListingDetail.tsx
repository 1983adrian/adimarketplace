import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sampleListings } from '@/data/sampleListings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PayPalButton } from '@/components/payments/PayPalButton';

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const listing = sampleListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button asChild><Link to="/browse">Browse Listings</Link></Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const handleContact = () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to message sellers', variant: 'destructive' });
      navigate('/login');
      return;
    }
    // Navigate to messages or open message modal
    toast({ title: 'Coming soon', description: 'Messaging feature is coming soon!' });
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: listing.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied!' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Listing Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3">{conditionLabels[listing.condition]}</Badge>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-4xl font-bold text-primary">{formatPrice(listing.price)}</p>
            </div>

            {listing.location && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {listing.location}
              </p>
            )}

            {/* PayPal Buy Now Button */}
            <div className="mb-4">
              <PayPalButton listingId={listing.id} className="w-full" />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" size="lg" onClick={handleContact}>
                Contact Seller
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <Separator />

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">Seller</p>
                    <p className="text-sm text-muted-foreground">Member since 2024</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#">View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure payments through PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;
