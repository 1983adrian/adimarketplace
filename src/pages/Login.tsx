import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import cmarketLogo from '@/assets/cmarket-hero-clean.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedEmail = localStorage.getItem('cmarket_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({ 
        title: 'Câmpuri obligatorii', 
        description: 'Te rugăm să completezi email-ul și parola.', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (rememberMe) {
      localStorage.setItem('cmarket_remembered_email', email.trim());
    } else {
      localStorage.removeItem('cmarket_remembered_email');
    }
    
    if (error) {
      let message = error.message;
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email sau parolă incorectă.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Te rugăm să îți verifici email-ul înainte de a te autentifica.';
      }
      toast({ title: 'Eroare', description: message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    
    toast({ title: 'Succes!', description: 'Te-ai autentificat cu succes.' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border border-border shadow-xl bg-card">
        <CardHeader className="text-center pb-4">
          {/* Logo - Marketplace România */}
          <Link to="/" className="inline-flex flex-col items-center justify-center gap-3 mb-4 group">
            <img 
              src={cmarketLogo} 
              alt="Marketplace România" 
              className="h-16 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">Marketplace România</span>
            </div>
          </Link>
          
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              Bine ai revenit!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Autentifică-te pentru a continua
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2 pb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Parolă
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Ai uitat parola?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Login Button */}
            <Button 
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se autentifică...
                </span>
              ) : (
                'Autentifică-te'
              )}
            </Button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Conexiune securizată</span>
          </div>
          
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">sau</span>
            </div>
          </div>
          
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
