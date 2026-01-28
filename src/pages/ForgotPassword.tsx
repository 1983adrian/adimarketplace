import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      toast({
        title: 'Email invalid',
        description: 'Te rugăm să introduci o adresă de email validă.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to send password reset email
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: normalizedEmail },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Email trimis!',
        description: 'Verifică-ți inbox-ul (și folderul Spam) pentru linkul de resetare.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists or not for security
      setEmailSent(true);
      toast({
        title: 'Email trimis!',
        description: 'Dacă acest email există în sistem, vei primi un link de resetare.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Verifică-ți emailul</CardTitle>
            <CardDescription>
              Am trimis instrucțiuni de resetare a parolei la adresa ta de email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="mb-2">📧 Emailul a fost trimis de la:</p>
              <p className="font-medium text-foreground">Marketplace Romania</p>
              <p className="mt-2">Verifică și folderul Spam dacă nu găsești emailul.</p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Înapoi la autentificare
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Resetare parolă</CardTitle>
          <CardDescription>
            Introdu adresa de email pentru a primi un link de resetare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresa de email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se trimite...
                </>
              ) : (
                'Trimite link de resetare'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="inline h-4 w-4 mr-1" />
              Înapoi la autentificare
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
