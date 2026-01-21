import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Loader2, Shield, CheckCircle, Star, Users, Package, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import cmarketLogo from '@/assets/cmarket-hero.png';

const BENEFITS = [
  { icon: Shield, text: 'Plăți 100% Securizate' },
  { icon: Package, text: 'Livrare Rapidă România' },
  { icon: Users, text: 'Comunitate de Încredere' },
  { icon: Star, text: 'Protecție Cumpărător' },
];

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignup = async () => {
    if (!acceptTerms) {
      toast({ 
        title: 'Termeni și Condiții', 
        description: 'Te rugăm să accepți termenii și condițiile pentru a continua.', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

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
                Înregistrează-te rapid cu contul tău Google
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-6">
            {/* Terms and conditions */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 mb-6">
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

            {/* Google Signup Button */}
            <Button 
              onClick={handleGoogleSignup}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200" 
              disabled={loading || !acceptTerms}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Se conectează...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Înregistrează-te cu Google
                </span>
              )}
            </Button>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Autentificare securizată prin Google</span>
            </div>
            
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
