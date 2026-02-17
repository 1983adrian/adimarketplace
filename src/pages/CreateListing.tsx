import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ImagePlus, Crown, AlertCircle, Package, Loader2, Truck, Gavel, Tag, Ban, Leaf, Bomb, Store, Sparkles } from 'lucide-react';
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
import { useActiveSellerPlan } from '@/hooks/useUserSubscription';
import { useListingLimit } from '@/hooks/useListingLimit';
import { useCreateListing } from '@/hooks/useListings';
import { useSellerTrial, useStartSellerTrial } from '@/hooks/useSellerTrial';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { ItemCondition } from '@/types/database';
import { addDays } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

import { useSellerCountry, useUpdateSellerCountry } from '@/hooks/useSellerCountry';
import { ShippingCostSelector } from '@/components/listings/ShippingCostSelector';

import { useRequireKYC } from '@/hooks/useKYCEnforcement';
import { usePlatformSettings } from '@/hooks/useAdminSettings';


const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: categories } = useCategories();
  const { data: activePlan, isLoading: planLoading } = useActiveSellerPlan();
  const { data: listingLimit, isLoading: limitLoading } = useListingLimit();
  const createListing = useCreateListing();
  const { uploadMultipleImages, uploading, enhanceImage, enhancing } = useImageUpload();
  const { location: userLocation } = useLocation();
  const { canSell, kycStatus, message: kycMessage, isLoading: kycLoading } = useRequireKYC();
  const { data: platformSettings } = usePlatformSettings();
  
  const { data: trialStatus, isLoading: trialLoading } = useSellerTrial();
  const startTrial = useStartSellerTrial();
  
  // Read marketplace limits from admin settings (fallback to defaults)
  const marketplaceSettings = platformSettings?.marketplace as any;
  const MAX_IMAGES = marketplaceSettings?.maxImagesPerListing ?? 3;
  const MAX_LISTING_PRICE = marketplaceSettings?.maxListingPrice ?? 100000;
  
  const hasActivePlan = !!activePlan || trialStatus?.isInTrial;
  const canCreateMore = listingLimit?.canCreateMore ?? false;
  const isBlocked = trialStatus?.isListingBlocked ?? false;


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [category, setCategory] = useState('');
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  
  // Submit guard - prevent double clicks and rapid submissions
  const isSubmittingRef = useRef(false);
  
  // Shipping cost (required with price) - now using courier selection
  const [shippingCost, setShippingCost] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  
  // Seller country
  const { data: sellerCountry } = useSellerCountry();
  const updateSellerCountry = useUpdateSellerCountry();
  const [sellerCountryInput, setSellerCountryInput] = useState('');
  
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

  
  // Seller currency selection - default to RON for Romanian sellers
  const [priceCurrency, setPriceCurrency] = useState<'RON' | 'GBP' | 'EUR' | 'USD'>('RON');

  // ========== DRAFT AUTO-SAVE ==========
  const DRAFT_KEY = 'marketplace_listing_draft';

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.price) setPrice(draft.price);
      if (draft.condition) setCondition(draft.condition);
      if (draft.category) setCategory(draft.category);
      if (draft.shippingCost) setShippingCost(draft.shippingCost);
      if (draft.selectedCourier) setSelectedCourier(draft.selectedCourier);
      if (draft.quantity) setQuantity(draft.quantity);
      if (draft.sizes) setSizes(draft.sizes);
      if (draft.colors) setColors(draft.colors);
      if (draft.listingType) setListingType(draft.listingType);
      if (draft.startingBid) setStartingBid(draft.startingBid);
      if (draft.reservePrice) setReservePrice(draft.reservePrice);
      if (draft.bidIncrement) setBidIncrement(draft.bidIncrement);
      if (draft.auctionDuration) setAuctionDuration(draft.auctionDuration);
      if (draft.priceCurrency) setPriceCurrency(draft.priceCurrency);
      if (draft.imagePreviews?.length) {
        setImagePreviews(draft.imagePreviews);
      }
      setHasDraft(true);
      toast({ title: '📝 Ciornă restaurată', description: 'Am restaurat produsul la care lucrai.' });
    } catch {
      // Invalid draft, ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft every 3 seconds when form has content
  const saveDraft = useCallback(() => {
    if (!title && !description && !price && imagePreviews.length === 0) {
      return; // Nothing to save
    }
    try {
      const draft = {
        title, description, price, condition, category,
        shippingCost, selectedCourier, quantity,
        sizes, colors, listingType, startingBid,
        reservePrice, bidIncrement, auctionDuration,
        priceCurrency,
        imagePreviews: imagePreviews.slice(0, 3), // Save base64 previews (max 3)
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // localStorage full or unavailable
    }
  }, [title, description, price, condition, category, shippingCost, selectedCourier, quantity, sizes, colors, listingType, startingBid, reservePrice, bidIncrement, auctionDuration, priceCurrency, imagePreviews]);

  useEffect(() => {
    const timer = setInterval(saveDraft, 3000);
    return () => clearInterval(timer);
  }, [saveDraft]);

  // Clear draft after successful submission
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }, []);

  const handleClearDraft = () => {
    clearDraft();
    setTitle(''); setDescription(''); setPrice('');
    setCondition('good'); setCategory('');
    setImageFiles([]); setImagePreviews([]);
    setShippingCost(''); setSelectedCourier('');
    setQuantity('1'); setSizes([]); setColors([]);
    setListingType('buy_now'); setStartingBid('');
    setReservePrice(''); setBidIncrement('1');
    setAuctionDuration('7'); setPriceCurrency('RON');
    toast({ title: '🗑️ Ciornă ștearsă', description: 'Formularul a fost resetat.' });
  };
  // ========== END DRAFT AUTO-SAVE ==========

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
    
    // Maximum images from admin settings
    const remainingSlots = MAX_IMAGES - imageFiles.length;
    
    if (remainingSlots <= 0) {
      toast({ 
        title: t('createListing.limitReached'), 
        description: `Poți adăuga maxim ${MAX_IMAGES} imagini per produs.`, 
        variant: 'destructive' 
      });
      return;
    }
    
    // Only take files up to the remaining slots
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    filesToAdd.forEach((file) => {
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
    
    if (files.length > filesToAdd.length) {
      toast({ 
        title: t('createListing.imagesLimited'), 
        description: t('createListing.imagesLimitedDesc').replace('{count}', filesToAdd.length.toString()).replace('{total}', files.length.toString()),
        variant: 'default'
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnhanceImage = async (index: number) => {
    const preview = imagePreviews[index];
    if (!preview) return;
    
    setEnhancingIndex(index);
    const result = await enhanceImage(preview);
    
    if (result.success && result.enhancedUrl) {
      // Replace the preview with enhanced version
      setImagePreviews(prev => prev.map((p, i) => i === index ? result.enhancedUrl! : p));
      
      // Convert enhanced URL to File and replace in imageFiles
      try {
        const resp = await fetch(result.enhancedUrl);
        const blob = await resp.blob();
        const enhancedFile = new File([blob], `enhanced-${Date.now()}.png`, { type: 'image/png' });
        setImageFiles(prev => prev.map((f, i) => i === index ? enhancedFile : f));
      } catch (e) {
        console.error('Failed to convert enhanced image to file:', e);
      }
    }
    setEnhancingIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double-clicks and rapid submissions
    if (isSubmittingRef.current || loading) {
      toast({ title: '⏳ Se procesează...', description: 'O acțiune este deja în curs. Te rugăm să aștepți.' });
      return;
    }
    isSubmittingRef.current = true;

    if (!user) {
      toast({ title: t('createListing.loginRequired'), description: t('createListing.loginRequiredDesc'), variant: 'destructive' });
      navigate('/login');
      return;
    }

    // KYC verification check
    if (!canSell) {
      toast({ 
        title: t('createListing.kycRequired'), 
        description: kycMessage || 'Completează verificarea identității pentru a putea vinde.', 
        variant: 'destructive' 
      });
      navigate('/profile-settings');
      return;
    }

    if (!hasActivePlan) {
      toast({ title: t('createListing.sellerModeInactive'), description: 'Trebuie să alegi un plan de vânzător.', variant: 'destructive' });
      navigate('/seller-plans');
      return;
    }

    if (!canCreateMore) {
      toast({ 
        title: t('createListing.limitReached'), 
        description: `${t('createListing.limitDesc')} ${listingLimit?.maxListings} ${t('createListing.products')}.`, 
        variant: 'destructive' 
      });
      return;
    }

    if (!title || !condition || !category) {
      toast({ title: t('createListing.missingFields'), description: t('createListing.missingFieldsDesc'), variant: 'destructive' });
      return;
    }

    // Validate price and shipping cost for non-auction
    if (listingType !== 'auction') {
      if (!price) {
        toast({ title: t('createListing.missingPrice'), description: t('createListing.missingPriceDesc'), variant: 'destructive' });
        return;
      }
      // Enforce max listing price from admin settings
      if (parseFloat(price) > MAX_LISTING_PRICE) {
        toast({ 
          title: 'Preț prea mare', 
          description: `Prețul maxim permis este ${MAX_LISTING_PRICE.toLocaleString()} RON.`, 
          variant: 'destructive' 
        });
        return;
      }
      // Shipping cost is now set by courier selection - no manual validation needed
      if (!selectedCourier) {
        toast({ title: t('createListing.missingShipping'), description: t('createListing.missingShippingDesc'), variant: 'destructive' });
        return;
      }
    }

    if (imageFiles.length === 0) {
      toast({ title: t('createListing.imageRequired'), description: t('createListing.imageRequiredDesc'), variant: 'destructive' });
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
        location: null,
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
        shipping_cost: shippingCost ? parseFloat(shippingCost) : 0,
        shipping_carrier: selectedCourier || null,
        seller_country: sellerCountry || sellerCountryInput || null,
        // Seller's chosen currency for the price
        price_currency: priceCurrency,
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

      // 4. Create "listing live" notification for the seller
      if (isActive) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'info',
          title: '🟢 Produs Live!',
          message: `Produsul tău "${title}" este acum activ pe platformă și vizibil pentru cumpărători.`,
          data: { listing_id: newListing.id },
        });
      }

      // 5. Clear draft after successful save
      clearDraft();

      toast({ 
          title: t('createListing.success'), 
          description: isActive ? t('createListing.successDesc') : t('createListing.draftDesc')
        });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({ 
        title: t('createListing.error'), 
        description: error.message || t('createListing.errorDesc'), 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('createListing.loginRequired')}</h1>
          <Button onClick={() => navigate('/login')}>{t('auth.login')}</Button>
        </div>
      </Layout>
    );
  }

  // Show blocked screen
  if (isBlocked) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <Ban className="h-16 w-16 mx-auto mb-6 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Listare Blocată</h1>
          <p className="text-muted-foreground mb-6">
            Butonul de listare a fost blocat deoarece abonamentul tău a expirat și nu a fost reînnoit în 72 de ore.
            <br /><br />
            Contactează administratorul sau alege un plan pentru a continua.
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full gap-2" asChild>
              <Link to="/seller-plans">
                <Store className="h-4 w-4" />
                Vezi Planurile
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">{t('createListing.backToDashboard')}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show plan required screen - with trial option
  if (!planLoading && !trialLoading && !hasActivePlan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <Store className="h-16 w-16 mx-auto mb-6 text-amber-500" />
          <h1 className="text-2xl font-bold mb-4">Plan Vânzător Necesar</h1>
          <p className="text-muted-foreground mb-6">
            {!trialStatus?.trialStartedAt ? (
              <>
                Începe cu <strong>30 de zile gratuit</strong> (max 10 produse) sau alege un plan plătit.
              </>
            ) : (
              <>
                Perioada de trial a expirat. Alege un plan pentru a continua.
                <br /><br />
                <strong>Planuri de la 11 LEI</strong>
              </>
            )}
          </p>
          <div className="space-y-3">
            {!trialStatus?.trialStartedAt && (
              <Button
                size="lg"
                className="w-full gap-2"
                variant="default"
                disabled={startTrial.isPending}
                onClick={() => startTrial.mutate()}
              >
                {startTrial.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                Începe 30 Zile Gratuit
              </Button>
            )}
            <Button 
              size="lg" 
              className="w-full gap-2"
              variant={trialStatus?.trialStartedAt ? 'default' : 'outline'}
              asChild
            >
              <Link to="/seller-plans">
                <Store className="h-4 w-4" />
                Vezi Planurile Plătite
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">{t('createListing.backToDashboard')}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (planLoading || limitLoading || trialLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('createListing.checkingStatus')}</p>
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
          <h1 className="text-2xl font-bold mb-4">{t('createListing.limitTitle')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('createListing.limitDesc')} <span className="font-bold text-foreground">{listingLimit?.maxListings} {t('createListing.products')}</span>.
            {t('createListing.limitAction')}
          </p>
          <Alert className="text-left mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('createListing.activeProducts')} {listingLimit?.currentCount}/{listingLimit?.maxListings}</AlertTitle>
            <AlertDescription>
              {t('createListing.unlimitedSales').replace('{max}', (listingLimit?.maxListings || 10).toString())}
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button className="w-full" asChild>
              <Link to="/seller-plans">Upgrade Plan</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">{t('createListing.manageProducts')}</Link>
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
          <h1 className="text-3xl font-bold">{t('createListing.title')}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Package className="h-3 w-3" />
              {listingLimit?.currentCount}/{listingLimit?.isUnlimited ? '∞' : listingLimit?.maxListings} unități
            </Badge>
            {listingLimit?.planName && (
              <Badge variant="secondary" className="text-xs">
                {listingLimit.planName}
              </Badge>
            )}
          </div>
        </div>

        {/* Draft restored banner */}
        {hasDraft && (
          <Alert className="mb-4 border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">📝 Ciornă restaurată</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span className="text-muted-foreground">Am restaurat datele produsului la care lucrai anterior.</span>
              <Button variant="ghost" size="sm" onClick={handleClearDraft} className="shrink-0 ml-2">
                Șterge ciorna
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Trial Expiry Warning */}
        {trialStatus?.shouldWarnExpiry && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">⚠️ Perioada de trial expiră în {trialStatus.trialDaysRemaining} zile!</AlertTitle>
            <AlertDescription className="text-amber-700">
              După expirare, ai 72 de ore să alegi un plan plătit, altfel butonul de listare se blochează automat.{' '}
              <Link to="/seller-plans" className="underline font-semibold">Alege un plan acum →</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Remaining listings warning */}
        {listingLimit && !listingLimit.isUnlimited && listingLimit.remaining <= 3 && listingLimit.remaining > 0 && (
          <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-950/20 mb-4">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">⚠️ Mai poți adăuga doar {listingLimit.remaining} produse!</AlertTitle>
            <AlertDescription className="text-orange-700">
              Abonamentul tău permite maxim {listingLimit.maxListings} listări. Fă upgrade pentru mai mult spațiu.{' '}
              <Link to="/seller-plans" className="underline font-semibold">Upgrade →</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Platform Rules Warning */}
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">{t('createListing.prohibited')}</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-red-600">
                <Ban className="h-4 w-4" /> {t('createListing.prohibitedWeapons')}
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <Leaf className="h-4 w-4" /> {t('createListing.prohibitedSubstances')}
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <Bomb className="h-4 w-4" /> {t('createListing.prohibitedContraband')}
              </span>
            </div>
            <p className="text-xs text-red-500 mt-2">
              {t('createListing.prohibitedWarning')}
            </p>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos - Maximum 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fotografii</CardTitle>
              <CardDescription>Adaugă până la 3 fotografii ale produsului tău</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {enhancingIndex === index && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs font-medium text-foreground">Se îmbunătățește...</span>
                      </div>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEnhanceImage(index)}
                        disabled={enhancingIndex !== null}
                        title="Îmbunătățește - fundal alb profesionist"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 3 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Adaugă Poză</span>
                    <span className="text-xs text-muted-foreground">({imagePreviews.length}/3)</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Apasă ✨ pe orice imagine pentru a o transforma profesionist cu fundal alb
              </p>
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {priceCurrency === 'RON' ? 'lei' : priceCurrency === 'EUR' ? '€' : priceCurrency === 'USD' ? '$' : '£'}
                        </span>
                        <Input 
                          id="startingBid" 
                          type="number" 
                          placeholder="1.00" 
                          value={startingBid} 
                          onChange={(e) => setStartingBid(e.target.value)} 
                          className="pl-10" 
                          min="0.01" 
                          step="0.01" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bidIncrement">Pas Licitare</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {priceCurrency === 'RON' ? 'lei' : priceCurrency === 'EUR' ? '€' : priceCurrency === 'USD' ? '$' : '£'}
                        </span>
                        <Input 
                          id="bidIncrement" 
                          type="number" 
                          placeholder="1.00" 
                          value={bidIncrement} 
                          onChange={(e) => setBidIncrement(e.target.value)} 
                          className="pl-10" 
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {priceCurrency === 'RON' ? 'lei' : priceCurrency === 'EUR' ? '€' : priceCurrency === 'USD' ? '$' : '£'}
                        </span>
                        <Input 
                          id="reservePrice" 
                          type="number" 
                          placeholder="Minim acceptat" 
                          value={reservePrice} 
                          onChange={(e) => setReservePrice(e.target.value)} 
                          className="pl-10" 
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

          {/* Price & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {listingType === 'auction' ? 'Livrare' : 'Preț și Livrare'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listingType !== 'auction' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">
                      {listingType === 'both' ? 'Preț Buy Now *' : 'Preț *'}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {priceCurrency === 'RON' ? 'lei' : priceCurrency === 'EUR' ? '€' : priceCurrency === 'USD' ? '$' : '£'}
                      </span>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="0" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        className="pl-10" 
                        min="0" 
                        step="0.01" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priceCurrency">Moneda Prețului *</Label>
                    <Select value={priceCurrency} onValueChange={(v) => setPriceCurrency(v as 'RON' | 'GBP' | 'EUR' | 'USD')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RON">🇷🇴 RON (Lei)</SelectItem>
                        <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                        <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prețul va fi afișat automat în moneda vizitatorului
                    </p>
                  </div>
                </div>
              )}

              {/* Seller Country Selection - Required for shipping rates */}
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
                    <SelectItem value="Romania">🇷🇴 România</SelectItem>
                    <SelectItem value="UK">🇬🇧 Regatul Unit</SelectItem>
                    <SelectItem value="Germany">🇩🇪 Germania</SelectItem>
                    <SelectItem value="France">🇫🇷 Franța</SelectItem>
                    <SelectItem value="Italy">🇮🇹 Italia</SelectItem>
                    <SelectItem value="Spain">🇪🇸 Spania</SelectItem>
                    <SelectItem value="Netherlands">🇳🇱 Olanda</SelectItem>
                    <SelectItem value="Belgium">🇧🇪 Belgia</SelectItem>
                    <SelectItem value="Austria">🇦🇹 Austria</SelectItem>
                    <SelectItem value="Switzerland">🇨🇭 Elveția</SelectItem>
                    <SelectItem value="Poland">🇵🇱 Polonia</SelectItem>
                    <SelectItem value="Czech Republic">🇨🇿 Cehia</SelectItem>
                    <SelectItem value="Hungary">🇭🇺 Ungaria</SelectItem>
                    <SelectItem value="Portugal">🇵🇹 Portugalia</SelectItem>
                    <SelectItem value="Sweden">🇸🇪 Suedia</SelectItem>
                    <SelectItem value="Norway">🇳🇴 Norvegia</SelectItem>
                    <SelectItem value="Denmark">🇩🇰 Danemarca</SelectItem>
                    <SelectItem value="Finland">🇫🇮 Finlanda</SelectItem>
                    <SelectItem value="Ireland">🇮🇪 Irlanda</SelectItem>
                    <SelectItem value="Greece">🇬🇷 Grecia</SelectItem>
                    <SelectItem value="Bulgaria">🇧🇬 Bulgaria</SelectItem>
                    <SelectItem value="Croatia">🇭🇷 Croația</SelectItem>
                    <SelectItem value="Slovakia">🇸🇰 Slovacia</SelectItem>
                    <SelectItem value="Slovenia">🇸🇮 Slovenia</SelectItem>
                    <SelectItem value="Lithuania">🇱🇹 Lituania</SelectItem>
                    <SelectItem value="Latvia">🇱🇻 Letonia</SelectItem>
                    <SelectItem value="Estonia">🇪🇪 Estonia</SelectItem>
                    <SelectItem value="Luxembourg">🇱🇺 Luxemburg</SelectItem>
                    <SelectItem value="Malta">🇲🇹 Malta</SelectItem>
                    <SelectItem value="Cyprus">🇨🇾 Cipru</SelectItem>
                    <SelectItem value="Iceland">🇮🇸 Islanda</SelectItem>
                    <SelectItem value="Serbia">🇷🇸 Serbia</SelectItem>
                    <SelectItem value="Moldova">🇲🇩 Moldova</SelectItem>
                    <SelectItem value="Albania">🇦🇱 Albania</SelectItem>
                    <SelectItem value="North Macedonia">🇲🇰 Macedonia de Nord</SelectItem>
                    <SelectItem value="Montenegro">🇲🇪 Muntenegru</SelectItem>
                    <SelectItem value="Bosnia">🇧🇦 Bosnia și Herțegovina</SelectItem>
                    <SelectItem value="Turkey">🇹🇷 Turcia</SelectItem>
                    <SelectItem value="Ukraine">🇺🇦 Ucraina</SelectItem>
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
              <>
                {isActive ? 'Publică Produsul' : 'Salvează ca Draft'}
              </>
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateListing;
