import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ImagePlus, Crown, AlertCircle, Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSellerSubscription, useCreateSellerSubscription } from '@/hooks/useSellerSubscription';
import { useListingLimit } from '@/hooks/useListingLimit';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { data: subscription, isLoading: subscriptionLoading } = useSellerSubscription();
  const { data: listingLimit, isLoading: limitLoading } = useListingLimit();
  const createSubscription = useCreateSellerSubscription();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isSubscribed = subscription?.subscribed || false;
  const canCreateMore = listingLimit?.canCreateMore ?? true;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to create a listing', variant: 'destructive' });
      navigate('/login');
      return;
    }

    if (!isSubscribed) {
      toast({ title: 'Abonament necesar', description: 'Ai nevoie de un abonament activ de vânzător pentru a crea listări', variant: 'destructive' });
      return;
    }

    if (!canCreateMore) {
      toast({ 
        title: 'Limită atinsă', 
        description: `Ai atins limita maximă de ${listingLimit?.maxListings} produse. Șterge un produs existent pentru a adăuga altul nou.`, 
        variant: 'destructive' 
      });
      return;
    }

    if (!title || !price || !condition || !category) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({ title: 'Listing created!', description: 'Your item is now live.' });
    navigate('/browse');
    setLoading(false);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to sell</h1>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </Layout>
    );
  }

  // Show subscription required screen
  if (!subscriptionLoading && !isSubscribed) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <Crown className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-2xl font-bold mb-4">Become a Seller</h1>
          <p className="text-muted-foreground mb-6">
            To list items for sale, you need to pay a monthly platform access fee. 
            It's only £1/month (charged automatically from your card), plus a 15% commission when you make a sale.
          </p>
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => createSubscription.mutate()}
              disabled={createSubscription.isPending}
            >
              <Crown className="h-4 w-4" />
              {createSubscription.isPending ? 'Loading...' : 'Activate Access - £1/month'}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (subscriptionLoading || limitLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Se verifică statusul contului...</p>
        </div>
      </Layout>
    );
  }

  // Arată ecran când limita este atinsă
  if (!canCreateMore) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Limită Atinsă</h1>
          <p className="text-muted-foreground mb-6">
            Ai atins limita maximă de <span className="font-bold text-foreground">{listingLimit?.maxListings} produse</span>.
            Șterge un produs existent pentru a adăuga altul nou.
          </p>
          <Alert className="text-left mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Produse active: {listingLimit?.currentCount}/{listingLimit?.maxListings}</AlertTitle>
            <AlertDescription>
              Vânzările sunt nelimitate! Poți vinde oricâte produse, dar poți avea maxim {listingLimit?.maxListings} listări active simultan.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">Gestionează Produsele</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Vinde un Produs</h1>
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            {listingLimit?.currentCount}/{listingLimit?.maxListings} produse
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Add Photo</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="What are you selling?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your item..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                  <Input id="price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-8" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'List Item for Sale'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateListing;
