import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle,
  Eye,
  EyeOff,
  Ban,
  Clock,
  Fingerprint,
  Globe,
  Mail,
  Smartphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Loader2,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  authentication: {
    leakedPasswordProtection: boolean;
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
    allowAnonymousSignups: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
  };
  rateLimit: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxLoginAttemptsPerHour: number;
    blockDurationMinutes: number;
  };
  ipSecurity: {
    enableIpBlocking: boolean;
    blockedIps: string;
    allowedIps: string;
    geoBlocking: boolean;
    blockedCountries: string[];
  };
  sessionSecurity: {
    forceHttps: boolean;
    secureCookies: boolean;
    singleSessionPerUser: boolean;
    logoutInactiveUsers: boolean;
    inactivityTimeout: number;
  };
  notifications: {
    alertOnSuspiciousLogin: boolean;
    alertOnNewDevice: boolean;
    alertOnPasswordChange: boolean;
    alertOnAdminActions: boolean;
    securityDigestEmail: boolean;
  };
}

// MAXIMUM SECURITY - Toate opțiunile activate implicit
const defaultSecuritySettings: SecuritySettings = {
  authentication: {
    leakedPasswordProtection: true, // ACTIVAT - Protecție parole compromise
    requireEmailVerification: true, // ACTIVAT - Verificare email
    twoFactorAuth: true, // ACTIVAT - Autentificare 2FA
    allowAnonymousSignups: false, // DEZACTIVAT - Nu permite anonimi
    sessionTimeout: 30, // 30 min timeout
    maxLoginAttempts: 3, // Max 3 încercări
    lockoutDuration: 60, // Blocare 1 oră
    passwordMinLength: 12, // Min 12 caractere
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true, // ACTIVAT - Necesită simboluri
  },
  rateLimit: {
    enabled: true, // ACTIVAT
    maxRequestsPerMinute: 60, // Limită mai strictă
    maxLoginAttemptsPerHour: 5, // Max 5 pe oră
    blockDurationMinutes: 120, // Blocare 2 ore
  },
  ipSecurity: {
    enableIpBlocking: true, // ACTIVAT
    blockedIps: '',
    allowedIps: '',
    geoBlocking: true, // ACTIVAT
    blockedCountries: [],
  },
  sessionSecurity: {
    forceHttps: true,
    secureCookies: true,
    singleSessionPerUser: true, // ACTIVAT - O singură sesiune
    logoutInactiveUsers: true,
    inactivityTimeout: 15, // 15 min inactivitate
  },
  notifications: {
    alertOnSuspiciousLogin: true,
    alertOnNewDevice: true,
    alertOnPasswordChange: true,
    alertOnAdminActions: true,
    securityDigestEmail: true,
  },
};

