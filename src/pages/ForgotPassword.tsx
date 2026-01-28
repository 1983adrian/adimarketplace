import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email necesar',
        description: 'Te rugăm să introduci adresa de email',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Normalizare email - lowercase și trim pentru a evita probleme
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // First try via our custom edge function for better email delivery
      const { data, error: edgeFnError } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: normalizedEmail, 
          resetUrl: `${window.location.origin}/reset-password` 
        }
      });
      
      console.log('Password reset response:', data);
      
      // Fallback to Supabase native if edge function fails
      if (edgeFnError) {
        console.log('Edge function failed, using Supabase native:', edgeFnError);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }

      setEmailSent(true);
      toast({
        title: 'Email trimis',
        description: 'Verifică-ți căsuța de email pentru link-ul de resetare',
      });
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <Card className="w-full max-w-md border border-border shadow-xl bg-card relative z-10">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Verifică-ți Email-ul</h2>
            <p className="text-muted-foreground">
              Am trimis un link de resetare a parolei la:
            </p>
            <p className="font-semibold text-primary">{email}</p>
            <p className="text-sm text-muted-foreground">
              Dacă nu vezi email-ul, verifică și folderul de spam.
            </p>
            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Trimite din nou
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Înapoi la Autentificare
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <Card className="w-full max-w-md border border-border shadow-xl bg-card relative z-10">
        <CardHeader className="text-center pb-4">
          {/* Logo - Marketplace România */}
          <div className="mb-2">
            <MarketplaceBrand size="md" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Ai uitat parola?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Introdu email-ul pentru a primi link-ul de resetare
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se trimite...
                </>
              ) : (
                'Trimite Link de Resetare'
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Link-ul expiră în 24 de ore</span>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">sau</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Înapoi la Autentificare
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};


export default ForgotPassword;
