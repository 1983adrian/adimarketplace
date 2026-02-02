import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield, UserPlus, Eye, EyeOff, Mail, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Mandatory acceptance checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptSellerRules, setAcceptSellerRules] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { validateSync } = usePasswordValidation();
  const { getLocalizedHref, navigateTo } = useLocalizedNavigation();

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
        navigateTo('/');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigateTo]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allAccepted) {
      toast({
        title: t('signup.acceptRequired'),
        description: t('signup.acceptRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !password) {
      toast({
        title: t('signup.incompleteData'),
        description: t('signup.incompleteDataDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('signup.passwordsNoMatch'),
        description: t('signup.passwordsNoMatch'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t('signup.passwordTooShort'),
        description: t('signup.passwordTooShortDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (passwordValidation.errors.length > 0) {
      toast({
        title: t('signup.invalidPassword'),
        description: passwordValidation.errors[0],
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = t('signup.couldNotCreate');
        if (error.message.includes('already registered')) {
          errorMessage = t('signup.alreadyRegistered');
        } else if (error.message.includes('weak password')) {
          errorMessage = t('signup.weakPassword');
        }
        
        toast({
          title: t('signup.signupError'),
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: t('signup.accountCreated'),
        description: t('signup.welcomeMessage'),
      });
      navigateTo('/');
    } catch (err) {
      console.error('Unexpected signup error:', err);
      toast({
        title: t('signup.unexpectedError'),
        description: t('signup.problemOccurred'),
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
              {t('signup.title')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('signup.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6 space-y-5">
          {/* Mandatory Checkboxes - MUST accept before signup */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              {t('signup.toCreate')}
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
                {t('signup.acceptTerms')}{' '}
                <Link to={getLocalizedHref('/terms')} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  {t('signup.termsConditions')}
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
                {t('signup.acceptTerms')}{' '}
                <Link to={getLocalizedHref('/privacy')} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  {t('signup.privacyPolicy')}
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
                {t('signup.acceptTerms')}{' '}
                <Link to={getLocalizedHref('/seller-rules')} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                  {t('signup.sellerRules')}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                {t('signup.emailNote')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('signup.passwordPlaceholder')}
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
              <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('signup.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">{t('signup.passwordsNoMatch')}</p>
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
                  {t('signup.creating')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('signup.createAccount')}
                </>
              )}
            </Button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>{t('signup.secureConnection')}</span>
          </div>

          {/* Already have account */}
          <p className="text-center text-sm text-muted-foreground">
            {t('signup.haveAccount')}{' '}
            <Link to={getLocalizedHref('/login')} className="text-primary hover:underline font-medium">
              {t('signup.login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
