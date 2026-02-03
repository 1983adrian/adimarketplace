import { useState, useEffect } from 'react';
import { Save, Image, Type, Layout, Eye, Plus, Trash2, GripVertical, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface HeroSettings {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  showSearchBar: boolean;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  position: number;
}

interface FeaturedSection {
  showCategories: boolean;
  showPromotedListings: boolean;
  showFeaturedListings: boolean;
  showHowItWorks: boolean;
  categoriesTitle: string;
  promotedTitle: string;
  featuredTitle: string;
}

interface HomepageConfig {
  hero: HeroSettings;
  banners: Banner[];
  sections: FeaturedSection;
}

const defaultConfig: HomepageConfig = {
  hero: {
    title: 'Find Great Deals Near You',
    subtitle: 'Buy and sell items in your local community',
    ctaText: 'Start Shopping',
    ctaLink: '/browse',
    backgroundImage: '',
    showSearchBar: true,
  },
  banners: [],
  sections: {
    showCategories: true,
    showPromotedListings: true,
    showFeaturedListings: true,
    showHowItWorks: true,
    categoriesTitle: 'Shop by Category',
    promotedTitle: 'Featured Listings',
    featuredTitle: 'Latest Items',
  },
};

export default function AdminHomepageEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<HomepageConfig>(defaultConfig);

  const { data: homepageData, isLoading } = useQuery({
    queryKey: ['homepage-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (homepageData && homepageData.length > 0) {
      const heroData = homepageData.find(h => h.section_key === 'hero');
      const sectionsData = homepageData.find(h => h.section_key === 'sections');
      const bannersData = homepageData.filter(h => h.section_key === 'banner');

      if (heroData) {
        setConfig(prev => ({
          ...prev,
          hero: {
            title: heroData.title || defaultConfig.hero.title,
            subtitle: heroData.subtitle || defaultConfig.hero.subtitle,
            ctaText: heroData.button_text || defaultConfig.hero.ctaText,
            ctaLink: heroData.button_url || defaultConfig.hero.ctaLink,
            backgroundImage: heroData.image_url || '',
            showSearchBar: heroData.is_active ?? true,
          },
        }));
      }

      if (sectionsData?.description) {
        try {
          const parsed = JSON.parse(sectionsData.description);
          setConfig(prev => ({ ...prev, sections: { ...defaultConfig.sections, ...parsed } }));
        } catch {}
      }

      if (bannersData.length > 0) {
        const banners: Banner[] = bannersData.map(b => ({
          id: b.id,
          title: b.title || '',
          description: b.description || '',
          imageUrl: b.image_url || '',
          linkUrl: b.button_url || '',
          isActive: b.is_active,
          position: b.sort_order,
        }));
        setConfig(prev => ({ ...prev, banners }));
      }
    }
  }, [homepageData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save hero
      const { error: heroError } = await supabase
        .from('homepage_content')
        .upsert({
          section_key: 'hero',
          title: config.hero.title,
          subtitle: config.hero.subtitle,
          button_text: config.hero.ctaText,
          button_url: config.hero.ctaLink,
          image_url: config.hero.backgroundImage,
          is_active: config.hero.showSearchBar,
          sort_order: 0,
        }, { onConflict: 'section_key' });
      if (heroError) throw heroError;

      // Save sections config
      const { error: sectionsError } = await supabase
        .from('homepage_content')
        .upsert({
          section_key: 'sections',
          description: JSON.stringify(config.sections),
          is_active: true,
          sort_order: 1,
        }, { onConflict: 'section_key' });
      if (sectionsError) throw sectionsError;

      // Delete old banners and insert new ones
      await supabase.from('homepage_content').delete().eq('section_key', 'banner');
      
      for (const banner of config.banners) {
        const { error } = await supabase.from('homepage_content').insert({
          section_key: 'banner',
          title: banner.title,
          description: banner.description,
          image_url: banner.imageUrl,
          button_url: banner.linkUrl,
          is_active: banner.isActive,
          sort_order: banner.position + 10,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({ title: 'Homepage saved', description: 'Changes will appear on the homepage.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => saveMutation.mutate();

  const updateHero = (key: keyof HeroSettings, value: any) => {
    setConfig(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const updateSections = (key: keyof FeaturedSection, value: any) => {
    setConfig(prev => ({ ...prev, sections: { ...prev.sections, [key]: value } }));
  };

  const addBanner = () => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      title: 'New Banner',
      description: '',
      imageUrl: '',
      linkUrl: '',
      isActive: false,
      position: config.banners.length,
    };
    setConfig(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setConfig(prev => ({
      ...prev,
      banners: prev.banners.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteBanner = (id: string) => {
    setConfig(prev => ({
      ...prev,
      banners: prev.banners.filter(b => b.id !== id),
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homepage Editor</h1>
            <p className="text-muted-foreground">Customize homepage content and layout</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" asChild>
              <a href="/" target="_blank">
                <Eye className="h-4 w-4" />
                Preview
              </a>
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero" className="gap-2">
              <Type className="h-4 w-4" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2">
              <Image className="h-4 w-4" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="sections" className="gap-2">
              <Layout className="h-4 w-4" />
              Sections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner at the top of the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Main Title</Label>
                    <Input
                      value={config.hero.title}
                      onChange={(e) => updateHero('title', e.target.value)}
                      placeholder="Find Great Deals..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={config.hero.subtitle}
                      onChange={(e) => updateHero('subtitle', e.target.value)}
                      placeholder="Buy and sell..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={config.hero.ctaText}
                      onChange={(e) => updateHero('ctaText', e.target.value)}
                      placeholder="Start Shopping"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Link</Label>
                    <Input
                      value={config.hero.ctaLink}
                      onChange={(e) => updateHero('ctaLink', e.target.value)}
                      placeholder="/browse"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={config.hero.backgroundImage}
                    onChange={(e) => updateHero('backgroundImage', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Search Bar</Label>
                    <p className="text-sm text-muted-foreground">Display search bar in hero section</p>
                  </div>
                  <Switch
                    checked={config.hero.showSearchBar}
                    onCheckedChange={(checked) => updateHero('showSearchBar', checked)}
                  />
                </div>

                {/* Preview */}
                <Separator />
                <div className="p-6 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 text-center space-y-2">
                  <h2 className="text-2xl font-bold">{config.hero.title || 'Hero Title'}</h2>
                  <p className="text-muted-foreground">{config.hero.subtitle || 'Hero subtitle'}</p>
                  <Button size="sm">{config.hero.ctaText || 'CTA Button'}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Promotional Banners</CardTitle>
                    <CardDescription>Add banners to highlight promotions or announcements</CardDescription>
                  </div>
                  <Button onClick={addBanner} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Banner
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.banners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No banners yet. Click "Add Banner" to create one.
                  </div>
                ) : (
                  config.banners.map((banner, index) => (
                    <div key={banner.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <span className="font-medium">Banner {index + 1}</span>
                          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={(checked) => updateBanner(banner.id, { isActive: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBanner(banner.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={banner.title}
                            onChange={(e) => updateBanner(banner.id, { title: e.target.value })}
                            placeholder="Banner title..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link URL</Label>
                          <Input
                            value={banner.linkUrl}
                            onChange={(e) => updateBanner(banner.id, { linkUrl: e.target.value })}
                            placeholder="/browse?category=..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={banner.description}
                          onChange={(e) => updateBanner(banner.id, { description: e.target.value })}
                          placeholder="Banner description..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={banner.imageUrl}
                          onChange={(e) => updateBanner(banner.id, { imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Sections</CardTitle>
                <CardDescription>Configure which sections appear on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Categories Section</Label>
                      <p className="text-sm text-muted-foreground">Show category tiles</p>
                    </div>
                    <Switch
                      checked={config.sections.showCategories}
                      onCheckedChange={(checked) => updateSections('showCategories', checked)}
                    />
                  </div>
                  {config.sections.showCategories && (
                    <div className="ml-4 space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={config.sections.categoriesTitle}
                        onChange={(e) => updateSections('categoriesTitle', e.target.value)}
                        placeholder="Shop by Category"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Promoted Listings</Label>
                      <p className="text-sm text-muted-foreground">Show promoted/featured items</p>
                    </div>
                    <Switch
                      checked={config.sections.showPromotedListings}
                      onCheckedChange={(checked) => updateSections('showPromotedListings', checked)}
                    />
                  </div>
                  {config.sections.showPromotedListings && (
                    <div className="ml-4 space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={config.sections.promotedTitle}
                        onChange={(e) => updateSections('promotedTitle', e.target.value)}
                        placeholder="Featured Listings"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Latest Listings</Label>
                      <p className="text-sm text-muted-foreground">Show recent items</p>
                    </div>
                    <Switch
                      checked={config.sections.showFeaturedListings}
                      onCheckedChange={(checked) => updateSections('showFeaturedListings', checked)}
                    />
                  </div>
                  {config.sections.showFeaturedListings && (
                    <div className="ml-4 space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={config.sections.featuredTitle}
                        onChange={(e) => updateSections('featuredTitle', e.target.value)}
                        placeholder="Latest Items"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>How It Works</Label>
                      <p className="text-sm text-muted-foreground">Show steps for new users</p>
                    </div>
                    <Switch
                      checked={config.sections.showHowItWorks}
                      onCheckedChange={(checked) => updateSections('showHowItWorks', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
