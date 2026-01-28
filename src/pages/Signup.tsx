import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Shield, CheckCircle, Mail, Lock, Eye, EyeOff, User, AlertCircle, ArrowRight, Chrome
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

// Google Sign In Button Component
const GoogleSignInButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      }
    } catch (err) {
      console.error('Unexpected Google sign-in error:', err);
      toast({
        title: 'Eroare neașteptată',
        description: 'A apărut o problemă. Încearcă din nou.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-3 border-border hover:bg-accent/50"
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
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
      Continuă cu Google
    </Button>
  );
};

const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; label: string; color: string; width: string } => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { strength: 'weak', label: 'Slabă', color: 'bg-destructive', width: 'w-1/4' };
  if (score <= 3) return { strength: 'medium', label: 'Medie', color: 'bg-warning', width: 'w-2/4' };
  if (score <= 5) return { strength: 'strong', label: 'Puternică', color: 'bg-success', width: 'w-3/4' };
  return { strength: 'very-strong', label: 'Foarte puternică', color: 'bg-success', width: 'w-full' };
};

const Signup = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      toast({ title: 'Eroare', description: 'Te rugăm să introduci numele tău.', variant: 'destructive' });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: 'Eroare', description: 'Te rugăm să introduci o adresă de email.', variant: 'destructive' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Eroare', description: 'Te rugăm să introduci o adresă de email validă.', variant: 'destructive' });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Eroare', description: 'Parola trebuie să aibă cel puțin 6 caractere.', variant: 'destructive' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Eroare', description: 'Parolele nu coincid.', variant: 'destructive' });
      return false;
    }
    if (!acceptTerms) {
      toast({ title: 'Eroare', description: 'Te rugăm să accepți termenii și condițiile.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Normalize email
    const normalizedEmail = formData.email.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.displayName.trim(),
          },
        },
      });
      
      if (error) {
        let message = error.message;
        let description = '';
        
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          message = 'Email deja înregistrat';
          description = 'Această adresă de email este deja înregistrată. Încearcă să te autentifici.';
        } else if (error.message.includes('invalid') || error.message.includes('Invalid email')) {
          message = 'Email invalid';
          description = 'Te rugăm să introduci o adresă de email validă.';
        } else if (error.message.includes('weak_password') || error.message.includes('Password')) {
          message = 'Parolă prea slabă';
          description = 'Parola trebuie să aibă cel puțin 6 caractere.';
        } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
          message = 'Prea multe încercări';
          description = 'Așteaptă câteva minute înainte de a încerca din nou.';
        }
        
        toast({ title: message, description: description || error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      
      if (rememberMe) {
        localStorage.setItem('cmarket_remembered_email', normalizedEmail);
      }
      
      // Check if auto-confirm is enabled (user has session immediately)
      if (data?.session) {
        toast({ 
          title: 'Cont creat cu succes!', 
          description: 'Bine ai venit pe platformă!',
          className: 'bg-green-500 text-white border-green-600',
        });
        navigate('/');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      toast({ 
        title: 'Eroare neașteptată', 
        description: 'A apărut o problemă. Încearcă din nou.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border border-border shadow-xl bg-card">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Verifică-ți email-ul!</h2>
              <p className="text-muted-foreground text-sm">
                Am trimis un link de confirmare la:
              </p>
              <p className="font-semibold text-primary">{formData.email}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Verifică și folderul de Spam dacă nu găsești email-ul.
              </AlertDescription>
            </Alert>
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Mergi la autentificare
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border border-border shadow-xl bg-card">
        <CardHeader className="text-center pb-4">
          {/* Logo - Marketplace România */}
          <div className="mb-4">
            <MarketplaceBrand size="md" />
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              Creează Cont Gratuit
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Înregistrează-te pentru a cumpăra și vinde
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2 pb-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Nume complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Ion Popescu"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Parolă
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minim 6 caractere"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Putere parolă</span>
                    <span className={cn(
                      'font-medium',
                      calculatePasswordStrength(formData.password).strength === 'weak' && 'text-destructive',
                      calculatePasswordStrength(formData.password).strength === 'medium' && 'text-warning',
                      (calculatePasswordStrength(formData.password).strength === 'strong' || calculatePasswordStrength(formData.password).strength === 'very-strong') && 'text-success'
                    )}>
                      {calculatePasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn(
                      'h-full transition-all duration-300 rounded-full',
                      calculatePasswordStrength(formData.password).color,
                      calculatePasswordStrength(formData.password).width
                    )} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmă parola
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repetă parola"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Parolele nu coincid</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Parolele coincid
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Ține-mă minte
              </label>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label
                htmlFor="acceptTerms"
                className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed"
              >
                Accept{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Termenii și Condițiile
                </Link>
                {' '}și{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Politica de Confidențialitate
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <Button 
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se creează contul...
                </span>
              ) : (
                'Creează Cont'
              )}
            </Button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Datele tale sunt în siguranță</span>
          </div>
          
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">sau</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <GoogleSignInButton />
          
          <p className="text-center text-sm text-muted-foreground mt-4">
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
