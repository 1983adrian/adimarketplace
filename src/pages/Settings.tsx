import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Bell, Shield, CreditCard, MapPin, Save, 
  Wallet, Truck, Package, Building2, Banknote, Plus, Check,
  DollarSign, Globe, Eye, EyeOff
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { PasswordReset } from '@/components/settings/PasswordReset';

const shippingCarriers = [
  { id: 'usps', name: 'USPS', logo: '📮', description: 'Serviciu Poștal SUA' },
  { id: 'ups', name: 'UPS', logo: '📦', description: 'United Parcel Service' },
  { id: 'fedex', name: 'FedEx', logo: '🚚', description: 'Federal Express' },
  { id: 'dhl', name: 'DHL', logo: '✈️', description: 'DHL Express' },
  { id: 'amazon', name: 'Amazon Logistics', logo: '📋', description: 'Livrare Amazon' },
  { id: 'ontrac', name: 'OnTrac', logo: '🏃', description: 'Curier Regional' },
  { id: 'lasership', name: 'LaserShip', logo: '⚡', description: 'Curier Regional' },
];

const Settings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Setări notificări
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [newListingAlerts, setNewListingAlerts] = useState(true);
  const [trackingAlerts, setTrackingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  // Setări plăți (cumpărător)
  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
  ]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('card');

  // Setări încasări (vânzător)
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [bankAccountAdded, setBankAccountAdded] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [minimumPayout, setMinimumPayout] = useState('50');

  // Setări curieri livrare
  const [selectedCarriers, setSelectedCarriers] = useState(['usps', 'ups', 'fedex']);
  const [defaultCarrier, setDefaultCarrier] = useState('usps');
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true);
  const [shippingLabelProvider, setShippingLabelProvider] = useState('integrated');

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
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profil actualizat cu succes' });
    }
  };

  const toggleCarrier = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    );
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
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden lg:inline">Plăți</span>
              </TabsTrigger>
              <TabsTrigger value="payouts" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden lg:inline">Încasări</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden lg:inline">Livrare</span>
              </TabsTrigger>
              <TabsTrigger value="seller" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">Vânzător</span>
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

            {/* Tab Plăți (Cumpărător) */}
            <TabsContent value="payments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Metode de Plată
                    </CardTitle>
                    <CardDescription>Gestionează cum plătești pentru achiziții</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {savedCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded flex items-center justify-center text-xs font-bold">
                            {card.brand}
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• {card.last4}</p>
                            <p className="text-sm text-muted-foreground">Expiră {card.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.isDefault && <Badge variant="secondary">Principal</Badge>}
                          <Button variant="ghost" size="sm">Șterge</Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Adaugă Card Nou
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alte Opțiuni de Plată</CardTitle>
                    <CardDescription>Modalități adiționale de plată</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">P</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">Plătește cu contul PayPal</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Conectează</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Apple Pay</p>
                          <p className="text-sm text-muted-foreground">Plată rapidă cu Apple Pay</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Activează</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Google Pay</p>
                          <p className="text-sm text-muted-foreground">Plată rapidă cu Google</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Activează</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Adresă de Facturare</CardTitle>
                    <CardDescription>Adresa implicită pentru plăți</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Adresă Stradă</Label>
                        <Input placeholder="Strada Exemplu nr. 123" />
                      </div>
                      <div className="space-y-2">
                        <Label>Apartament / Bloc</Label>
                        <Input placeholder="Apt 4B" />
                      </div>
                      <div className="space-y-2">
                        <Label>Oraș</Label>
                        <Input placeholder="București" />
                      </div>
                      <div className="space-y-2">
                        <Label>Județ</Label>
                        <Input placeholder="Ilfov" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cod Poștal</Label>
                        <Input placeholder="010101" />
                      </div>
                      <div className="space-y-2">
                        <Label>Țară</Label>
                        <Select defaultValue="ro">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ro">România</SelectItem>
                            <SelectItem value="md">Moldova</SelectItem>
                            <SelectItem value="us">Statele Unite</SelectItem>
                            <SelectItem value="uk">Marea Britanie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvează Adresa
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Încasări (Vânzător) */}
            <TabsContent value="payouts">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Setări Încasări
                    </CardTitle>
                    <CardDescription>Configurează cum primești plățile din vânzări</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Sold Disponibil</p>
                          <p className="text-3xl font-bold text-primary">0.00 RON</p>
                        </div>
                        <Button>Retrage</Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Metodă de Încasare</h4>
                      
                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'bank' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('bank')}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Cont Bancar</p>
                            <p className="text-sm text-muted-foreground">Transfer direct în bancă (2-3 zile)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bankAccountAdded ? (
                            <Badge className="bg-success">Conectat</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setBankAccountAdded(true); }}>Adaugă</Button>
                          )}
                          {payoutMethod === 'bank' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>

                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'paypal' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('paypal')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">Transfer instant în PayPal (se aplică taxe)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {paypalEmail ? (
                            <Badge className="bg-success">Conectat</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setPaypalEmail('user@email.com'); }}>Conectează</Button>
                          )}
                          {payoutMethod === 'paypal' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>

                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'debit' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('debit')}
                      >
                        <div className="flex items-center gap-3">
                          <Banknote className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Instant pe Card de Debit</p>
                            <p className="text-sm text-muted-foreground">Primești în minute (taxă 1.5%)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Adaugă Card</Button>
                          {payoutMethod === 'debit' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Program Încasări</h4>
                      <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Zilnic</SelectItem>
                          <SelectItem value="weekly">Săptămânal (În fiecare Luni)</SelectItem>
                          <SelectItem value="biweekly">Bi-Săptămânal</SelectItem>
                          <SelectItem value="monthly">Lunar</SelectItem>
                          <SelectItem value="manual">Doar Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Sumă Minimă pentru Încasare</h4>
                      <Select value={minimumPayout} onValueChange={setMinimumPayout}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Fără minim</SelectItem>
                          <SelectItem value="25">25 RON</SelectItem>
                          <SelectItem value="50">50 RON</SelectItem>
                          <SelectItem value="100">100 RON</SelectItem>
                          <SelectItem value="250">250 RON</SelectItem>
                          <SelectItem value="500">500 RON</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">Încasările vor fi efectuate doar când soldul depășește această sumă</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informații Fiscale</CardTitle>
                    <CardDescription>Necesare pentru vânzătorii cu venituri semnificative</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Declarație Fiscală</p>
                        <p className="text-sm text-muted-foreground">Identificare fiscală pentru vânzători</p>
                      </div>
                      <Button variant="outline" size="sm">Trimite</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Documente Fiscale Anuale</p>
                        <p className="text-sm text-muted-foreground">Vizualizează documentele fiscale anuale</p>
                      </div>
                      <Button variant="outline" size="sm">Vizualizează</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Livrare */}
            <TabsContent value="shipping">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Curieri Livrare
                    </CardTitle>
                    <CardDescription>Selectează curierii pe care îi folosești pentru expediere</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shippingCarriers.map((carrier) => (
                      <div 
                        key={carrier.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCarriers.includes(carrier.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleCarrier(carrier.id)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{carrier.logo}</span>
                          <div>
                            <p className="font-medium">{carrier.name}</p>
                            <p className="text-sm text-muted-foreground">{carrier.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedCarriers.includes(carrier.id) && defaultCarrier === carrier.id && (
                            <Badge>Principal</Badge>
                          )}
                          <Checkbox 
                            checked={selectedCarriers.includes(carrier.id)}
                            onCheckedChange={() => toggleCarrier(carrier.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Curier Principal</CardTitle>
                    <CardDescription>Alege curierul preferat pentru expedieri noi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={defaultCarrier} onValueChange={setDefaultCarrier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingCarriers.filter(c => selectedCarriers.includes(c.id)).map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            <span className="flex items-center gap-2">
                              <span>{carrier.logo}</span>
                              {carrier.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Urmărire Colete
                    </CardTitle>
                    <CardDescription>Configurează cum urmărești expedierile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Actualizări Automate de Urmărire</p>
                        <p className="text-sm text-muted-foreground">Primește notificări în timp real despre urmărire</p>
                      </div>
                      <Switch checked={autoTrackingEnabled} onCheckedChange={setAutoTrackingEnabled} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Trimite Urmărire către Cumpărători</p>
                        <p className="text-sm text-muted-foreground">Trimite automat informații de urmărire către cumpărători</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Confirmare Livrare</p>
                        <p className="text-sm text-muted-foreground">Primește notificare când coletele sunt livrate</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Etichete de Expediere</CardTitle>
                    <CardDescription>Cum creezi și tipărești etichetele de expediere</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={shippingLabelProvider} onValueChange={setShippingLabelProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Folosește Etichetele MarketPlace (Tarife reduse)</SelectItem>
                        <SelectItem value="shipstation">ShipStation</SelectItem>
                        <SelectItem value="shippo">Shippo</SelectItem>
                        <SelectItem value="pirateship">Pirate Ship</SelectItem>
                        <SelectItem value="manual">Îmi creez propriile etichete</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Folosind Etichetele MarketPlace primești reduceri de până la 90% din tarifele standard
                    </p>

                    <div className="p-4 rounded-lg bg-muted">
                      <h5 className="font-medium mb-2">Dimensiuni Etichete Suportate</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">4x6 Termică</Badge>
                        <Badge variant="outline">A4 Hârtie</Badge>
                        <Badge variant="outline">4x4 Etichetă</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Adresă Retur</CardTitle>
                    <CardDescription>Adresa ta pentru etichete de expediere și retururi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Firmă/Nume</Label>
                        <Input placeholder="Numele tău sau al firmei" />
                      </div>
                      <div className="space-y-2">
                        <Label>Adresă Stradă</Label>
                        <Input placeholder="Strada Exemplu nr. 123" />
                      </div>
                      <div className="space-y-2">
                        <Label>Oraș</Label>
                        <Input placeholder="București" />
                      </div>
                      <div className="space-y-2">
                        <Label>Județ / Cod Poștal</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Ilfov" className="w-20" />
                          <Input placeholder="010101" />
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvează Adresa de Retur
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Vânzător */}
            <TabsContent value="seller">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Vânzător</CardTitle>
                  <CardDescription>Gestionează profilul și preferințele de vânzător</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">Mod Vânzător</p>
                      <p className="text-sm text-muted-foreground">Activează pentru a lista articole de vânzare</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Setări Magazin</h4>
                    <div className="space-y-2">
                      <Label>Nume Magazin</Label>
                      <Input placeholder="Magazinul Meu Super" />
                    </div>
                    <div className="space-y-2">
                      <Label>Descriere Magazin</Label>
                      <Textarea placeholder="Spune-le cumpărătorilor despre magazinul tău..." rows={3} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Preferințe Listare</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Oferă ridicare locală</p>
                          <p className="text-sm text-muted-foreground">Permite cumpărătorilor să ridice articolele</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Oferă livrare</p>
                          <p className="text-sm text-muted-foreground">Expediază articolele către cumpărători</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Acceptă oferte</p>
                          <p className="text-sm text-muted-foreground">Permite cumpărătorilor să facă oferte pentru articole</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Notificări */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferințe Notificări</CardTitle>
                  <CardDescription>Alege ce notificări primești</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">General</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificări Email</p>
                        <p className="text-sm text-muted-foreground">Primește actualizări prin email</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alerte Mesaje</p>
                        <p className="text-sm text-muted-foreground">Primește notificare când primești mesaje</p>
                      </div>
                      <Switch checked={messageAlerts} onCheckedChange={setMessageAlerts} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Cumpărare</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alerte Scădere Preț</p>
                        <p className="text-sm text-muted-foreground">Notifică când articolele salvate scad în preț</p>
                      </div>
                      <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alerte Listări Noi</p>
                        <p className="text-sm text-muted-foreground">Notifică pentru articole noi în căutările tale</p>
                      </div>
                      <Switch checked={newListingAlerts} onCheckedChange={setNewListingAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Actualizări Urmărire Colet</p>
                        <p className="text-sm text-muted-foreground">Primește actualizări despre comenzile în tranzit</p>
                      </div>
                      <Switch checked={trackingAlerts} onCheckedChange={setTrackingAlerts} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Vânzare</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Plată Primită</p>
                        <p className="text-sm text-muted-foreground">Notifică când primești o plată</p>
                      </div>
                      <Switch checked={paymentAlerts} onCheckedChange={setPaymentAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Încasare Efectuată</p>
                        <p className="text-sm text-muted-foreground">Notifică când încasările sunt trimise în cont</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comandă Nouă</p>
                        <p className="text-sm text-muted-foreground">Notifică când cineva îți cumpără articolul</p>
                      </div>
                      <Switch defaultChecked />
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

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Autentificare în Doi Pași</p>
                        <p className="text-sm text-muted-foreground">Adaugă un strat suplimentar de securitate</p>
                      </div>
                      <Button variant="outline" size="sm">Activează</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Sesiuni Active</p>
                        <p className="text-sm text-muted-foreground">Vizualizează și gestionează dispozitivele conectate</p>
                      </div>
                      <Button variant="outline" size="sm">Vizualizează</Button>
                    </div>

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

                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50">
                      <div>
                        <p className="font-medium text-destructive">Șterge Contul</p>
                        <p className="text-sm text-muted-foreground">Șterge permanent contul tău</p>
                      </div>
                      <Button variant="destructive" size="sm">Șterge</Button>
                    </div>
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
