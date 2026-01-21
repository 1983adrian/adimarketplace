import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Loader2, Shield, CheckCircle, Star, Users, Package, ArrowRight,
  Mail, Lock, Eye, EyeOff, User, AlertCircle, XCircle, AlertTriangle
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
import cmarketLogo from '@/assets/cmarket-hero.png';

// Simple password strength calculator
const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; label: string; color: string; width: string } => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { strength: 'weak', label: 'Slabă', color: 'bg-red-500', width: 'w-1/4' };
  if (score <= 3) return { strength: 'medium', label: 'Medie', color: 'bg-yellow-500', width: 'w-2/4' };
  if (score <= 5) return { strength: 'strong', label: 'Puternică', color: 'bg-green-500', width: 'w-3/4' };
  return { strength: 'very-strong', label: 'Foarte puternică', color: 'bg-emerald-600', width: 'w-full' };
};

const BENEFITS = [
  { icon: Shield, text: 'Plăți 100% Securizate' },
  { icon: Package, text: 'Livrare Rapidă România' },
  { icon: Users, text: 'Comunitate de Încredere' },
  { icon: Star, text: 'Protecție Cumpărător' },
];

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
  const { toast } = useToast();

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
    // Validate email format
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
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          display_name: formData.displayName.trim(),
        },
      },
    });
    
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Această adresă de email este deja înregistrată.';
      }
      toast({ title: 'Eroare', description: message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    
    // Save email for "remember me" functionality
    if (rememberMe) {
      localStorage.setItem('cmarket_remembered_email', formData.email.trim());
    }
    
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(215,30%,8%)] via-[hsl(215,30%,12%)] to-[hsl(215,30%,16%)] p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Verifică-ți email-ul!</h2>
              <p className="text-muted-foreground">
                Am trimis un link de confirmare la adresa:
              </p>
              <p className="font-semibold text-primary">{formData.email}</p>
            </div>
            <Alert className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verifică și folderul de Spam dacă nu găsești email-ul în Inbox.
              </AlertDescription>
            </Alert>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Mergi la pagina de autentificare
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[hsl(215,30%,8%)] via-[hsl(215,30%,12%)] to-[hsl(215,30%,16%)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/30 to-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
      </div>

      {/* Left side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative z-10">
        <div className="max-w-md space-y-8">
          {/* Logo and tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={cmarketLogo} alt="C.Market" className="h-16 w-auto drop-shadow-2xl" />
              <div>
                <h1 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-[#4A90D9] via-[#5BA3EC] to-[#6BB5FF] bg-clip-text text-transparent">C</span>
                  <span className="text-white">.Market</span>
                </h1>
                <p className="text-muted-foreground">Marketplace-ul Românesc Premium</p>
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              De ce să alegi C.Market?
            </h2>
            <div className="grid gap-4">
              {BENEFITS.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300 hover:bg-white/10 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-white font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Utilizatori</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Produse</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">Satisfacție</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardHeader className="text-center pb-2 pt-6">
            {/* Mobile logo */}
            <Link to="/" className="lg:hidden inline-flex flex-col items-center justify-center gap-3 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300" />
                <img 
                  src={cmarketLogo} 
                  alt="C.Market" 
                  className="h-16 w-auto relative z-10 drop-shadow-lg"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#4A90D9] via-[#5BA3EC] to-[#6BB5FF] bg-clip-text text-transparent">
                  C
                </span>
                <span className="text-2xl font-bold text-foreground">.Market</span>
              </div>
            </Link>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle className="text-2xl font-bold text-foreground">Creează Cont Gratuit</CardTitle>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <CardDescription className="text-muted-foreground text-base">
                Înregistrează-te cu email-ul tău
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-6">
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
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresă de email
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
                    className="pl-10 h-11 rounded-xl"
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
                    className="pl-10 pr-10 h-11 rounded-xl"
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
                        calculatePasswordStrength(formData.password).strength === 'weak' && 'text-red-500',
                        calculatePasswordStrength(formData.password).strength === 'medium' && 'text-yellow-500',
                        calculatePasswordStrength(formData.password).strength === 'strong' && 'text-green-500',
                        calculatePasswordStrength(formData.password).strength === 'very-strong' && 'text-emerald-600'
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
                    className="pl-10 pr-10 h-11 rounded-xl"
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
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Parolele coincid
                  </p>
                )}
              </div>

              {/* Remember me checkbox */}
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

              {/* Terms and conditions */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Accept{' '}
                  <Link to="/terms-of-service" className="text-primary hover:underline font-medium">
                    Termenii și Condițiile
                  </Link>
                  {' '}și{' '}
                  <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                    Politica de Confidențialitate
                  </Link>
                </label>
              </div>

              {/* Signup Button */}
              <Button 
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading || !acceptTerms}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Se creează contul...
                  </span>
                ) : (
                  'Creează cont'
                )}
              </Button>
            </form>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Conexiune securizată SSL</span>
            </div>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">sau</span>
              </div>
            </div>
            
            {/* Login link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ai deja un cont C.Market?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                >
                  Autentifică-te
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
