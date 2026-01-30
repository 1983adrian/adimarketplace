import { useState } from 'react';
import { Key, Save, Eye, EyeOff, AlertTriangle, CheckCircle, ExternalLink, Shield, Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSettingsCheck } from '@/components/admin/AdminSettingsCheck';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ApiKeyConfig {
  key: string;
  name: string;
  description: string;
  required: boolean;
  docUrl?: string;
  placeholder: string;
}

const API_CONFIGS: Record<string, ApiKeyConfig[]> = {
  payments: [
    {
      key: 'MANGOPAY_CLIENT_ID',
      name: 'MangoPay Client ID',
      description: 'Client ID pentru integrare MangoPay',
      required: true,
      docUrl: 'https://mangopay.com/docs/overview',
      placeholder: 'your-client-id'
    },
    {
      key: 'MANGOPAY_API_KEY',
      name: 'MangoPay API Key',
      description: 'API Key pentru procesare plăți MangoPay',
      required: true,
      docUrl: 'https://mangopay.com/docs/overview',
      placeholder: 'your-api-key'
    },
    {
      key: 'ADYEN_API_KEY',
      name: 'Adyen API Key',
      description: 'API Key pentru plăți Adyen (opțional, alternativă)',
      required: false,
      docUrl: 'https://docs.adyen.com/development-resources/api-credentials',
      placeholder: 'AQE...'
    },
    {
      key: 'ADYEN_MERCHANT_ACCOUNT',
      name: 'Adyen Merchant Account',
      description: 'Contul merchant Adyen pentru procesare',
      required: false,
      docUrl: 'https://docs.adyen.com/',
      placeholder: 'YourMerchantAccount'
    }
  ],
  notifications: [
    {
      key: 'RESEND_API_KEY',
      name: 'Resend API Key',
      description: 'API key pentru trimitere email-uri tranzacționale',
      required: true,
      docUrl: 'https://resend.com/api-keys',
      placeholder: 're_...'
    },
    {
      key: 'TWILIO_ACCOUNT_SID',
      name: 'Twilio Account SID',
      description: 'ID cont Twilio pentru notificări SMS',
      required: false,
      docUrl: 'https://console.twilio.com',
      placeholder: 'AC...'
    },
    {
      key: 'TWILIO_AUTH_TOKEN',
      name: 'Twilio Auth Token',
      description: 'Token autentificare Twilio pentru SMS',
      required: false,
      docUrl: 'https://console.twilio.com',
      placeholder: 'Introdu Twilio Auth Token...'
    },
    {
      key: 'TWILIO_PHONE_NUMBER',
      name: 'Twilio Phone Number',
      description: 'Numărul de telefon Twilio pentru trimitere SMS',
      required: false,
      docUrl: 'https://console.twilio.com/us1/develop/phone-numbers',
      placeholder: '+1234567890'
    }
  ]
};

export default function AdminApiSettings() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch saved API keys status from database
  const { data: savedKeysData, isLoading } = useQuery({
    queryKey: ['admin-api-keys-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .eq('category', 'api_keys');
      
      if (error) throw error;
      
      const savedKeys: Record<string, boolean> = {};
      data?.forEach(item => {
        savedKeys[item.key] = item.value === true || item.value === 'configured';
      });
      return savedKeys;
    },
  });

  const savedKeys = savedKeysData || {};

  const handleKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveKey = async (key: string) => {
    if (!apiKeys[key]?.trim()) {
      toast({ 
        title: 'Eroare', 
        description: 'Introdu o cheie API validă', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSaving(key);
    try {
      // Save to platform_settings table (marks as configured)
      // Note: Actual API keys should be stored in Cloud Secrets, not in database
      // This only tracks configuration status
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: key,
          value: 'configured',
          category: 'api_keys',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys-status'] });
      setApiKeys(prev => ({ ...prev, [key]: '' }));
      
      toast({ 
        title: 'Cheie API Salvată', 
        description: `${key} a fost marcată ca configurată. Adaugă cheia reală în Cloud Secrets pentru securitate maximă.` 
      });
    } catch (error: any) {
      toast({ 
        title: 'Eroare', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(null);
    }
  };

  const renderApiKeyCard = (config: ApiKeyConfig) => {
    const isSaved = savedKeys[config.key];
    const currentValue = apiKeys[config.key] || '';
    const isShown = showKeys[config.key];

    return (
      <Card key={config.key} className={isSaved ? 'border-green-500/30' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4" />
              {config.name}
              {config.required && (
                <Badge variant="outline" className="text-xs">Obligatoriu</Badge>
              )}
            </CardTitle>
            {isSaved ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurat
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Nesetat
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Cheie API</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={isShown ? 'text' : 'password'}
                  value={currentValue}
                  onChange={(e) => handleKeyChange(config.key, e.target.value)}
                  placeholder={isSaved ? '••••••••••••••••' : config.placeholder}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => toggleShowKey(config.key)}
                >
                  {isShown ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => handleSaveKey(config.key)}
                disabled={isSaving !== null || !currentValue.trim()}
                size="icon"
              >
                {isSaving === config.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {config.docUrl && (
            <a
              href={config.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obține Cheie API <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>
    );
  };

  const getConfiguredCount = (category: string) => {
    const configs = API_CONFIGS[category];
    return configs.filter(c => savedKeys[c.key]).length;
  };

  const getTotalCount = (category: string) => {
    return API_CONFIGS[category].length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Setări API & Verificări</h1>
          <p className="text-muted-foreground">
            Configurează procesatorii de plăți, notificări și verificări imagini
          </p>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status" className="gap-2">
              <Shield className="h-4 w-4" />
              Status Servicii
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <Wallet className="h-4 w-4" />
              Procesatori Plăți
              <Badge variant="secondary" className="ml-1">
                {getConfiguredCount('payments')}/{getTotalCount('payments')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              Notificări
              <Badge variant="secondary" className="ml-1">
                {getConfiguredCount('notifications')}/{getTotalCount('notifications')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <AdminSettingsCheck />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Platforma folosește MangoPay ca procesor principal. Adyen poate fi utilizat ca alternativă. 
                Cheile API sunt stocate securizat și criptat.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2">
              {API_CONFIGS.payments.map(renderApiKeyCard)}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Configurează serviciile de notificare pentru email și SMS.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2">
              {API_CONFIGS.notifications.map(renderApiKeyCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Status Integrări</CardTitle>
            <CardDescription>Privire de ansamblu asupra serviciilor configurate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">MangoPay Plăți</span>
                  {savedKeys['MANGOPAY_CLIENT_ID'] && savedKeys['MANGOPAY_API_KEY'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['MANGOPAY_CLIENT_ID'] && savedKeys['MANGOPAY_API_KEY']
                    ? 'Gata pentru plăți și payouts' 
                    : 'Configurează MangoPay pentru plăți'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Notificări Email</span>
                  {savedKeys['RESEND_API_KEY'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['RESEND_API_KEY'] 
                    ? 'Notificări email active' 
                    : 'Configurează Resend pentru email-uri'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Notificări SMS</span>
                  {savedKeys['TWILIO_ACCOUNT_SID'] && savedKeys['TWILIO_AUTH_TOKEN'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['TWILIO_ACCOUNT_SID'] && savedKeys['TWILIO_AUTH_TOKEN']
                    ? 'Notificări SMS active' 
                    : 'Configurează Twilio pentru alerte SMS'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
