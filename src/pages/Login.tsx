import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !password) {
      toast({
        title: 'Date incomplete',
        description: 'Te rugăm să completezi email-ul și parola.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Email sau parolă incorectă.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email sau parolă incorectă. Verifică datele și încearcă din nou.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Te rugăm să confirmi emailul înainte de a te autentifica.';
        }
        
        toast({
          title: 'Autentificare eșuată',
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Bine ai venit!',
        description: 'Te-ai autentificat cu succes.',
      });
      navigate('/');
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast({
        title: 'Eroare neașteptată',
        description: 'A apărut o problemă. Încearcă din nou.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin + '/',
      });

      if (result.error) {
        console.error('Google sign-in error:', result.error);
        toast({
          title: 'Eroare autentificare Google',
          description: result.error.message || 'Nu s-a putut conecta cu Google. Încearcă din nou.',
          variant: 'destructive',
        });
        setGoogleLoading(false);
        return;
      }

      // If redirected, the page will reload after OAuth flow
      if (!result.redirected) {
        toast({
          title: 'Bine ai venit!',
          description: 'Te-ai autentificat cu succes prin Google.',
        });
        navigate('/');
      }
    } catch (err) {
      console.error('Unexpected Google sign-in error:', err);
      toast({
        title: 'Eroare neașteptată',
        description: 'A apărut o problemă. Încearcă din nou.',
        variant: 'destructive',
      });
      setGoogleLoading(false);
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
        <CardHeader className="text-center pb-4">
          {/* Logo - Marketplace România */}
          <div className="mb-4">
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
        
        <CardContent className="pb-6 space-y-5">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Parolă</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Ai uitat parola?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Introdu parola"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se autentifică...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Autentifică-te cu Email
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">sau</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 border-2 border-border hover:bg-accent/50"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            {googleLoading ? 'Se conectează...' : 'Continuă cu Google'}
          </Button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Conexiune securizată</span>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Nu ai cont?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Înregistrează-te gratuit
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
