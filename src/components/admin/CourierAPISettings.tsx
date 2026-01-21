import React, { useState } from 'react';
import { Settings, Truck, Key, Save, TestTube, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CourierConfig {
  id: string;
  name: string;
  logo: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    required: boolean;
  }[];
  docUrl: string;
}

const COURIER_CONFIGS: CourierConfig[] = [
  {
    id: 'fan_courier',
    name: 'FAN Courier',
    logo: '🚚',
    description: 'Cel mai popular curier din România cu FANbox locker',
    fields: [
      { key: 'username', label: 'Username API', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'password', label: 'Password API', type: 'password', placeholder: '••••••••', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '12345', required: true },
    ],
    docUrl: 'https://www.fancourier.ro/integrari-api/',
  },
  {
    id: 'sameday',
    name: 'Sameday',
    logo: '⚡',
    description: 'Livrare rapidă cu Easybox locker network',
    fields: [
      { key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    ],
    docUrl: 'https://sameday.ro/integrari/',
  },
  {
    id: 'cargus',
    name: 'Cargus',
    logo: '📦',
    description: 'Ship & Go pickup points și livrare națională',
    fields: [
      { key: 'apiKey', label: 'Subscription Key (Ocp-Apim)', type: 'password', placeholder: '••••••••', required: true },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    ],
    docUrl: 'https://www.cargus.ro/integrari/',
  },
  {
    id: 'dpd',
    name: 'DPD Romania',
    logo: '🔴',
    description: 'Rețea europeană cu DPD Pickup points',
    fields: [
      { key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      { key: 'clientId', label: 'Client Number', type: 'text', placeholder: '123456', required: true },
    ],
    docUrl: 'https://www.dpd.ro/',
  },
  {
    id: 'gls',
    name: 'GLS Romania',
    logo: '🟡',
    description: 'Flexibilitate în livrare cu tracking avansat',
    fields: [
      { key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '123456', required: true },
    ],
    docUrl: 'https://gls-group.eu/RO/ro/home',
  },
];

export const CourierAPISettings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fan_courier');
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [enabledCouriers, setEnabledCouriers] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const [saving, setSaving] = useState(false);

  // Load existing credentials on mount
  React.useEffect(() => {
    const loadCredentials = async () => {
      for (const courier of COURIER_CONFIGS) {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('category', 'courier_api')
          .eq('key', `${courier.id}_credentials`)
          .single();
        
        if (data?.value) {
          const creds = data.value as Record<string, string>;
          setCredentials(prev => ({ ...prev, [courier.id]: creds }));
          setEnabledCouriers(prev => ({ ...prev, [courier.id]: !!creds.enabled }));
        }
      }
    };
    
    loadCredentials();
  }, []);

  const updateCredential = (courierId: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [courierId]: {
        ...prev[courierId],
        [field]: value,
      },
    }));
  };

  const testConnection = async (courierId: string) => {
    setTesting(courierId);
    setTestResults(prev => ({ ...prev, [courierId]: null }));

    try {
      const { data, error } = await supabase.functions.invoke('courier-lockers', {
        body: { courier: courierId, action: 'list' },
      });

      if (error || data?.isDemo) {
        setTestResults(prev => ({ ...prev, [courierId]: 'error' }));
        toast({
          title: 'Conexiune eșuată',
          description: data?.message || 'Nu s-a putut conecta la API-ul curierului',
          variant: 'destructive',
        });
      } else {
        setTestResults(prev => ({ ...prev, [courierId]: 'success' }));
        toast({
          title: 'Conexiune reușită!',
          description: `S-au găsit ${data?.lockers?.length || 0} puncte de ridicare`,
        });
      }
    } catch (e) {
      setTestResults(prev => ({ ...prev, [courierId]: 'error' }));
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut testa conexiunea',
        variant: 'destructive',
      });
    }

    setTesting(null);
  };

  const saveCredentials = async (courierId: string) => {
    setSaving(true);

    try {
      const creds = {
        ...credentials[courierId],
        enabled: enabledCouriers[courierId],
      };

      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          category: 'courier_api',
          key: `${courierId}_credentials`,
          value: creds,
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: 'Salvat!',
        description: 'Credențialele au fost salvate cu succes',
      });
    } catch (e) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva credențialele',
        variant: 'destructive',
      });
    }

    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Integrare API Curieri România
        </CardTitle>
        <CardDescription>
          Configurează credențialele API pentru fiecare curier pentru a activa generare AWB și tracking automat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            {COURIER_CONFIGS.map(courier => (
              <TabsTrigger key={courier.id} value={courier.id} className="text-xs sm:text-sm">
                <span className="mr-1">{courier.logo}</span>
                <span className="hidden sm:inline">{courier.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {COURIER_CONFIGS.map(courier => (
            <TabsContent key={courier.id} value={courier.id} className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{courier.logo}</span>
                    {courier.name}
                    {testResults[courier.id] === 'success' && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectat
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{courier.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enable-${courier.id}`} className="text-sm">Activat</Label>
                  <Switch
                    id={`enable-${courier.id}`}
                    checked={enabledCouriers[courier.id] || false}
                    onCheckedChange={(checked) => setEnabledCouriers(prev => ({ ...prev, [courier.id]: checked }))}
                  />
                </div>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Obține credențialele API din contul tău de partener{' '}
                  <a href={courier.docUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                    {courier.name}
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                {courier.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`${courier.id}-${field.key}`}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`${courier.id}-${field.key}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={credentials[courier.id]?.[field.key] || ''}
                      onChange={(e) => updateCredential(courier.id, field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => testConnection(courier.id)}
                  disabled={testing === courier.id}
                >
                  {testing === courier.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testează Conexiunea
                </Button>
                <Button onClick={() => saveCredentials(courier.id)} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvează Credențiale
                </Button>
              </div>

              {testResults[courier.id] === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Conexiunea a eșuat. Verifică credențialele și încearcă din nou.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
