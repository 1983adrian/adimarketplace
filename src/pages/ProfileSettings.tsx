import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Save, EyeOff, Loader2, Globe
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { AvatarUpload } from '@/components/settings/AvatarUpload';

const ProfileSettings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  const [phone, setPhone] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      
      setPhone(profile.phone || '');
    }
  }, [user, profile, loading, navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      username,
      bio,
      phone,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profil salvat cu succes!' });
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
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Setări Profil
          </h1>
          <p className="text-muted-foreground">Informații personale și preferințe</p>
        </div>

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
                onAvatarChange={(url) => {}}
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG sau GIF. Max 5MB.
              </p>
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

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-base font-medium">
                Telefon
                <Badge variant="outline" className="text-xs gap-1 font-normal">
                  <EyeOff className="h-3 w-3" />
                  Privat
                </Badge>
              </Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className="h-12"
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

            <Separator />

            {/* Language Selector */}
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

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              size="lg"
              className="w-full h-14 text-lg gap-2 shadow-lg mt-4"
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
      </div>
    </Layout>
  );
};

export default ProfileSettings;
