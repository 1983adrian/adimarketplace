import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Save, Loader2, Globe, Store, Wallet, CheckCircle2
} from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';

const ProfileSettings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [storeName, setStoreName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      const p = profile as any;
      setStoreName(p.store_name || '');
      setPaypalEmail(p.paypal_email || '');
    }
  }, [user, profile, loading, navigate]);

  // Ensure profile exists on mount
  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data) {
        await supabase
          .from('profiles')
          .insert({ user_id: user.id, display_name: user.email?.split('@')[0] || 'User' });
      }
    };
    ensureProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const updateData: any = {
        display_name: displayName,
        username: username.trim() || null,
        bio,
        store_name: storeName.trim() || null,
        paypal_email: paypalEmail.trim() || null,
      };

      // Auto-activate seller mode when PayPal email is set
      if (paypalEmail.trim()) {
        updateData.is_seller = true;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Profil salvat cu succes!' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
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

  const hasPaypal = !!(profile as any)?.paypal_email;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Setări Profil
          </h1>
          <p className="text-muted-foreground">Informații personale, magazin și PayPal</p>
        </div>

        <div className="space-y-6">
          {/* Personal Info Card */}
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Informații Personale
              </CardTitle>
              <CardDescription>Avatar, nume și date de contact</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center pb-6 border-b">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url || null}
                  displayName={displayName || user?.email || 'User'}
                  userId={user?.id || ''}
                  onAvatarChange={(url) => {
                    if (profile) {
                      (profile as any).avatar_url = url || null;
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG sau GIF. Max 5MB.
                </p>
                {(profile as any)?.short_id && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">ID Utilizator:</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-sm font-mono font-bold">
                      #{(profile as any).short_id}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base font-medium">
                    Nume Afișat *
                  </Label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Numele tău afișat"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-medium">
                    Nume Utilizator
                  </Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@utilizator"
                    className="h-12"
                  />
                </div>
              </div>

              {/* Email - Read only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="h-12 bg-muted/50 text-muted-foreground" 
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium">
                  Descriere Profil / Magazin
                </Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Spune-le altora despre tine sau magazinul tău..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Store & PayPal Card */}
          <Card className="shadow-lg border-2 border-amber-500/30">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-500" />
                Magazin & PayPal
                {hasPaypal && (
                  <Badge variant="outline" className="text-green-600 border-green-400 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vânzător Activ
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Setează-ți numele magazinului și email-ul PayPal pentru a putea vinde
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                <Store className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Cum devii vânzător?</strong> Completează email-ul PayPal de mai jos și salvează. 
                  Contul tău va fi activat automat ca vânzător!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-base font-medium">
                  Nume Magazin
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Magazinul Meu"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalEmail" className="text-base font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[#0070ba]" />
                  Email PayPal *
                </Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="email@paypal.com"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Folosește adresa de email asociată contului tău PayPal. Plățile vor fi trimise aici.
                </p>
              </div>

              {!paypalEmail.trim() && (
                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                  <Wallet className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                    Nu ai cont PayPal?{' '}
                    <a
                      href="https://www.paypal.com/ro/webapps/mpp/account-selection"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      Deschide unul gratuit →
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="shadow-lg border-2">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  Limbă platformă
                </Label>
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
                  <SelectTrigger className="w-full max-w-xs h-12">
                    <SelectValue placeholder="Selectează limba" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">🇷🇴 Română</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            size="lg"
            className="w-full h-14 text-lg gap-2 shadow-lg"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Se salvează...' : 'Salvează Profil'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSettings;