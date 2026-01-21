import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import cmarketLogo from '@/assets/cmarket-hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load saved email if "remember me" was checked
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
    
    // Handle "Remember me" - save or clear email
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(215,30%,14%)] to-[hsl(215,30%,18%)] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* C.Market Logo */}
          <Link to="/" className="inline-flex flex-col items-center justify-center gap-3 mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300" />
              <img 
                src={cmarketLogo} 
                alt="C.Market" 
                className="h-20 w-auto relative z-10 drop-shadow-lg"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#4A90D9] via-[#5BA3EC] to-[#6BB5FF] bg-clip-text text-transparent">
                C
              </span>
              <span className="text-3xl font-bold text-foreground">.Market</span>
            </div>
          </Link>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold text-foreground">Bine ai revenit!</CardTitle>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Autentifică-te cu email-ul și parola ta
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresă de email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password field */}
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
                  className="pl-10 pr-10 h-12 rounded-xl"
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

            {/* Remember me checkbox */}
            <div className="flex items-center justify-between">
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
            </div>

            {/* Login Button */}
            <Button 
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Se autentifică...
                </span>
              ) : (
                'Autentifică-te'
              )}
            </Button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Conexiune securizată SSL</span>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">sau</span>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Nu ai cont?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors">
              Înregistrează-te gratuit
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
