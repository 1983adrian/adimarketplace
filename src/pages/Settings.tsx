import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Shield, Save, 
  Wallet, Package, EyeOff, Bell, BellOff,
  ChevronRight, Loader2, Globe, LogOut, 
  MessageSquare, ShoppingBag, CreditCard, Mail
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { PasswordReset } from '@/components/settings/PasswordReset';

const Settings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Notification preferences
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

  const saveNotificationPref = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(key, JSON.stringify(value));
    setter(value);
    toast({ title: value ? 'Notificare activată' : 'Notificare dezactivată' });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setIsSeller((profile as any).is_seller || false);
    }
  }, [user, profile, loading, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      username,
      bio,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profil actualizat cu succes ✓' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Setări Cont</h1>
          <p className="text-muted-foreground mt-1">Gestionează profilul, securitatea și preferințele tale</p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 gap-1.5 h-auto p-1.5 bg-muted/60 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificări</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Securitate</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ PROFIL ═══════════ */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Avatar & Info */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Informații Personale</CardTitle>
                <CardDescription>Avatar, nume și informații publice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center pb-4">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    displayName={displayName || user?.email || 'User'}
                    userId={user?.id || ''}
                    onAvatarChange={() => {}}
                  />
                  {(profile as any)?.short_id && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">ID:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        #{(profile as any).short_id}
                      </Badge>
                    </div>
                  )}
                </div>

                <Separator />
                
                {/* Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="font-medium">Nume Afișat *</Label>
                    <Input 
                      id="displayName" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Numele tău"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-medium">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@utilizator"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled className="h-11 bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-medium">Descriere</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Spune-le altora despre tine sau magazinul tău..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Limbă
                  </Label>
                  <Select 
                    value={language} 
                    onValueChange={(val) => {
                      if (val === 'ro' || val === 'en') {
                        setLanguage(val as Language);
                        localStorage.setItem('preferredLanguage', val);
                        toast({ title: val === 'ro' ? 'Limba: Română' : 'Language: English' });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full max-w-xs h-11">
                      <SelectValue />
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
                  className="w-full h-12 text-base gap-2 shadow-md"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {saving ? 'Se salvează...' : 'Salvează Profil'}
                </Button>
              </CardContent>
            </Card>

            {/* Seller Quick Access */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Store className="h-5 w-5 text-amber-500" />
                    Mod Vânzător
                  </CardTitle>
                  <CardDescription>
                    {isSeller ? 'Activ — gestionează din pagina dedicată' : 'Listează produse și câștigă bani'}
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent className="pt-4 space-y-3">
                <button 
                  onClick={() => navigate('/seller-mode')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isSeller ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{isSeller ? 'Setări Vânzător' : 'Activează Mod Vânzător'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isSeller ? 'PayPal, KYC, configurare' : 'Începe să vinzi acum'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isSeller ? "default" : "secondary"} className={isSeller ? "bg-green-500 hover:bg-green-500" : ""}>
                      {isSeller ? 'Activ' : 'Inactiv'}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {isSeller && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-12 gap-2"
                      onClick={() => navigate('/wallet')}
                    >
                      <Wallet className="h-4 w-4" />
                      Portofel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 gap-2"
                      onClick={() => navigate('/my-products')}
                    >
                      <Package className="h-4 w-4" />
                      Produse
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════ NOTIFICĂRI ═══════════ */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferințe Notificări
                </CardTitle>
                <CardDescription>Alege ce notificări vrei să primești</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {/* Email */}
                <NotificationRow
                  icon={<Mail className="h-5 w-5" />}
                  title="Notificări Email"
                  description="Primește notificări importante pe email"
                  checked={emailNotifications}
                  onCheckedChange={(v) => saveNotificationPref('notification_email', v, setEmailNotifications)}
                />
                <Separator />
                {/* Messages */}
                <NotificationRow
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="Mesaje Noi"
                  description="Alertă la mesaje noi de la cumpărători sau vânzători"
                  checked={messageAlerts}
                  onCheckedChange={(v) => saveNotificationPref('notification_messages', v, setMessageAlerts)}
                />
                <Separator />
                {/* Orders */}
                <NotificationRow
                  icon={<ShoppingBag className="h-5 w-5" />}
                  title="Comenzi"
                  description="Actualizări despre comenzile tale"
                  checked={orderAlerts}
                  onCheckedChange={(v) => saveNotificationPref('notification_orders', v, setOrderAlerts)}
                />
                <Separator />
                {/* Payments */}
                <NotificationRow
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Plăți"
                  description="Confirmări de plată și rambursări"
                  checked={paymentAlerts}
                  onCheckedChange={(v) => saveNotificationPref('notification_payments', v, setPaymentAlerts)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════ SECURITATE ═══════════ */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Securitate Cont
                </CardTitle>
                <CardDescription>Parola și protecția datelor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PasswordReset userEmail={user?.email || ''} />

                <Separator />

                <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <EyeOff className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Protecția Datelor</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Informațiile tale personale sunt vizibile doar pentru tine. Datele sensibile sunt criptate.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Sign Out */}
                <Button 
                  variant="outline" 
                  className="w-full h-12 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => navigate('/sign-out')}
                >
                  <LogOut className="h-5 w-5" />
                  Deconectare
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

/* ─── Notification Row Component ─── */
interface NotificationRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  icon, title, description, checked, onCheckedChange
}) => (
  <div className="flex items-center justify-between py-4 px-1">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default Settings;