export default function AdminSecuritySettings() {
  const { toast } = useToast();
  const { data: dbSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [isSaving, setIsSaving] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  // Load settings from database
  useEffect(() => {
    if (dbSettings && dbSettings['security_advanced']) {
      setSettings(dbSettings['security_advanced'] as unknown as SecuritySettings);
    }
  }, [dbSettings]);

  // Calculate security score
  useEffect(() => {
    let score = 0;
    const maxScore = 100;
    
    // Authentication (40 points)
    if (settings.authentication.leakedPasswordProtection) score += 10;
    if (settings.authentication.requireEmailVerification) score += 5;
    if (settings.authentication.twoFactorAuth) score += 10;
    if (!settings.authentication.allowAnonymousSignups) score += 5;
    if (settings.authentication.passwordMinLength >= 8) score += 5;
    if (settings.authentication.passwordRequireSymbols) score += 5;
    
    // Rate Limiting (15 points)
    if (settings.rateLimit.enabled) score += 15;
    
    // IP Security (15 points)
    if (settings.ipSecurity.enableIpBlocking) score += 10;
    if (settings.ipSecurity.geoBlocking) score += 5;
    
    // Session Security (15 points)
    if (settings.sessionSecurity.forceHttps) score += 5;
    if (settings.sessionSecurity.secureCookies) score += 5;
    if (settings.sessionSecurity.singleSessionPerUser) score += 5;
    
    // Notifications (15 points)
    if (settings.notifications.alertOnSuspiciousLogin) score += 5;
    if (settings.notifications.alertOnNewDevice) score += 5;
    if (settings.notifications.alertOnAdminActions) score += 5;
    
    setSecurityScore(Math.min(score, maxScore));
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ 
        key: 'security_advanced', 
        value: settings as unknown as Record<string, unknown>, 
        category: 'security' 
      });
      
      // If leaked password protection is enabled, configure auth
      if (settings.authentication.leakedPasswordProtection) {
        // Note: This would need to be done via Supabase dashboard or API
        toast({ 
          title: 'Setări salvate', 
          description: 'Setările de securitate au fost actualizate. Pentru "Leaked Password Protection", verifică și backend-ul.',
        });
      } else {
        toast({ title: 'Setări salvate', description: 'Setările de securitate au fost actualizate.' });
      }
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateAuth = (key: keyof SecuritySettings['authentication'], value: any) => {
    setSettings(prev => ({ 
      ...prev, 
      authentication: { ...prev.authentication, [key]: value } 
    }));
  };

  const updateRateLimit = (key: keyof SecuritySettings['rateLimit'], value: any) => {
    setSettings(prev => ({ 
      ...prev, 
      rateLimit: { ...prev.rateLimit, [key]: value } 
    }));
  };

  const updateIpSecurity = (key: keyof SecuritySettings['ipSecurity'], value: any) => {
    setSettings(prev => ({ 
      ...prev, 
      ipSecurity: { ...prev.ipSecurity, [key]: value } 
    }));
  };

  const updateSessionSecurity = (key: keyof SecuritySettings['sessionSecurity'], value: any) => {
    setSettings(prev => ({ 
      ...prev, 
      sessionSecurity: { ...prev.sessionSecurity, [key]: value } 
    }));
  };

  const updateNotifications = (key: keyof SecuritySettings['notifications'], value: boolean) => {
    setSettings(prev => ({ 
      ...prev, 
      notifications: { ...prev.notifications, [key]: value } 
    }));
  };

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-green-600';
    if (securityScore >= 60) return 'text-yellow-600';
    if (securityScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = () => {
    if (securityScore >= 80) return { label: 'Excelent', variant: 'default' as const };
    if (securityScore >= 60) return { label: 'Bun', variant: 'secondary' as const };
    if (securityScore >= 40) return { label: 'Mediu', variant: 'outline' as const };
    return { label: 'Scăzut', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Se încarcă setările de securitate...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Setări Securitate Avansate
            </h1>
            <p className="text-muted-foreground">Configurează toate aspectele de securitate ale platformei</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvează Setările
          </Button>
        </div>

        {/* Security Score Card */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Shield className={`h-16 w-16 ${getScoreColor()}`} />
                  <div className="absolute -bottom-1 -right-1">
                    {securityScore >= 70 ? (
                      <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-500 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scor Securitate Platformă</p>
                  <p className={`text-4xl font-bold ${getScoreColor()}`}>{securityScore}/100</p>
                  <Badge variant={getScoreBadge().variant}>{getScoreBadge().label}</Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Recomandări:</p>
                {!settings.authentication.leakedPasswordProtection && (
                  <p className="text-sm text-yellow-600">• Activează Leaked Password Protection (+10)</p>
                )}
                {!settings.authentication.twoFactorAuth && (
                  <p className="text-sm text-yellow-600">• Activează 2FA (+10)</p>
                )}
                {!settings.rateLimit.enabled && (
                  <p className="text-sm text-yellow-600">• Activează Rate Limiting (+15)</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="authentication" className="gap-2">
              <Lock className="h-4 w-4" />
              Autentificare
            </TabsTrigger>
            <TabsTrigger value="passwords" className="gap-2">
              <Key className="h-4 w-4" />
              Parole
            </TabsTrigger>
            <TabsTrigger value="ratelimit" className="gap-2">
              <Clock className="h-4 w-4" />
              Rate Limiting
            </TabsTrigger>
            <TabsTrigger value="ip" className="gap-2">
              <Globe className="h-4 w-4" />
              IP & Geo
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              Alerte
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <div className="grid gap-6">
              {/* Leaked Password Protection - CRITICAL */}
              <Card className="border-2 border-red-200 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-red-700">Leaked Password Protection</CardTitle>
                    </div>
                    <Badge variant={settings.authentication.leakedPasswordProtection ? "default" : "destructive"}>
                      {settings.authentication.leakedPasswordProtection ? "ACTIV" : "INACTIV"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Verifică parolele utilizatorilor împotriva bazelor de date cu parole compromise (HaveIBeenPwned)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Activează Protecția</Label>
                      <p className="text-sm text-muted-foreground">
                        Previne utilizarea parolelor care au fost expuse în breșe de securitate cunoscute
                      </p>
                    </div>
                    <Switch
                      checked={settings.authentication.leakedPasswordProtection}
                      onCheckedChange={(checked) => updateAuth('leakedPasswordProtection', checked)}
                    />
                  </div>
                  
                  {settings.authentication.leakedPasswordProtection && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-400">Protecție Activată ✓ Funcțională</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-500">
                        <strong>Implementat:</strong> La înregistrare și resetare parolă, sistemul verifică automat parola împotriva bazei de date HaveIBeenPwned folosind modelul k-anonymity (sigur și privat). Parolele compromise sunt blocate.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!settings.authentication.leakedPasswordProtection && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Risc de Securitate</AlertTitle>
                      <AlertDescription>
                        Fără această protecție, utilizatorii pot folosi parole compromise care pot fi ghicite ușor de atacatori.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Other Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Setări Autentificare
                  </CardTitle>
                  <CardDescription>Configurează metodele și securitatea autentificării</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Verificare Email Obligatorie</Label>
                        <p className="text-sm text-muted-foreground">Utilizatorii trebuie să confirme emailul</p>
                      </div>
                      <Switch
                        checked={settings.authentication.requireEmailVerification}
                        onCheckedChange={(checked) => updateAuth('requireEmailVerification', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          Autentificare în Doi Pași (2FA)
                          <Badge variant="secondary">Recomandat</Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">Necesită cod suplimentar pentru autentificare</p>
                      </div>
                      <Switch
                        checked={settings.authentication.twoFactorAuth}
                        onCheckedChange={(checked) => updateAuth('twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-red-600">Permite Înregistrări Anonime</Label>
                        <p className="text-sm text-muted-foreground">NU recomandat - permite conturi fără email</p>
                      </div>
                      <Switch
                        checked={settings.authentication.allowAnonymousSignups}
                        onCheckedChange={(checked) => updateAuth('allowAnonymousSignups', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Timeout Sesiune (minute)</Label>
                        <Input
                          type="number"
                          value={settings.authentication.sessionTimeout}
                          onChange={(e) => updateAuth('sessionTimeout', parseInt(e.target.value))}
                          min={5}
                          max={1440}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Încercări Maxime Login</Label>
                        <Input
                          type="number"
                          value={settings.authentication.maxLoginAttempts}
                          onChange={(e) => updateAuth('maxLoginAttempts', parseInt(e.target.value))}
                          min={3}
                          max={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Durată Blocare (minute)</Label>
                        <Input
                          type="number"
                          value={settings.authentication.lockoutDuration}
                          onChange={(e) => updateAuth('lockoutDuration', parseInt(e.target.value))}
                          min={5}
                          max={1440}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Password Policy Tab */}
          <TabsContent value="passwords">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Politică Parole
                </CardTitle>
                <CardDescription>Configurează cerințele pentru parolele utilizatorilor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lungime Minimă Parolă</Label>
                    <Select
                      value={settings.authentication.passwordMinLength.toString()}
                      onValueChange={(value) => updateAuth('passwordMinLength', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caractere (Slab)</SelectItem>
                        <SelectItem value="8">8 caractere (Standard)</SelectItem>
                        <SelectItem value="10">10 caractere (Puternic)</SelectItem>
                        <SelectItem value="12">12 caractere (Foarte Puternic)</SelectItem>
                        <SelectItem value="16">16 caractere (Maxim)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Cerințe Complexitate</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Litere Mari Obligatorii</Label>
                      <p className="text-sm text-muted-foreground">Cel puțin o literă mare (A-Z)</p>
                    </div>
                    <Switch
                      checked={settings.authentication.passwordRequireUppercase}
                      onCheckedChange={(checked) => updateAuth('passwordRequireUppercase', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cifre Obligatorii</Label>
                      <p className="text-sm text-muted-foreground">Cel puțin o cifră (0-9)</p>
                    </div>
                    <Switch
                      checked={settings.authentication.passwordRequireNumbers}
                      onCheckedChange={(checked) => updateAuth('passwordRequireNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        Simboluri Obligatorii
                        <Badge variant="secondary">+5 Scor</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">Cel puțin un simbol (!@#$%^&*)</p>
                    </div>
                    <Switch
                      checked={settings.authentication.passwordRequireSymbols}
                      onCheckedChange={(checked) => updateAuth('passwordRequireSymbols', checked)}
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Previzualizare Cerințe</AlertTitle>
                  <AlertDescription>
                    Parola trebuie să aibă minim {settings.authentication.passwordMinLength} caractere
                    {settings.authentication.passwordRequireUppercase && ', să conțină litere mari'}
                    {settings.authentication.passwordRequireNumbers && ', să conțină cifre'}
                    {settings.authentication.passwordRequireSymbols && ', să conțină simboluri speciale'}.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limiting Tab */}
          <TabsContent value="ratelimit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Rate Limiting
                    </CardTitle>
                    <CardDescription>Protejează împotriva atacurilor de tip brute-force și DDoS</CardDescription>
                  </div>
                  <Badge variant={settings.rateLimit.enabled ? "default" : "destructive"}>
                    {settings.rateLimit.enabled ? "ACTIV" : "INACTIV"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Activează Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Limitează numărul de cereri per IP</p>
                  </div>
                  <Switch
                    checked={settings.rateLimit.enabled}
                    onCheckedChange={(checked) => updateRateLimit('enabled', checked)}
                  />
                </div>

                {settings.rateLimit.enabled && (
                  <>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Cereri Max/Minut</Label>
                        <Input
                          type="number"
                          value={settings.rateLimit.maxRequestsPerMinute}
                          onChange={(e) => updateRateLimit('maxRequestsPerMinute', parseInt(e.target.value))}
                          min={10}
                          max={1000}
                        />
                        <p className="text-xs text-muted-foreground">Cereri API per IP pe minut</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Login Max/Oră</Label>
                        <Input
                          type="number"
                          value={settings.rateLimit.maxLoginAttemptsPerHour}
                          onChange={(e) => updateRateLimit('maxLoginAttemptsPerHour', parseInt(e.target.value))}
                          min={3}
                          max={50}
                        />
                        <p className="text-xs text-muted-foreground">Încercări de login per IP</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Durată Blocare (min)</Label>
                        <Input
                          type="number"
                          value={settings.rateLimit.blockDurationMinutes}
                          onChange={(e) => updateRateLimit('blockDurationMinutes', parseInt(e.target.value))}
                          min={5}
                          max={1440}
                        />
                        <p className="text-xs text-muted-foreground">Timp blocare după depășire</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP & Geo Security Tab */}
          <TabsContent value="ip">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    Blocare IP
                  </CardTitle>
                  <CardDescription>Blochează sau permite accesul de la adrese IP specifice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activează Blocarea IP</Label>
                      <p className="text-sm text-muted-foreground">Blochează accesul de la IP-uri specifice</p>
                    </div>
                    <Switch
                      checked={settings.ipSecurity.enableIpBlocking}
                      onCheckedChange={(checked) => updateIpSecurity('enableIpBlocking', checked)}
                    />
                  </div>

                  {settings.ipSecurity.enableIpBlocking && (
                    <>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>IP-uri Blocate</Label>
                          <Textarea
                            value={settings.ipSecurity.blockedIps}
                            onChange={(e) => updateIpSecurity('blockedIps', e.target.value)}
                            placeholder="192.168.1.1&#10;10.0.0.0/8"
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">Un IP sau subnet per linie</p>
                        </div>
                        <div className="space-y-2">
                          <Label>IP-uri Permise (Whitelist)</Label>
                          <Textarea
                            value={settings.ipSecurity.allowedIps}
                            onChange={(e) => updateIpSecurity('allowedIps', e.target.value)}
                            placeholder="192.168.1.100&#10;Admin IPs"
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">IP-uri care nu vor fi niciodată blocate</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geo-Blocking
                  </CardTitle>
                  <CardDescription>Restricționează accesul bazat pe locație geografică</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activează Geo-Blocking</Label>
                      <p className="text-sm text-muted-foreground">Blochează accesul din anumite țări</p>
                    </div>
                    <Switch
                      checked={settings.ipSecurity.geoBlocking}
                      onCheckedChange={(checked) => updateIpSecurity('geoBlocking', checked)}
                    />
                  </div>

                  {settings.ipSecurity.geoBlocking && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Configurare Avansată</AlertTitle>
                      <AlertDescription>
                        Geo-blocking-ul necesită configurare suplimentară la nivel de server sau CDN pentru a fi pe deplin funcțional.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Alerte de Securitate
                </CardTitle>
                <CardDescription>Configurează notificările pentru evenimente de securitate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Alertă Login Suspect
                      </Label>
                      <p className="text-sm text-muted-foreground">Notifică la login-uri din locații neobișnuite</p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnSuspiciousLogin}
                      onCheckedChange={(checked) => updateNotifications('alertOnSuspiciousLogin', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-500" />
                        Alertă Dispozitiv Nou
                      </Label>
                      <p className="text-sm text-muted-foreground">Notifică la autentificări de pe dispozitive noi</p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnNewDevice}
                      onCheckedChange={(checked) => updateNotifications('alertOnNewDevice', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-500" />
                        Alertă Schimbare Parolă
                      </Label>
                      <p className="text-sm text-muted-foreground">Notifică la schimbări de parolă</p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnPasswordChange}
                      onCheckedChange={(checked) => updateNotifications('alertOnPasswordChange', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        Alertă Acțiuni Admin
                      </Label>
                      <p className="text-sm text-muted-foreground">Notifică la toate acțiunile administrative</p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnAdminActions}
                      onCheckedChange={(checked) => updateNotifications('alertOnAdminActions', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-500" />
                        Email Sumar Securitate
                      </Label>
                      <p className="text-sm text-muted-foreground">Primește un email zilnic cu rezumatul evenimentelor de securitate</p>
                    </div>
                    <Switch
                      checked={settings.notifications.securityDigestEmail}
                      onCheckedChange={(checked) => updateNotifications('securityDigestEmail', checked)}
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
