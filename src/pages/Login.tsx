import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: 'Eroare autentificare Google',
          description: error.message || 'Nu s-a putut conecta cu Google. Încearcă din nou.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected Google sign-in error:', err);
      toast({
        title: 'Eroare neașteptată',
        description: 'A apărut o problemă. Încearcă din nou.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border border-border shadow-xl bg-card">
        <CardHeader className="text-center pb-6">
          {/* Logo - Marketplace România */}
          <div className="mb-6">
            <MarketplaceBrand size="md" variant="default" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Bine ai venit!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Autentifică-te pentru a continua pe platformă
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8 space-y-6">
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 gap-3 border-2 border-border hover:bg-accent/50 text-base font-medium"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? 'Se conectează...' : 'Continuă cu Google'}
          </Button>

          {/* Info about account */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              📱 Folosește contul tău <span className="font-semibold text-foreground">Google</span> sau <span className="font-semibold text-foreground">iCloud</span> (Apple) pentru autentificare rapidă și sigură.
            </p>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Conexiune securizată OAuth 2.0</span>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            Prin autentificare, accepți{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Termenii și Condițiile
            </Link>
            {' '}și{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Politica de Confidențialitate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
