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
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: storeName,
          is_seller: isSeller,
        })
        .eq('user_id', user?.id);

      if (error) throw error;
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
          <h1 className="text-3xl font-bold mb-8">Setări</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline">Limbă</span>
              </TabsTrigger>
              <TabsTrigger value="payouts" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden lg:inline">Încasări</span>
              </TabsTrigger>
              <TabsTrigger value="seller" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">Magazin</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden lg:inline">Alerte</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Securitate</span>
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

                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Se salvează...' : 'Salvează Modificările'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Limbă */}
            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Setări Limbă
                  </CardTitle>
                  <CardDescription>
                    Alege limba de afișare a platformei. Limba oficială este Română. 
                    Platforma detectează automat limba și moneda pe baza locației tale.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Limba Preferată</Label>
                      <Select 
                        value={selectedLanguage} 
                        onValueChange={(val) => {
                          setSelectedLanguage(val);
                          // Only RO and EN are fully supported
                          if (val === 'ro' || val === 'en') {
                            setLanguage(val as Language);
                            localStorage.setItem('preferredLanguage', val);
                            toast({ title: 'Limbă schimbată', description: `Limba a fost setată la ${EUROPEAN_LANGUAGES.find(l => l.code === val)?.name}` });
                          } else {
                            localStorage.setItem('preferredLanguage', val);
                            toast({ 
                              title: 'Limbă salvată', 
                              description: `Preferința ${EUROPEAN_LANGUAGES.find(l => l.code === val)?.name} a fost salvată. Traducerea completă este disponibilă doar pentru Română și English.`,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectează limba" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {EUROPEAN_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                                {(lang.code === 'ro' || lang.code === 'en') && (
                                  <Badge variant="secondary" className="text-xs ml-2">Complet</Badge>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Traducerea completă este disponibilă pentru Română și English. Celelalte limbi vor fi adăugate în curând.
                      </p>
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Detectare automată:</strong> Dacă nu ai setat manual o preferință, platforma va afișa limba și moneda 
                        bazate pe locația ta. De exemplu, din UK vezi în Engleză cu £, din România în Română cu Lei.
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h4 className="font-medium mb-2">Limba curentă</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {EUROPEAN_LANGUAGES.find(l => l.code === language)?.flag || '🌍'}
                        </span>
                        <span className="font-medium">
                          {EUROPEAN_LANGUAGES.find(l => l.code === language)?.name || language.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    </>
                  )}

                  <Button onClick={handleSaveSellerSettings} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Se salvează...' : 'Salvează Setările'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Notificări */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferințe Notificări</CardTitle>
                  <CardDescription>Alege ce notificări primești - preferințele se salvează automat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">General</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificări Email</p>
                        <p className="text-sm text-muted-foreground">Primește actualizări prin email</p>
                      </div>
                      <Switch 
                        checked={emailNotifications} 
                        onCheckedChange={(val) => {
                          setEmailNotifications(val);
                          saveNotificationPrefs('notification_email', val);
                        }} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alerte Mesaje</p>
                        <p className="text-sm text-muted-foreground">Primește notificare când primești mesaje</p>
                      </div>
                      <Switch 
                        checked={messageAlerts} 
                        onCheckedChange={(val) => {
                          setMessageAlerts(val);
                          saveNotificationPrefs('notification_messages', val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Comenzi</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alerte Comenzi</p>
                        <p className="text-sm text-muted-foreground">Notificări pentru statusul comenzilor</p>
                      </div>
                      <Switch 
                        checked={orderAlerts} 
                        onCheckedChange={(val) => {
                          setOrderAlerts(val);
                          saveNotificationPrefs('notification_orders', val);
                        }} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Plăți & Încasări</p>
                        <p className="text-sm text-muted-foreground">Notificări despre plăți primite și încasări</p>
                      </div>
                      <Switch 
                        checked={paymentAlerts} 
                        onCheckedChange={(val) => {
                          setPaymentAlerts(val);
                          saveNotificationPrefs('notification_payments', val);
                        }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
