import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, Loader2, 
  Shield, CheckCircle, Star, Users, Package, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import cmarketLogo from '@/assets/cmarket-hero.png';

const BENEFITS = [
  { icon: Shield, text: 'Plăți 100% Securizate' },
  { icon: Package, text: 'Livrare Rapidă România' },
  { icon: Users, text: 'Comunitate de Încredere' },
  { icon: Star, text: 'Protecție Cumpărător' },
];

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('weak');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validate, validateSync } = usePasswordValidation();

  // Validate password on change (sync validation for immediate feedback)
  useEffect(() => {
    if (password.length > 0) {
      const result = validateSync(password);
      setPasswordStrength(result.strength);
      setPasswordErrors(result.syncErrors);
    } else {
      setPasswordStrength('weak');
      setPasswordErrors([]);
    }
  }, [password, validateSync]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({ 
        title: 'Termeni și Condiții', 
        description: 'Te rugăm să accepți termenii și condițiile pentru a continua.', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Full async validation including leaked password check
    setValidating(true);
    const validationResult = await validate(password);
    setValidating(false);
    
    if (!validationResult.isValid) {
      setPasswordErrors(validationResult.errors);
      toast({ 
        title: 'Parolă invalidă', 
        description: validationResult.errors[0], 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cont creat cu succes! 🎉', description: 'Bine ai venit pe C.Market' });
      navigate('/');
    }
  };

  const isSubmitting = loading || validating;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[hsl(215,30%,8%)] via-[hsl(215,30%,12%)] to-[hsl(215,30%,16%)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/30 to-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-40 right-[20%] w-3 h-3 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-[30%] w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
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
                Începe să vinzi și să cumperi în câteva secunde
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Adresă Email</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@exemplu.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all" 
                    required 
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Parolă Securizată</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Creează o parolă puternică" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-12 pr-12 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all" 
                    required 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 rounded-lg transition-colors" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <PasswordStrengthIndicator 
                    strength={passwordStrength} 
                    errors={passwordErrors}
                    showErrors={true}
                  />
                )}
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
              
              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#4A90D9] to-[#5BA3EC] hover:from-[#3A80C9] hover:to-[#4B93DC] text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02] group" 
                disabled={isSubmitting || !acceptTerms}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {validating ? 'Se verifică securitatea...' : 'Se creează contul...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Creează Cont
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Protejat de criptare SSL 256-bit</span>
              </div>
            </form>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">sau</span>
              </div>
            </div>
            
            {/* Login link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Ai deja un cont C.Market?
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors group"
              >
                Autentifică-te acum
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
