import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, Eye, EyeOff, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heroLogo from '@/assets/marketplace-logo-hero-clear.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'linear-gradient(135deg, hsl(220 70% 96%) 0%, hsl(240 60% 97%) 25%, hsl(280 40% 96%) 50%, hsl(220 70% 96%) 75%, hsl(200 60% 95%) 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse" 
        style={{ background: 'hsl(var(--primary) / 0.3)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" 
        style={{ background: 'hsl(260 60% 60% / 0.25)', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'hsl(var(--primary) / 0.15)' }} />

      {/* Main card with glassmorphism */}
      <div 
        className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div 
          className="rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
          style={{
            background: 'hsl(var(--card) / 0.85)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          }}
        >
          {/* Top accent line */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(260 60% 60%), hsl(var(--primary)))' }} />
          
          <div className="px-8 pt-10 pb-8 space-y-7">
            {/* Logo section */}
            <div className={`flex flex-col items-center transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="relative mb-2">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: 'hsl(var(--primary))' }} />
                <img 
                  src={heroLogo} 
                  alt="Marketplace România" 
                  className="h-28 w-auto object-contain relative z-10" 
                  style={{ mixBlendMode: 'multiply', filter: 'contrast(1.3) brightness(1.15)' }} 
                />
              </div>
            </div>

            {/* Welcome text */}
            <div className={`text-center space-y-2 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Bine ai revenit! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Autentifică-te pentru a continua
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} className={`space-y-5 transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-10 h-12 rounded-xl border-border/60 bg-background/60 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Parolă</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary/80 hover:text-primary transition-colors font-medium"
                  >
                    Ai uitat parola?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 rounded-xl border-border/60 bg-background/60 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg text-muted-foreground/60 hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-semibold text-[15px] shadow-lg hover:shadow-xl transition-all duration-300 gap-2 group"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(260 60% 55%) 100%)',
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se autentifică...
                  </>
                ) : (
                  <>
                    Autentifică-te
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Security + register */}
            <div className={`space-y-4 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <Shield className="h-3.5 w-3.5 text-emerald-500/80" />
                <span>Conexiune securizată & criptată</span>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 text-muted-foreground/50" style={{ background: 'hsl(var(--card) / 0.85)' }}>sau</span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Nu ai cont?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1">
                  Creează cont gratuit
                  <Sparkles className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Login;
