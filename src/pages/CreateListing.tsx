import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ImagePlus, Crown, AlertCircle, Package, Loader2, Truck, Gavel, Tag, MapPin, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSellerSubscription, useCreateSellerSubscription } from '@/hooks/useSellerSubscription';
import { useListingLimit } from '@/hooks/useListingLimit';
import { useCreateListing } from '@/hooks/useListings';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useLocation, COUNTRY_CARRIERS } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { ItemCondition } from '@/types/database';
import { addDays } from 'date-fns';
import { SellerVideoTutorial, useSellerTutorial } from '@/components/seller/SellerVideoTutorial';
import { useLanguage } from '@/contexts/LanguageContext';

// Default carriers for unknown locations
const DEFAULT_CARRIERS = [
  { value: 'dhl', label: 'DHL Express' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'ems', label: 'EMS' },
  { value: 'other', label: 'Altul (specifică)' },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { data: categories } = useCategories();
  const { data: subscription, isLoading: subscriptionLoading } = useSellerSubscription();
  const { data: listingLimit, isLoading: limitLoading } = useListingLimit();
  const createSubscription = useCreateSellerSubscription();
  const createListing = useCreateListing();
  const { uploadMultipleImages, uploading } = useImageUpload();
  const { location: userLocation, carriers: locationCarriers } = useLocation();
  
  // Tutorial state
  const { shouldShow: showTutorial, setShouldShow: setShowTutorial } = useSellerTutorial();
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const isSubscribed = subscription?.subscribed || false;
  const canCreateMore = listingLimit?.canCreateMore ?? true;

  // Show tutorial when page loads for first time
  useEffect(() => {
    if (showTutorial && isSubscribed && !subscriptionLoading) {
      setTutorialOpen(true);
    }
  }, [showTutorial, isSubscribed, subscriptionLoading]);

  // Generate carriers list based on user's location
  const CARRIERS = useMemo(() => {
    if (locationCarriers && locationCarriers.length > 0) {
      return [
        ...locationCarriers.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_'), label: c })),
        { value: 'other', label: language === 'ro' ? 'Altul (specifică)' : 'Other (specify)' }
      ];
    }
    return DEFAULT_CARRIERS;
  }, [locationCarriers, language]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  // Shipping settings
  const [preferredCarrier, setPreferredCarrier] = useState('');
  const [customCarrier, setCustomCarrier] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  
  // Quantity & Variants
  const [quantity, setQuantity] = useState('1');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');

  // Auction settings
  const [listingType, setListingType] = useState<'buy_now' | 'auction' | 'both'>('buy_now');
  const [startingBid, setStartingBid] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [bidIncrement, setBidIncrement] = useState('1');
  const [auctionDuration, setAuctionDuration] = useState('7');

  // Predefined sizes and colors
  const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const COMMON_COLORS = ['Negru', 'Alb', 'Gri', 'Roșu', 'Albastru', 'Verde', 'Galben', 'Roz', 'Mov', 'Maro', 'Bej', 'Portocaliu'];

  const toggleSize = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const addCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes(prev => [...prev, customSize.trim()]);
      setCustomSize('');
    }
  };

  const addCustomColor = () => {
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors(prev => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      // Add file to files array
      setImageFiles((prev) => [...prev, file]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Te rugăm să te autentifici', description: 'Trebuie să fii autentificat pentru a crea o listare', variant: 'destructive' });
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
        description: `Ai atins limita maximă de ${listingLimit?.maxListings} produse.`, 
        variant: 'destructive' 
      });
      return;
    }

    if (!title || !price || !condition || !category) {
      toast({ title: 'Câmpuri lipsă', description: 'Te rugăm să completezi toate câmpurile obligatorii', variant: 'destructive' });
      return;
    }

    if (imageFiles.length === 0) {
      toast({ title: 'Imagine necesară', description: 'Te rugăm să adaugi cel puțin o imagine', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create listing in database
      const auctionEndDate = listingType !== 'buy_now' 
        ? addDays(new Date(), parseInt(auctionDuration)).toISOString()
        : null;
      
      const listingData = {
        seller_id: user.id,
        title,
        description,
        price: listingType === 'auction' ? parseFloat(startingBid) : parseFloat(price),
        condition: condition as ItemCondition,
        category_id: category,
        location,
        is_active: isActive,
        is_sold: false,
        listing_type: listingType,
        starting_bid: listingType !== 'buy_now' ? parseFloat(startingBid) : null,
        reserve_price: reservePrice ? parseFloat(reservePrice) : null,
        buy_now_price: listingType !== 'auction' ? parseFloat(price) : null,
        bid_increment: listingType !== 'buy_now' ? parseFloat(bidIncrement) : null,
        auction_end_date: auctionEndDate,
        quantity: parseInt(quantity) || 1,
        sizes: sizes.length > 0 ? sizes : null,
        colors: colors.length > 0 ? colors : null,
      };

      const newListing = await createListing.mutateAsync(listingData);
      
      // 2. Upload images to storage
      const imageUrls = await uploadMultipleImages(imageFiles, newListing.id);
      
      // 3. Save image URLs to listing_images table
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          listing_id: newListing.id,
          image_url: url,
          is_primary: index === 0,
          sort_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error saving image records:', imagesError);
        }
      }

      toast({ 
        title: 'Produs creat cu succes!', 
        description: isActive ? 'Produsul tău este acum live.' : 'Produsul a fost salvat ca draft.'
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({ 
        title: 'Eroare', 
        description: error.message || 'Nu s-a putut crea listarea', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Te rugăm să te autentifici pentru a vinde</h1>
          <Button onClick={() => navigate('/login')}>Autentificare</Button>
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
          <h1 className="text-2xl font-bold mb-4">Devino Vânzător</h1>
          <p className="text-muted-foreground mb-6">
            Pentru a lista produse spre vânzare, trebuie să plătești o taxă lunară de acces la platformă. 
            Este doar £1/lună (debitată automat de pe card), plus un comision de 15% când faci o vânzare.
          </p>
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => createSubscription.mutate()}
              disabled={createSubscription.isPending}
            >
              <Crown className="h-4 w-4" />
              {createSubscription.isPending ? 'Se încarcă...' : 'Activează Accesul - £1/lună'}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">Înapoi la Dashboard</Link>
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Se verifică statusul contului...</p>
        </div>
      </Layout>
    );
  }

  // Show screen when limit is reached
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
      {/* Seller Video Tutorial */}
      <SellerVideoTutorial 
        open={tutorialOpen} 
        onOpenChange={setTutorialOpen}
        onComplete={() => setShowTutorial(false)}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {language === 'ro' ? 'Vinde un Produs' : 'Sell a Product'}
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setTutorialOpen(true)}
              className="gap-1"
            >
              <BookOpen className="h-4 w-4" />
              {language === 'ro' ? 'Tutorial' : 'Tutorial'}
            </Button>
            <Badge variant="outline" className="gap-1">
              <Package className="h-3 w-3" />
              {listingLimit?.currentCount}/{listingLimit?.maxListings} {language === 'ro' ? 'produse' : 'products'}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fotografii</CardTitle>
              <CardDescription>Adaugă până la 8 fotografii ale produsului tău</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {imagePreviews.map((img, index) => (
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
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 8 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Adaugă Poză</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalii Produs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titlu *</Label>
                <Input 
                  id="title" 
                  placeholder="Ce vinzi?" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  maxLength={80} 
                />
              </div>
              <div>
                <Label htmlFor="description">Descriere</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrie produsul tău în detaliu..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Selectează categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Stare *</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as ItemCondition)}>
                    <SelectTrigger><SelectValue placeholder="Selectează starea" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nou</SelectItem>
                      <SelectItem value="like_new">Ca Nou</SelectItem>
                      <SelectItem value="good">Bună</SelectItem>
                      <SelectItem value="fair">Acceptabilă</SelectItem>
                      <SelectItem value="poor">Uzată</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">Cantitate disponibilă</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  max="99" 
                  placeholder="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground mt-1">Câte bucăți ai de vânzare (1-99)</p>
              </div>

              {/* Sizes Section */}
              <div className="space-y-3">
                <Label>Mărimi disponibile (opțional)</Label>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Mărimi încălțăminte:</p>
                  <div className="flex flex-wrap gap-2">
                    {SHOE_SIZES.map((size) => (
                      <Badge 
                        key={size} 
                        variant={sizes.includes(size) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Mărimi haine:</p>
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_SIZES.map((size) => (
                      <Badge 
                        key={size} 
                        variant={sizes.includes(size) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Adaugă altă mărime..." 
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addCustomSize}>+</Button>
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">Selectate:</span>
                    {sizes.map((s) => (
                      <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => toggleSize(s)}>
                        {s} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors Section */}
              <div className="space-y-3">
                <Label>Culori disponibile (opțional)</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_COLORS.map((color) => (
                    <Badge 
                      key={color} 
                      variant={colors.includes(color) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Adaugă altă culoare..." 
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addCustomColor}>+</Button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">Selectate:</span>
                    {colors.map((c) => (
                      <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => toggleColor(c)}>
                        {c} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Type & Auction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Tip Vânzare
              </CardTitle>
              <CardDescription>Alege cum vrei să vinzi produsul</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={listingType} 
                onValueChange={(v) => setListingType(v as 'buy_now' | 'auction' | 'both')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="buy_now" id="buy_now" />
                  <Label htmlFor="buy_now" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Preț Fix (Buy Now)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Vinde la un preț fix stabilit de tine</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="auction" id="auction" />
                  <Label htmlFor="auction" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      <span className="font-medium">Licitație</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Lasă cumpărătorii să liciteze</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Licitație + Buy Now</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Permite ambele opțiuni</p>
                  </Label>
                </div>
              </RadioGroup>

              {/* Auction-specific settings */}
              {listingType !== 'buy_now' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startingBid">Preț de Pornire *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                        <Input 
                          id="startingBid" 
                          type="number" 
                          placeholder="1.00" 
                          value={startingBid} 
                          onChange={(e) => setStartingBid(e.target.value)} 
                          className="pl-8" 
                          min="0.01" 
                          step="0.01" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bidIncrement">Pas Licitare</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                        <Input 
                          id="bidIncrement" 
                          type="number" 
                          placeholder="1.00" 
                          value={bidIncrement} 
                          onChange={(e) => setBidIncrement(e.target.value)} 
                          className="pl-8" 
                          min="0.01" 
                          step="0.01" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reservePrice">Preț de Rezervă (opțional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                        <Input 
                          id="reservePrice" 
                          type="number" 
                          placeholder="Minim acceptat" 
                          value={reservePrice} 
                          onChange={(e) => setReservePrice(e.target.value)} 
                          className="pl-8" 
                          min="0" 
                          step="0.01" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dacă licitația nu atinge acest preț, nu ești obligat să vinzi
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="auctionDuration">Durată Licitație</Label>
                      <Select value={auctionDuration} onValueChange={setAuctionDuration}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 zi</SelectItem>
                          <SelectItem value="3">3 zile</SelectItem>
                          <SelectItem value="5">5 zile</SelectItem>
                          <SelectItem value="7">7 zile</SelectItem>
                          <SelectItem value="10">10 zile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {listingType === 'auction' ? 'Locație' : 'Preț și Locație'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listingType !== 'auction' && (
                <div>
                  <Label htmlFor="price">
                    {listingType === 'both' ? 'Preț Buy Now *' : 'Preț *'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      className="pl-8" 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="location">Locație</Label>
                <Input 
                  id="location" 
                  placeholder="Oraș, Țară" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Setări Livrare
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {userLocation ? (
                  <span>Curieri disponibili în {userLocation.countryName}</span>
                ) : (
                  <span>Alege cum vei livra produsele</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="carrier">Curier Preferat</Label>
                <Select value={preferredCarrier} onValueChange={setPreferredCarrier}>
                  <SelectTrigger><SelectValue placeholder="Selectează curierul" /></SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((carrier) => (
                      <SelectItem key={carrier.value} value={carrier.value}>{carrier.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {preferredCarrier === 'other' && (
                <div>
                  <Label htmlFor="customCarrier">Specifică Curierul</Label>
                  <Input 
                    id="customCarrier" 
                    placeholder="Ex: Cargus, Fan Courier, etc." 
                    value={customCarrier} 
                    onChange={(e) => setCustomCarrier(e.target.value)} 
                  />
                </div>
              )}

              <div>
                <Label htmlFor="shippingNotes">Note pentru Livrare</Label>
                <Textarea 
                  id="shippingNotes" 
                  placeholder="Informații adiționale despre livrare (ex: timp estimat, costuri, zone disponibile)..." 
                  value={shippingNotes} 
                  onChange={(e) => setShippingNotes(e.target.value)} 
                  rows={3} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setări Publicare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publică Imediat</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Produsul va fi vizibil imediat' : 'Produsul va fi salvat ca draft'}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading || uploading}>
            {loading || uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Se încarcă imaginile...' : 'Se creează...'}
              </>
            ) : (
              isActive ? 'Publică Produsul' : 'Salvează ca Draft'
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateListing;
