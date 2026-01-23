import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Store, Bell, Shield, MapPin, Save, 
  Wallet, Package, Building2, EyeOff, Globe,
  Plus, GraduationCap, ShoppingBag, ClipboardList, MessageCircle, LayoutDashboard, Settings as SettingsIcon, Sparkles
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
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
  const { data: unreadMessages = 0 } = useUnreadMessages();
  
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
          
          {/* Quick Actions Section - like in the image */}
          <div className="mb-8 space-y-4">
            {/* User Info Card */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="font-semibold text-lg">{profile?.display_name || 'Utilizator'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* ACȚIUNI RAPIDE */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                ACȚIUNI RAPIDE
              </div>
              
              {/* Main CTA - Adaugă Produs */}
              <Button asChild className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-2xl shadow-lg">
                <Link to="/sell" className="flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  Adaugă Produs
                </Link>
              </Button>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="ghost" className="h-14 justify-start gap-3 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/20">
                  <Link to="/seller-tutorial">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">Tutorial PRO</span>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="h-14 justify-start gap-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/20">
                  <Link to="/dashboard?tab=listings">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">Produsele Mele</span>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="h-14 justify-start gap-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20">
                  <Link to="/orders">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">Comenzi Active</span>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="h-14 justify-start gap-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 relative">
                  <Link to="/messages">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-teal-500 flex items-center justify-center relative">
                      <MessageCircle className="h-5 w-5 text-white" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">Mesaje</span>
                    {unreadMessages > 0 && (
                      <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* CONT Section */}
            <div className="space-y-2 pt-4">
              <p className="text-muted-foreground font-semibold text-sm">CONT</p>
              
              <Button asChild variant="ghost" className="w-full h-12 justify-start gap-3 rounded-xl">
                <Link to="/dashboard">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Tabloul Meu</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full h-12 justify-start gap-3 rounded-xl">
                <Link to="/dashboard?tab=wallet">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <span>Portofel & Încasări</span>
                </Link>
              </Button>

              <Button variant="ghost" className="w-full h-12 justify-start gap-3 rounded-xl bg-primary/5 border border-primary/20">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Setări</span>
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Setări Cont</h2>
          
          <Tabs defaultValue="profile" className="space-y-6">
            {/* Simplified 4-tab navigation with large icons - Amazon/eBay style */}
            <TabsList className="w-full grid grid-cols-4 gap-2 h-auto p-2 bg-muted/50 rounded-2xl">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <User className="h-6 w-6" />
                <span className="text-xs font-medium">Profil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seller" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Store className="h-6 w-6" />
                <span className="text-xs font-medium">Magazin</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payouts" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Wallet className="h-6 w-6" />
                <span className="text-xs font-medium">Bani</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs font-medium">Securitate</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Profil */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informații Profil</CardTitle>
                  <CardDescription>Actualizează informațiile personale vizibile pentru alți utilizatori</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    displayName={displayName || user?.email || 'User'}
                    userId={user?.id || ''}
                    onAvatarChange={(url) => {
                      // Profile se va actualiza automat prin refetch
                    }}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nume Afișat</Label>
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
                    <p className="text-xs text-muted-foreground">Email-ul nu poate fi schimbat</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Descriere</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Spune-le altora despre tine..."
                      rows={3}
                    />
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
                      <p className="text-xs text-muted-foreground">
                        Numărul tău de telefon este vizibil doar pentru tine și nu va fi partajat cu alți utilizatori.
                      </p>
                    </div>
                  </div>

                  {/* Language Selector - Simplified */}
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
                    className="gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg text-base font-semibold"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Se salvează...' : 'Salvează'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Limbă removed - moved to Profile */}

            {/* Tab Încasări (Vânzător) - IBAN/Card */}
            <TabsContent value="payouts">
              <PayoutSection />
            </TabsContent>

            {/* Tab Vânzător / Magazin */}
            <TabsContent value="seller">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Magazin</CardTitle>
                  <CardDescription>Gestionează profilul și preferințele de vânzător</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">Mod Vânzător</p>
                      <p className="text-sm text-muted-foreground">Activează pentru a lista articole de vânzare</p>
                    </div>
                    <Switch 
                      checked={isSeller} 
                      onCheckedChange={setIsSeller}
                    />
                  </div>

                  {isSeller && (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="storeName">Nume Magazin *</Label>
                          <Input 
                            id="storeName"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="Magazinul Meu Super" 
                          />
                          <p className="text-xs text-muted-foreground">
                            Acest nume va fi afișat pe toate produsele tale
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Descriere Magazin</Label>
                          <Textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Spune-le cumpărătorilor despre magazinul tău..." 
                            rows={3} 
                          />
                        </div>
                      </div>

                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Limită produse:</strong> Poți avea maxim 10 produse active simultan. Vânzările sunt nelimitate!
                        </AlertDescription>
                      </Alert>

                      <Alert className="border-primary/20 bg-primary/5">
                        <Building2 className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Livrare:</strong> Costul și curierul de livrare se setează la crearea fiecărui anunț. 
                          Du-te la <strong>Vinde</strong> pentru a adăuga un produs nou.
                        </AlertDescription>
                      </Alert>

                      {/* Terms and Conditions - only show if not accepted before */}
                      {!hasAcceptedTermsBefore && (
                        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Termeni și Condiții Vânzător</h4>
                              <p className="text-sm text-muted-foreground">
                                Pentru a deveni vânzător pe platformă, trebuie să accepți Termenii și Condițiile noastre. 
                                Aceasta include responsabilitățile tale privind:
                              </p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                <li>Descrierea corectă și onestă a produselor</li>
                                <li>Expedierea la timp a comenzilor</li>
                                <li>Respectarea politicii de returnări</li>
                                <li>Conformitatea cu legislația în vigoare</li>
                                <li>Acceptarea comisioanelor platformei</li>
                                <li>Actualizările ulterioare ale termenilor</li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-2 border-t border-primary/20">
                            <input
                              type="checkbox"
                              id="sellerTerms"
                              checked={sellerTermsAccepted}
                              onChange={(e) => setSellerTermsAccepted(e.target.checked)}
                              className="h-5 w-5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="sellerTerms" className="text-sm font-medium cursor-pointer">
                              Accept <a href="/terms-of-service" target="_blank" className="text-primary underline hover:no-underline">Termenii și Condițiile</a> platformei, 
                              inclusiv modificările ulterioare *
                            </label>
                          </div>
                        </div>
                      )}

                      {hasAcceptedTermsBefore && (
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <Shield className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            <strong>✓ Termeni acceptați</strong> - Ai acceptat Termenii și Condițiile pentru vânzători.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  <Button 
                    onClick={handleSaveSellerSettings} 
                    disabled={saving || (isSeller && !hasAcceptedTermsBefore && !sellerTermsAccepted)} 
                    size="lg"
                    className="gap-2 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Se salvează...' : 'Salvează Setările Magazin'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Notificări removed - simplified to security tab */}

            {/* Tab Securitate */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Securitate</CardTitle>
                  <CardDescription>Gestionează securitatea contului</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Componenta pentru resetare/schimbare parolă */}
                    <PasswordReset userEmail={user?.email || ''} />

                    {/* Informații date private */}
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <EyeOff className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Protecția Datelor Personale</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Numărul tău de telefon și adresa sunt vizibile doar pentru tine. 
                              Aceste informații nu sunt partajate cu alți utilizatori sau vânzători fără acordul tău explicit.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
