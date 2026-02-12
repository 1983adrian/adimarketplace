import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import heroLogo from '@/assets/marketplace-logo-hero-clear.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="mb-4 flex justify-center">
            <img src={heroLogo} alt="Marketplace România" className="h-32 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
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
