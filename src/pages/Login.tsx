import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import cmarketLogo from '@/assets/cmarket-hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Bine ai revenit!' });
      navigate('/');
    }
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
              Autentifică-te în contul tău pentru a continua
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Parolă</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
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
            </div>
            
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                Ai uitat parola?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#4A90D9] to-[#5BA3EC] hover:from-[#3A80C9] hover:to-[#4B93DC] text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Se autentifică...
                </span>
              ) : (
                'Autentificare'
              )}
            </Button>
          </form>
          
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
