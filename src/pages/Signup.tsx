import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, UserPlus, Eye, EyeOff, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Mandatory acceptance checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptSellerRules, setAcceptSellerRules] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateSync } = usePasswordValidation();

  // Validate password on change
  const passwordValidation = useMemo(() => {
    if (!password) return { strength: 'weak' as const, errors: [] };
    return validateSync(password);
  }, [password, validateSync]);

  // Check if all mandatory checkboxes are accepted
  const allAccepted = acceptTerms && acceptPrivacy && acceptSellerRules;

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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allAccepted) {
      toast({
        title: 'Acceptare obligatorie',
        description: 'Trebuie să accepți Termenii, Politica de Confidențialitate și Regulamentul Vânzătorilor pentru a crea un cont.',
        variant: 'destructive',
      });
      return;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !password) {
      toast({
        title: 'Date incomplete',
        description: 'Te rugăm să completezi toate câmpurile.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Parolele nu coincid',
        description: 'Te rugăm să verifici că parolele introduse sunt identice.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Parolă prea scurtă',
        description: 'Parola trebuie să aibă cel puțin 8 caractere.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordValidation.errors.length > 0) {
      toast({
        title: 'Parolă invalidă',
        description: passwordValidation.errors[0],
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'Nu am putut crea contul. Încearcă din nou.';
        if (error.message.includes('already registered')) {
          errorMessage = 'Acest email este deja înregistrat. Încearcă să te autentifici sau resetează parola.';
        } else if (error.message.includes('weak password')) {
          errorMessage = 'Parola este prea slabă. Alege o parolă mai puternică.';
        }
        
        toast({
          title: 'Eroare la înregistrare',
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Cont creat cu succes!',
        description: 'Bine ai venit pe Marketplace Romania!',
      });
      navigate('/');
    } catch (err) {
      console.error('Unexpected signup error:', err);
      toast({
        title: 'Eroare neașteptată',
        description: 'A apărut o problemă. Încearcă din nou.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!allAccepted) {
      toast({
        title: 'Acceptare obligatorie',
        description: 'Trebuie să accepți Termenii, Politica de Confidențialitate și Regulamentul Vânzătorilor pentru a crea un cont.',
        variant: 'destructive',
      });
      return;
    }
    
    setGoogleLoading(true);
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
        setGoogleLoading(false);
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
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              Creează Cont
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Înregistrează-te gratuit pentru a cumpăra și vinde
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6 space-y-5">
          {/* Mandatory Checkboxes - MUST accept before signup */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              Pentru a crea un cont, trebuie să accepți:
            </p>
            
            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Am citit și accept{' '}
                <Link to="/terms" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  Termenii și Condițiile
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>

            {/* Privacy checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-privacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="accept-privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Am citit și accept{' '}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  Politica de Confidențialitate
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>

            {/* Seller Rules checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-seller-rules"
                checked={acceptSellerRules}
                onCheckedChange={(checked) => setAcceptSellerRules(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="accept-seller-rules" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Am citit și accept{' '}
                <Link to="/seller-rules" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  Regulamentul pentru Vânzători
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>
          </div>

          {/* Google Sign In Button - Primary */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 border-2 border-border hover:bg-accent/50"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !allAccepted}
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
            {googleLoading ? 'Se creează contul...' : 'Înregistrează-te cu Google'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">sau cu email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
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
              <Label htmlFor="password">Parolă</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minim 8 caractere"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {password && (
                <PasswordStrengthIndicator 
                  strength={passwordValidation.strength} 
                  errors={passwordValidation.errors}
                  showErrors={true}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmă parola</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repetă parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Parolele nu coincid</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || password.length < 8 || password !== confirmPassword || !allAccepted}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se creează contul...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Creează cont cu Email
                </>
              )}
            </Button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Conexiune securizată</span>
          </div>

          {/* Already have account */}
          <p className="text-center text-sm text-muted-foreground">
            Ai deja cont?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Autentifică-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
