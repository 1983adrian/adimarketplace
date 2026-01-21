import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import cmarketLogo from '@/assets/cmarket-hero.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('weak');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validate, validateSync } = usePasswordValidation();

  useEffect(() => {
    // Verifică dacă utilizatorul a venit de pe un link de resetare
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      toast({
        title: 'Link invalid',
        description: 'Te rugăm să folosești link-ul din email',
        variant: 'destructive',
      });
    }
  }, [toast]);

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

    if (password !== confirmPassword) {
      toast({
        title: 'Parolele nu se potrivesc',
        description: 'Asigură-te că ambele parole sunt identice',
        variant: 'destructive',
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
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Parolă actualizată',
        description: 'Parola ta a fost schimbată cu succes',
      });

      // Redirect către login după 2 secunde
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || validating;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(215,30%,14%)] to-[hsl(215,30%,18%)] p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Parolă Actualizată!</h2>
              <p className="text-muted-foreground">
                Vei fi redirecționat către pagina de autentificare...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(215,30%,14%)] to-[hsl(215,30%,18%)] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="inline-flex flex-col items-center justify-center gap-3 mb-4 group">
            <img 
              src={cmarketLogo} 
              alt="C.Market" 
              className="h-16 w-auto drop-shadow-lg"
            />
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4A90D9] via-[#5BA3EC] to-[#6BB5FF] bg-clip-text text-transparent">
                C
              </span>
              <span className="text-2xl font-bold text-foreground">.Market</span>
            </div>
          </Link>
          <CardTitle className="text-2xl">Resetează Parola</CardTitle>
          <CardDescription>Introdu noua ta parolă securizată</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Parolă Nouă</Label>
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 rounded-lg"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmă Parola</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Parolele nu se potrivesc</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#4A90D9] to-[#5BA3EC] hover:from-[#3A80C9] hover:to-[#4B93DC] text-white font-semibold rounded-xl shadow-lg transition-all" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {validating ? 'Se verifică parola...' : 'Se salvează...'}
                </span>
              ) : (
                'Salvează Parola Nouă'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Îți amintești parola?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Autentifică-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
