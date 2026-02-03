import { useState, useEffect } from 'react';
import { Save, Search, Globe, Image, Share2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
}

interface SocialMeta {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

interface SEOSettings {
  global: {
    siteName: string;
    siteTagline: string;
    defaultDescription: string;
    defaultKeywords: string;
    googleAnalyticsId: string;
    googleSearchConsoleId: string;
  };
  pages: {
    home: PageSEO;
    browse: PageSEO;
    login: PageSEO;
    signup: PageSEO;
    sell: PageSEO;
  };
  social: SocialMeta;
  robots: {
    indexSite: boolean;
    followLinks: boolean;
    robotsTxt: string;
  };
}

const defaultSettings: SEOSettings = {
  global: {
    siteName: 'Marketplace',
    siteTagline: 'Buy and Sell Locally',
    defaultDescription: 'Your trusted online marketplace for buying and selling new and used items.',
    defaultKeywords: 'marketplace, buy, sell, local, used items, second hand',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
  },
  pages: {
    home: {
      title: 'Home | {{siteName}}',
      description: 'Find great deals on new and used items near you.',
      keywords: 'marketplace, local deals, buy sell',
    },
    browse: {
      title: 'Browse Items | {{siteName}}',
      description: 'Browse thousands of items for sale in your area.',
      keywords: 'browse, search, items for sale',
    },
    login: {
      title: 'Login | {{siteName}}',
      description: 'Sign in to your account to buy and sell items.',
      keywords: 'login, sign in',
    },
    signup: {
      title: 'Sign Up | {{siteName}}',
      description: 'Create an account to start buying and selling.',
      keywords: 'signup, register, create account',
    },
    sell: {
      title: 'Sell Your Items | {{siteName}}',
      description: 'List your items for sale and reach thousands of buyers.',
      keywords: 'sell, list item, make money',
    },
  },
  social: {
    ogTitle: 'Marketplace - Buy and Sell Locally',
    ogDescription: 'Find great deals on new and used items near you.',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Marketplace - Buy and Sell Locally',
    twitterDescription: 'Find great deals on new and used items near you.',
    twitterImage: '',
  },
  robots: {
    indexSite: true,
    followLinks: true,
    robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/
Disallow: /checkout/

Sitemap: https://yoursite.com/sitemap.xml`,
  },
};

export default function AdminSEO() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);

  const { data: seoData, isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_settings').select('*');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (seoData && seoData.length > 0) {
      const globalData = seoData.find(s => s.page_key === 'global');
      const socialData = seoData.find(s => s.page_key === 'social');
      const robotsData = seoData.find(s => s.page_key === 'robots');

      if (globalData) {
        setSettings(prev => ({
          ...prev,
          global: {
            siteName: globalData.meta_title || defaultSettings.global.siteName,
            siteTagline: globalData.og_title || defaultSettings.global.siteTagline,
            defaultDescription: globalData.meta_description || defaultSettings.global.defaultDescription,
            defaultKeywords: globalData.keywords?.join(', ') || defaultSettings.global.defaultKeywords,
            googleAnalyticsId: globalData.og_image || '',
            googleSearchConsoleId: globalData.og_description || '',
          },
        }));
      }

      if (socialData) {
        setSettings(prev => ({
          ...prev,
          social: {
            ogTitle: socialData.og_title || defaultSettings.social.ogTitle,
            ogDescription: socialData.og_description || defaultSettings.social.ogDescription,
            ogImage: socialData.og_image || '',
            twitterCard: 'summary_large_image',
            twitterTitle: socialData.meta_title || defaultSettings.social.twitterTitle,
            twitterDescription: socialData.meta_description || defaultSettings.social.twitterDescription,
            twitterImage: socialData.og_image || '',
          },
        }));
      }

      if (robotsData?.meta_description) {
        setSettings(prev => ({
          ...prev,
          robots: {
            ...prev.robots,
            robotsTxt: robotsData.meta_description,
          },
        }));
      }

      // Load page-specific SEO
      const pageKeys = ['home', 'browse', 'login', 'signup', 'sell'] as const;
      pageKeys.forEach(pageKey => {
        const pageData = seoData.find(s => s.page_key === pageKey);
        if (pageData) {
          setSettings(prev => ({
            ...prev,
            pages: {
              ...prev.pages,
              [pageKey]: {
                title: pageData.meta_title || defaultSettings.pages[pageKey].title,
                description: pageData.meta_description || defaultSettings.pages[pageKey].description,
                keywords: pageData.keywords?.join(', ') || defaultSettings.pages[pageKey].keywords,
              },
            },
          }));
        }
      });
    }
  }, [seoData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save global settings
      await supabase.from('seo_settings').upsert({
        page_key: 'global',
        meta_title: settings.global.siteName,
        og_title: settings.global.siteTagline,
        meta_description: settings.global.defaultDescription,
        keywords: settings.global.defaultKeywords.split(',').map(k => k.trim()),
        og_image: settings.global.googleAnalyticsId,
        og_description: settings.global.googleSearchConsoleId,
      }, { onConflict: 'page_key' });

      // Save social settings
      await supabase.from('seo_settings').upsert({
        page_key: 'social',
        og_title: settings.social.ogTitle,
        og_description: settings.social.ogDescription,
        og_image: settings.social.ogImage,
        meta_title: settings.social.twitterTitle,
        meta_description: settings.social.twitterDescription,
      }, { onConflict: 'page_key' });

      // Save robots
      await supabase.from('seo_settings').upsert({
        page_key: 'robots',
        meta_description: settings.robots.robotsTxt,
      }, { onConflict: 'page_key' });

      // Save page-specific SEO
      for (const [pageKey, pageSettings] of Object.entries(settings.pages)) {
        await supabase.from('seo_settings').upsert({
          page_key: pageKey,
          meta_title: pageSettings.title,
          meta_description: pageSettings.description,
          keywords: pageSettings.keywords.split(',').map(k => k.trim()),
        }, { onConflict: 'page_key' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({ title: 'SEO settings saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => saveMutation.mutate();

  const updateGlobal = (key: keyof SEOSettings['global'], value: string) => {
    setSettings(prev => ({ ...prev, global: { ...prev.global, [key]: value } }));
  };

  const updatePage = (page: keyof SEOSettings['pages'], key: keyof PageSEO, value: string) => {
    setSettings(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page]: { ...prev.pages[page], [key]: value },
      },
    }));
  };

  const updateSocial = (key: keyof SocialMeta, value: string) => {
    setSettings(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));
  };

  const updateRobots = (key: keyof SEOSettings['robots'], value: any) => {
    setSettings(prev => ({ ...prev, robots: { ...prev.robots, [key]: value } }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SEO Settings</h1>
            <p className="text-muted-foreground">Optimize your site for search engines</p>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList>
            <TabsTrigger value="global" className="gap-2">
              <Globe className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Search className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="robots" className="gap-2">
              <Image className="h-4 w-4" />
              Robots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>Global SEO Settings</CardTitle>
                <CardDescription>Default settings applied across the site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={settings.global.siteName}
                      onChange={(e) => updateGlobal('siteName', e.target.value)}
                      placeholder="Marketplace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Site Tagline</Label>
                    <Input
                      value={settings.global.siteTagline}
                      onChange={(e) => updateGlobal('siteTagline', e.target.value)}
                      placeholder="Buy and Sell Locally"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Meta Description</Label>
                  <Textarea
                    value={settings.global.defaultDescription}
                    onChange={(e) => updateGlobal('defaultDescription', e.target.value)}
                    placeholder="Describe your site..."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.global.defaultDescription.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Default Keywords</Label>
                  <Input
                    value={settings.global.defaultKeywords}
                    onChange={(e) => updateGlobal('defaultKeywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input
                      value={settings.global.googleAnalyticsId}
                      onChange={(e) => updateGlobal('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Search Console ID</Label>
                    <Input
                      value={settings.global.googleSearchConsoleId}
                      onChange={(e) => updateGlobal('googleSearchConsoleId', e.target.value)}
                      placeholder="verification code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <div className="space-y-4">
              {(Object.keys(settings.pages) as Array<keyof SEOSettings['pages']>).map((page) => (
                <Card key={page}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">{page} Page</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title Tag</Label>
                      <Input
                        value={settings.pages[page].title}
                        onChange={(e) => updatePage(page, 'title', e.target.value)}
                        placeholder="Page Title | Site Name"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {'{{siteName}}'} to insert site name. {settings.pages[page].title.length}/60 chars
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        value={settings.pages[page].description}
                        onChange={(e) => updatePage(page, 'description', e.target.value)}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        {settings.pages[page].description.length}/160 chars
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        value={settings.pages[page].keywords}
                        onChange={(e) => updatePage(page, 'keywords', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Meta Tags</CardTitle>
                <CardDescription>Control how your site appears when shared on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Open Graph (Facebook, LinkedIn)</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>OG Title</Label>
                      <Input
                        value={settings.social.ogTitle}
                        onChange={(e) => updateSocial('ogTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Description</Label>
                      <Textarea
                        value={settings.social.ogDescription}
                        onChange={(e) => updateSocial('ogDescription', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={settings.social.ogImage}
                        onChange={(e) => updateSocial('ogImage', e.target.value)}
                        placeholder="https://yoursite.com/og-image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 1200x630 pixels</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Twitter Card</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Twitter Title</Label>
                      <Input
                        value={settings.social.twitterTitle}
                        onChange={(e) => updateSocial('twitterTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter Description</Label>
                      <Textarea
                        value={settings.social.twitterDescription}
                        onChange={(e) => updateSocial('twitterDescription', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter Image URL</Label>
                      <Input
                        value={settings.social.twitterImage}
                        onChange={(e) => updateSocial('twitterImage', e.target.value)}
                        placeholder="https://yoursite.com/twitter-image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="robots">
            <Card>
              <CardHeader>
                <CardTitle>Robots & Indexing</CardTitle>
                <CardDescription>Control search engine crawling behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>robots.txt Content</Label>
                  <Textarea
                    value={settings.robots.robotsTxt}
                    onChange={(e) => updateRobots('robotsTxt', e.target.value)}
                    className="font-mono text-sm"
                    rows={12}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
