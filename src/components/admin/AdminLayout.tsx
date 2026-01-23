import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  // Mesaj "Bine ai venit înapoi" pentru 2 secunde
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Welcome Message - Green, fades after 2 seconds */}
          {showWelcome && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Bine ai venit înapoi, {profile?.display_name || 'Admin'}!</span>
                <Shield className="h-5 w-5" />
              </div>
            </div>
          )}
          
          <header className="h-20 border-b flex items-end justify-between px-4 md:px-6 pb-2 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
              
              {/* Back/Forward Navigation Buttons */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full hover:bg-primary/10 border border-primary/20"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full hover:bg-primary/10 border border-primary/20"
                onClick={() => window.history.forward()}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="h-10 px-4 gap-2 text-sm font-medium border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-200"
              >
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Înapoi la Site</span>
                  <span className="sm:hidden">Site</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Admin Panel</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.display_name || user?.email}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto overflow-x-hidden">
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
