import React, { useState, useEffect } from 'react';
import { 
  Wallet, Globe, CheckCircle2, AlertCircle, Loader2, Save, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const PayoutSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [payoutBalance, setPayoutBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  useEffect(() => {
    fetchPayoutSettings();
  }, [user]);

  const fetchPayoutSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('paypal_email, payout_balance, pending_balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        const d = data as any;
        setPaypalEmail(d.paypal_email || '');
        setPayoutBalance(d.payout_balance || 0);
        setPendingBalance(d.pending_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ paypal_email: paypalEmail || null } as any)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ 
        title: 'Setări salvate', 
        description: 'Email-ul PayPal a fost actualizat cu succes.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Eroare', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Se încarcă setările de plată...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sold Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Sold Disponibil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">£{payoutBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Gata pentru transfer</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              În Așteptare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">£{pendingBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Se procesează</p>
          </CardContent>
        </Card>
      </div>

      {/* PayPal Section */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Cont PayPal Business
          </CardTitle>
          <CardDescription>Contul tău PayPal pentru încasarea banilor din vânzări</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email PayPal Business</Label>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="email@paypal.com"
            />
            <p className="text-xs text-muted-foreground">
              Tracking-ul comenzilor se trimite automat la PayPal când adaugi AWB.
            </p>
          </div>
          {paypalEmail ? (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">PayPal conectat ✅</AlertTitle>
              <AlertDescription>
                Contul PayPal ({paypalEmail}) este activ.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>PayPal neconfigurat</AlertTitle>
              <AlertDescription>
                Adaugă email-ul PayPal Business pentru a primi plăți.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Se salvează...' : 'Salvează Setările de Plată'}
      </Button>
    </div>
  );
};
