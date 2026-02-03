import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';

const SignOut = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        setIsSigningOut(false);
        setIsComplete(true);
      } catch (error) {
        console.error('Sign out error:', error);
        setIsSigningOut(false);
        setIsComplete(true);
      }
    };

    // Only sign out if user is logged in
    if (user) {
      performSignOut();
    } else {
      setIsSigningOut(false);
      setIsComplete(true);
    }
  }, [signOut, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Background gradient - different from login (red/warm tones for goodbye) */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-orange-500/5 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border border-border shadow-xl bg-card">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Brand with goodbye variant */}
          <MarketplaceBrand size="md" variant="goodbye" linkTo={null} />
          
          {isSigningOut ? (
            <>
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-destructive animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Se deconectează...</h2>
                <p className="text-muted-foreground text-sm">
                  Te rugăm să aștepți câteva momente
                </p>
              </div>
            </>
          ) : isComplete ? (
            <>
              <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                <LogOut className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Te-ai deconectat cu succes!</h2>
                <p className="text-muted-foreground text-sm">
                  Sperăm să te revedem curând pe platforma noastră.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  <Home className="h-4 w-4" />
                  Înapoi la pagina principală
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="w-full gap-2"
                >
                  Autentifică-te din nou
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignOut;
