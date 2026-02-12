import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { X, ImagePlus, Loader2, Truck, ArrowLeft, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useListing, useUpdateListing, useDeleteListing } from '@/hooks/useListings';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { ItemCondition } from '@/types/database';
import { CODSettings } from '@/components/listings/CODSettings';
import { useSellerCountry, useUpdateSellerCountry } from '@/hooks/useSellerCountry';
import { ShippingCostSelector, COURIER_RATES } from '@/components/listings/ShippingCostSelector';


const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { data: listing, isLoading: listingLoading } = useListing(id || '');
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const { uploadMultipleImages, deleteImage, uploading } = useImageUpload();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [category, setCategory] = useState('');
  
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; is_primary: boolean }[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSold, setIsSold] = useState(false);
  
  // Shipping cost and carrier
  const [shippingCost, setShippingCost] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  
  // COD (Cash on Delivery / Ramburs) - Romania only
  const { data: sellerCountry } = useSellerCountry();
  const updateSellerCountry = useUpdateSellerCountry();
  const [codEnabled, setCodEnabled] = useState(false);
  const [codFeePercentage, setCodFeePercentage] = useState('2.5');
  const [codFixedFee, setCodFixedFee] = useState('5');
  const [codTransportFee, setCodTransportFee] = useState('20');
  const [sellerCountryInput, setSellerCountryInput] = useState('');

  // Load listing data
  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description || '');
      setPrice(listing.price.toString());
      setShippingCost(listing.shipping_cost?.toString() || '0');
      setSelectedCourier((listing as any).shipping_carrier || 'free');
      setCondition(listing.condition);
      setCategory(listing.category_id || '');
      
      setIsActive(listing.is_active);
      setIsSold(listing.is_sold);
      
      // Load COD settings
      setCodEnabled((listing as any).cod_enabled || false);
      setCodFeePercentage((listing as any).cod_fee_percentage?.toString() || '2.5');
      setCodFixedFee((listing as any).cod_fixed_fee?.toString() || '5');
      setCodTransportFee((listing as any).cod_transport_fee?.toString() || '20');
      setSellerCountryInput((listing as any).seller_country || '');
      
      // Load existing images
      if (listing.listing_images) {
        setExistingImages(listing.listing_images.map((img: any) => ({
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary
        })));
      }
    }
  }, [listing]);

  // Verify ownership
  useEffect(() => {
    if (listing && user && listing.seller_id !== user.id) {
      toast({ title: 'Acces interzis', description: 'Nu ai permisiunea să editezi acest produs', variant: 'destructive' });
      navigate('/dashboard');
    }
  }, [listing, user, navigate, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > 8) {
      toast({ title: 'Prea multe imagini', description: 'Poți avea maximum 8 imagini', variant: 'destructive' });
      return;
    }
    
    Array.from(files).forEach((file) => {
      setNewImageFiles((prev) => [...prev, file]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from storage
      await deleteImage(imageUrl);
      
      // Delete from database
      const { error } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({ title: 'Imagine ștearsă' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !user) return;

    if (!title || !price || !condition) {
      toast({ title: 'Câmpuri lipsă', description: 'Te rugăm să completezi toate câmpurile obligatorii', variant: 'destructive' });
      return;
    }

    // Shipping is now managed by courier selection - no manual validation needed

    setLoading(true);
    
    try {
      // 1. Update listing in database
      await updateListing.mutateAsync({
        id,
        title,
        description,
        price: parseFloat(price),
        shipping_cost: shippingCost ? parseFloat(shippingCost) : 0,
        shipping_carrier: selectedCourier || null,
        condition,
        category_id: category || null,
        is_active: isActive,
        is_sold: isSold,
        // COD (Ramburs) settings
        cod_enabled: codEnabled,
        cod_fee_percentage: codEnabled ? parseFloat(codFeePercentage) : null,
        cod_fixed_fee: codEnabled ? parseFloat(codFixedFee) : null,
        cod_transport_fee: codEnabled ? parseFloat(codTransportFee) : null,
        seller_country: sellerCountry || sellerCountryInput || null,
      } as any);
      
      // 2. Upload new images if any
      if (newImageFiles.length > 0) {
        const imageUrls = await uploadMultipleImages(newImageFiles, id);
        
        if (imageUrls.length > 0) {
          const startOrder = existingImages.length;
          const imageRecords = imageUrls.map((url, index) => ({
            listing_id: id,
            image_url: url,
            is_primary: existingImages.length === 0 && index === 0,
            sort_order: startOrder + index,
          }));

          const { error: imagesError } = await supabase
            .from('listing_images')
            .insert(imageRecords);

          if (imagesError) {
            console.error('Error saving image records:', imagesError);
          }
        }
      }

      toast({ title: 'Produs actualizat cu succes!' });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      // Delete all images from storage first
      for (const img of existingImages) {
        await deleteImage(img.url);
      }
      
      // Delete listing (will cascade delete listing_images)
      await deleteListing.mutateAsync(id);
      
      toast({ title: 'Produs șters cu succes' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Te rugăm să te autentifici</h1>
          <Button onClick={() => navigate('/login')}>Autentificare</Button>
        </div>
      </Layout>
    );
  }

  if (listingLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Se încarcă produsul...</p>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produsul nu a fost găsit</h1>
          <Button asChild>
            <Link to="/dashboard">Înapoi la Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const totalImages = existingImages.length + newImagePreviews.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Editează Produsul</h1>
          </div>
          <div className="flex items-center gap-2">
            {isSold && <Badge variant="secondary">Vândut</Badge>}
            {!isActive && <Badge variant="outline">Draft</Badge>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fotografii</CardTitle>
              <CardDescription>Gestionează fotografiile produsului ({totalImages}/8)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {/* Existing images */}
                {existingImages.map((img, index) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeExistingImage(img.id, img.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {img.is_primary && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>
                    )}
                  </div>
                ))}
                
                {/* New image previews */}
                {newImagePreviews.map((img, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeNewImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">Nou</Badge>
                  </div>
                ))}
                
                {/* Add button */}
                {totalImages < 8 && (
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
                  <Label htmlFor="category">Categorie</Label>
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
            </CardContent>
          </Card>

          {/* Price & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Preț și Livrare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Preț *</Label>
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
              
              {/* Seller Country Selection */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sellerCountry">Țara ta (pentru tarife de livrare) *</Label>
                </div>
                <Select value={sellerCountry || sellerCountryInput} onValueChange={(value) => {
                  setSellerCountryInput(value);
                  if (!sellerCountry) {
                    updateSellerCountry.mutate(value);
                  }
                  // Reset courier when country changes
                  setSelectedCourier('');
                  setShippingCost('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează țara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Romania">România</SelectItem>
                    <SelectItem value="UK">Regatul Unit</SelectItem>
                    <SelectItem value="Germany">Germania</SelectItem>
                    <SelectItem value="France">Franța</SelectItem>
                    <SelectItem value="Italy">Italia</SelectItem>
                    <SelectItem value="Spain">Spania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Cost Selector - Fixed courier rates */}
              {(sellerCountry || sellerCountryInput) && (
                <div className="pt-4">
                  <ShippingCostSelector
                    country={sellerCountry || sellerCountryInput || 'UK'}
                    selectedCourier={selectedCourier}
                    onCourierChange={(courierId, cost) => {
                      setSelectedCourier(courierId);
                      setShippingCost(cost.toString());
                    }}
                    allowFreeShipping={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* COD Settings - Romania Only */}
          <CODSettings
            enabled={codEnabled}
            onEnabledChange={setCodEnabled}
            feePercentage={codFeePercentage}
            onFeePercentageChange={setCodFeePercentage}
            fixedFee={codFixedFee}
            onFixedFeeChange={setCodFixedFee}
            transportFee={codTransportFee}
            onTransportFeeChange={setCodTransportFee}
            productPrice={parseFloat(price) || 0}
            sellerCountry={sellerCountry || sellerCountryInput}
          />

          {/* Status Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Produs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activ (Vizibil)</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Produsul este vizibil pentru cumpărători' : 'Produsul este ascuns (draft)'}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marcat ca Vândut</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSold ? 'Produsul a fost vândut' : 'Produsul este încă disponibil'}
                  </p>
                </div>
                <Switch
                  checked={isSold}
                  onCheckedChange={setIsSold}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Se încarcă imaginile...' : 'Se salvează...'}
                </>
              ) : (
                'Salvează Modificările'
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="lg">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Șterge produsul?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Această acțiune nu poate fi anulată. Produsul și toate imaginile asociate vor fi șterse permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Șterge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditListing;
