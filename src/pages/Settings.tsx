import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Bell, Shield, MapPin, Save, 
  Wallet, Package, Building2, EyeOff, Globe
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { PasswordReset } from '@/components/settings/PasswordReset';
import { PayoutSection } from '@/components/settings/PayoutSection';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, Language } from '@/contexts/LanguageContext';

// All European languages
const EUROPEAN_LANGUAGES = [
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

const Settings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [hasAcceptedTermsBefore, setHasAcceptedTermsBefore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  // Setări notificări - real state saved to localStorage
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('notification_email');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [messageAlerts, setMessageAlerts] = useState(() => {
    const saved = localStorage.getItem('notification_messages');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [orderAlerts, setOrderAlerts] = useState(() => {
    const saved = localStorage.getItem('notification_orders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [paymentAlerts, setPaymentAlerts] = useState(() => {
    const saved = localStorage.getItem('notification_payments');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save notification preferences to localStorage
  const saveNotificationPrefs = (key: string, value: boolean) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
      setStoreName((profile as any).store_name || '');
      setIsSeller((profile as any).is_seller || false);
      // Check if seller has already accepted terms
      const termsAcceptedAt = (profile as any).seller_terms_accepted_at;
      if (termsAcceptedAt) {
        setHasAcceptedTermsBefore(true);
        setSellerTermsAccepted(true);
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      username,
      bio,
      location,
      phone,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profil actualizat cu succes' });
    }
  };

  const handleSaveSellerSettings = async () => {
    // Validate terms acceptance for new sellers
    if (isSeller && !hasAcceptedTermsBefore && !sellerTermsAccepted) {
      toast({ 
        title: 'Acceptare termeni obligatorie', 
        description: 'Trebuie să accepți Termenii și Condițiile pentru a deveni vânzător.', 
        variant: 'destructive' 
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        store_name: storeName,
        is_seller: isSeller,
      };

      // Set terms acceptance timestamp for first-time sellers
      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        updateData.seller_terms_accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      if (isSeller && !hasAcceptedTermsBefore && sellerTermsAccepted) {
        setHasAcceptedTermsBefore(true);
      }
      
      toast({ title: 'Setări vânzător salvate cu succes' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Se încarcă...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          <h2 className="text-2xl font-bold mb-6">Setări Cont</h2>
          
          <Tabs defaultValue="profile" className="space-y-6">
            {/* Simplified 2-tab navigation */}
            <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-2 bg-muted/50 rounded-2xl">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <User className="h-6 w-6" />
                <span className="text-xs font-medium">Profil Complet</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs font-medium">Securitate</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Profil Complet - Tot într-un singur loc */}
            <TabsContent value="profile" className="space-y-6">
              {/* Avatar & Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informații Personale</CardTitle>
                  <CardDescription>Avatar, nume și date de contact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    displayName={displayName || user?.email || 'User'}
                    userId={user?.id || ''}
                    onAvatarChange={(url) => {}}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nume Afișat *</Label>
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Numele tău afișat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Nume Utilizator</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@utilizator"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Locație</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Oraș, Județ"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        Telefon
                        <Badge variant="outline" className="text-xs gap-1">
                          <EyeOff className="h-3 w-3" />
                          Privat
                        </Badge>
                      </Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712 345 678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Descriere Profil / Magazin</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Spune-le altora despre tine..."
                      rows={3}
                    />
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Limbă platformă</Label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={(val) => {
                        setSelectedLanguage(val);
                        if (val === 'ro' || val === 'en') {
                          setLanguage(val as Language);
                          localStorage.setItem('preferredLanguage', val);
                          toast({ title: 'Limbă schimbată' });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Selectează limba" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ro">🇷🇴 Română</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving} 
                    size="lg"
                    className="gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Se salvează...' : 'Salvează Profil'}
                  </Button>
                </CardContent>
              </Card>

              {/* Seller Mode & Store */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-amber-500" />
                    Mod Vânzător
                  </CardTitle>
                  <CardDescription>Activează pentru a lista produse de vânzare</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">Activează Modul Vânzător</p>
                      <p className="text-sm text-muted-foreground">Permite listarea produselor</p>
                    </div>
                    <Switch 
                      checked={isSeller} 
                      onCheckedChange={setIsSeller}
                    />
                  </div>

                  {isSeller && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Nume Magazin *</Label>
                        <Input 
                          id="storeName"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Magazinul Meu" 
                        />
                      </div>

                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Limită:</strong> Max 10 produse active simultan. Vânzările sunt nelimitate!
                        </AlertDescription>
                      </Alert>

                      {/* Terms - only if not accepted */}
                      {!hasAcceptedTermsBefore && (
                        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Termeni Vânzător</h4>
                              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                <li>Descriere corectă a produselor</li>
                                <li>Expediere la timp</li>
                                <li>Respectarea politicii de returnări</li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-2 border-t border-primary/20">
                            <input
                              type="checkbox"
                              id="sellerTerms"
                              checked={sellerTermsAccepted}
                              onChange={(e) => setSellerTermsAccepted(e.target.checked)}
                              className="h-5 w-5 rounded border-primary text-primary cursor-pointer"
                            />
                            <label htmlFor="sellerTerms" className="text-sm cursor-pointer">
                              Accept <a href="/terms-of-service" target="_blank" className="text-primary underline">Termenii</a> *
                            </label>
                          </div>
                        </div>
                      )}

                      {hasAcceptedTermsBefore && (
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <Shield className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            ✓ Termeni acceptați
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  <Button 
                    onClick={handleSaveSellerSettings} 
                    disabled={saving || (isSeller && !hasAcceptedTermsBefore && !sellerTermsAccepted)} 
                    size="lg"
                    className="gap-2 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Se salvează...' : 'Salvează Magazin'}
                  </Button>
                </CardContent>
              </Card>

              {/* Payout / Bank Details - Integrated */}
              <PayoutSection />
            </TabsContent>

            {/* Tab Securitate */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Securitate</CardTitle>
                  <CardDescription>Gestionează securitatea contului</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PasswordReset userEmail={user?.email || ''} />

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <EyeOff className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Protecția Datelor</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Telefonul și adresa sunt vizibile doar pentru tine.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
