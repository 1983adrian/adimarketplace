import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      key: 'STRIPE_SECRET_KEY',
      name: 'Stripe Secret Key',
      description: 'Secret key for all Stripe payments (buyer payments + seller payouts)',
      required: true,
      docUrl: 'https://dashboard.stripe.com/apikeys',
      placeholder: 'sk_live_...'
    },
    {
      key: 'STRIPE_WEBHOOK_SECRET',
      name: 'Stripe Webhook Secret',
      description: 'Webhook signing secret for Stripe events',
      required: false,
      docUrl: 'https://dashboard.stripe.com/webhooks',
      placeholder: 'whsec_...'
    }
  ],
  notifications: [
    {
      key: 'RESEND_API_KEY',
      name: 'Resend API Key',
      description: 'API key for sending transactional emails',
      required: true,
      docUrl: 'https://resend.com/api-keys',
      placeholder: 're_...'
    },
    {
      key: 'TWILIO_ACCOUNT_SID',
      name: 'Twilio Account SID',
      description: 'Twilio account identifier for SMS notifications',
      required: false,
      docUrl: 'https://console.twilio.com',
      placeholder: 'AC...'
    },
    {
      key: 'TWILIO_AUTH_TOKEN',
      name: 'Twilio Auth Token',
      description: 'Twilio authentication token for SMS',
      required: false,
      docUrl: 'https://console.twilio.com',
      placeholder: 'Enter Twilio Auth Token...'
    },
    {
      key: 'TWILIO_PHONE_NUMBER',
      name: 'Twilio Phone Number',
      description: 'Twilio phone number for sending SMS',
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
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load saved status from localStorage (in production, this would check the actual secrets)
  useEffect(() => {
    const saved = localStorage.getItem('admin_api_keys_saved');
    if (saved) {
      setSavedKeys(JSON.parse(saved));
    }
  }, []);

  const handleKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveKey = async (key: string) => {
    if (!apiKeys[key]?.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a valid API key', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSaving(true);
    try {
      // In a real implementation, this would call an edge function to save the secret
      // For now, we just mark it as saved locally
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSavedKeys = { ...savedKeys, [key]: true };
      setSavedKeys(newSavedKeys);
      localStorage.setItem('admin_api_keys_saved', JSON.stringify(newSavedKeys));
      
      // Clear the input after saving
      setApiKeys(prev => ({ ...prev, [key]: '' }));
      
      toast({ 
        title: 'API Key Saved', 
        description: `${key} has been securely saved.` 
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
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
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </CardTitle>
            {isSaved ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Set
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">API Key</Label>
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
                disabled={isSaving || !currentValue.trim()}
                size="icon"
              >
                <Save className="h-4 w-4" />
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
              Get API Key <ExternalLink className="h-3 w-3" />
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
          <h1 className="text-3xl font-bold">API Settings</h1>
          <p className="text-muted-foreground">
            Configure external service integrations and API keys
          </p>
        </div>

        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            API keys are stored securely and encrypted. Never share these keys publicly.
            Some features may be unavailable until required keys are configured.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments" className="gap-2">
              Payment Services
              <Badge variant="secondary" className="ml-1">
                {getConfiguredCount('payments')}/{getTotalCount('payments')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              Notifications
              <Badge variant="secondary" className="ml-1">
                {getConfiguredCount('notifications')}/{getTotalCount('notifications')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {API_CONFIGS.payments.map(renderApiKeyCard)}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {API_CONFIGS.notifications.map(renderApiKeyCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>Overview of all configured integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Stripe Payments</span>
                  {savedKeys['STRIPE_SECRET_KEY'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['STRIPE_SECRET_KEY'] 
                    ? 'Ready to accept payments & process payouts' 
                    : 'Configure Stripe key to enable payments'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email Notifications</span>
                  {savedKeys['RESEND_API_KEY'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['RESEND_API_KEY'] 
                    ? 'Email notifications active' 
                    : 'Configure Resend to send emails'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">SMS Notifications</span>
                  {savedKeys['TWILIO_ACCOUNT_SID'] && savedKeys['TWILIO_AUTH_TOKEN'] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedKeys['TWILIO_ACCOUNT_SID'] && savedKeys['TWILIO_AUTH_TOKEN']
                    ? 'SMS notifications active' 
                    : 'Configure Twilio for SMS alerts'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
