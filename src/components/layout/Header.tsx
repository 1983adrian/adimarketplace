import React, { useState, forwardRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, MessageCircle, User, Plus, LogOut, Settings, Package, Search, Shield, Crown, CreditCard, ShoppingBag, Sparkles, UserPlus, LogIn, BadgeCheck, ArrowLeft, ArrowRight, GraduationCap, Wallet, Store } from 'lucide-react';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCurrencySelector } from './LanguageCurrencySelector';
import { SearchDialog } from './SearchDialog';
import { NotificationBell } from './NotificationBell';
import { SellerNotificationBell } from './SellerNotificationBell';
import { CartDropdown } from './CartDropdown';
import { AppDownloadButton } from './AppDownloadButton';
import { useRealTimeNotifications, useRealTimeOrders } from '@/hooks/useRealTimeNotifications';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

// ForwardRef wrapper for DropdownMenuTrigger compatibility
const AvatarTriggerButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  (props, ref) => <Button ref={ref} {...props} />
);
AvatarTriggerButton.displayName = 'AvatarTriggerButton';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useRealTimeNotifications();
  useRealTimeOrders();
  
  const { headerPadding } = useSafeArea();
  const { data: unreadMessages = 0 } = useUnreadMessages();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to dedicated sign-out page with visual feedback
    navigate('/sign-out');
  };

  // Use the larger of: calculated safe area OR minimum 64px for notch devices
  const safePadding = Math.max(headerPadding, 64);

  const location = useLocation();
  const canGoBack = window.history.length > 1;

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoForward = () => {
    window.history.forward();
  };

  return (
    <header 
      className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm"
      style={{ paddingTop: window.innerWidth < 768 ? `${Math.min(safePadding, 48)}px` : '0px' }}
    >
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 md:h-16 gap-2 md:gap-4">
          {/* Left Section - Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Back/Forward Navigation - Larger & More Visible */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 shadow-lg border-2 border-primary/30 transition-all duration-200 hover:scale-105"
              onClick={handleGoBack}
              disabled={!canGoBack}
            >
              <ArrowLeft className="h-6 w-6 text-primary" strokeWidth={2.5} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 shadow-lg border-2 border-primary/30 transition-all duration-200 hover:scale-105"
              onClick={handleGoForward}
            >
              <ArrowRight className="h-6 w-6 text-primary" strokeWidth={2.5} />
            </Button>
            
            <div className="hidden sm:block ml-2">
              <AppDownloadButton />
            </div>
          </div>

          {/* Center Section - Mobile: Green Button - Home (only for logged-in users) */}
          {user && (
            <div className="flex-1 flex justify-center md:hidden">
              <Button 
                asChild
                size="icon"
                className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Link to="/">
                  <Store className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          )}

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full flex rounded-full overflow-hidden border-2 border-primary/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-background shadow-lg shadow-primary/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-5 w-5 text-primary/60" />
              </div>
              <Input
                type="search"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="h-12 px-6 rounded-full m-0 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Caută</span>
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <CartDropdown />
            <LanguageCurrencySelector />
            
            {user ? (
              <>
                {/* Big Browse/Shop Button - Only for logged-in users, between arrows and bell */}
                <Button 
                  asChild
                  className="h-11 px-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 mr-2"
                >
                  <Link to="/browse" className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    <span>Produse</span>
                  </Link>
                </Button>
                <SellerNotificationBell />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AvatarTriggerButton 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full ml-1 p-0 h-11 w-11 ring-2 ring-primary/20 hover:ring-primary/50 hover:ring-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-br from-background to-muted"
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-inner">
                        <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
                          {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarTriggerButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 shadow-dropdown">
                    <div className="px-2 py-2 border-b border-border">
                      <p className="font-medium text-sm">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Meniu & Cont
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                          <Link to="/admin/owner" className="flex items-center">
                            <Crown className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-amber-600 font-medium">Owner Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/admin">
                            <Shield className="mr-2 h-4 w-4 text-primary" />
                            Panou Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/admin/fees">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Plăți & Taxe
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      onClick={handleSignOut} 
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 rounded-lg mx-1 my-1 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 py-1">
                        <div className="p-1.5 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t('header.signout')}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" asChild className="font-medium">
                  <Link to="/login">{t('header.login')}</Link>
                </Button>
                <Button asChild className="gradient-primary text-primary-foreground font-medium">
                  <Link to="/signup">{t('header.signup')}</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Right Section - Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            <CartDropdown />
            <SearchDialog />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <MarketplaceBrand size="sm" showTagline={false} linkTo="/" />
                    <AppDownloadButton />
                  </div>
                  
                  <div className="p-4">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder={t('header.search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </form>
                  </div>

                  <div className="flex-1 overflow-auto p-4 space-y-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{profile?.display_name || 'User'}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        {/* Premium Meniu & Cont Button */}
                        <div className="mt-2">
                          <Link 
                            to="/dashboard" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:from-primary/25 hover:via-primary/15 hover:to-primary/10 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-primary/15"
                          >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors duration-300">Meniu & Cont</p>
                              <p className="text-sm text-muted-foreground">Setări, comenzi și profil</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                              <svg className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        </div>
                        
                        {isAdmin && (
                          <div className="pt-4 border-t border-border mt-4 space-y-1">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide px-3 py-1 flex items-center gap-2">
                              <Crown className="h-3 w-3" />
                              Admin / Owner
                            </p>
                            <Button variant="ghost" className="w-full justify-start bg-gradient-to-r from-amber-500/10 to-orange-500/10" asChild onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/admin/owner">
                                <Crown className="mr-3 h-4 w-4 text-amber-500" />
                                <span className="text-amber-600 font-medium">Owner Dashboard</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/admin">
                                <Shield className="mr-3 h-4 w-4 text-primary" />
                                Panou Admin
                              </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/admin/fees">
                                <CreditCard className="mr-3 h-4 w-4" />
                                Plăți & Taxe
                              </Link>
                            </Button>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-border mt-4">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl group transition-all duration-200" 
                            onClick={(e) => { handleSignOut(e); setMobileMenuOpen(false); }}
                          >
                            <div className="p-1.5 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors mr-3">
                              <LogOut className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{t('header.signout')}</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 py-4">
                        {/* Welcome Message */}
                        <div className="text-center space-y-2 pb-4 border-b border-border/50">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            Bine ai venit!
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Alătură-te comunității Marketplace România
                          </p>
                        </div>
                        
                        {/* Premium Sign Up Button */}
                        <Button 
                          asChild 
                          className="w-full h-14 bg-gradient-to-r from-[#4A90D9] via-[#5BA3EC] to-[#8B5CF6] hover:from-[#3A80C9] hover:via-[#4B93DC] hover:to-[#7C4CE6] text-white font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] group" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link to="/signup" className="flex items-center justify-center gap-2">
                            <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">{t('header.signup')}</span>
                          </Link>
                        </Button>
                        
                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground">sau</span>
                          </div>
                        </div>
                        
                        {/* Premium Login Button */}
                        <Button 
                          variant="outline" 
                          className="w-full h-14 border-2 border-primary/30 hover:border-primary/60 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 rounded-xl transition-all duration-300 group" 
                          asChild 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link to="/login" className="flex items-center justify-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <LogIn className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-lg font-medium text-foreground">{t('header.login')}</span>
                          </Link>
                        </Button>
                        
                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5 text-green-500" />
                            <span>Securizat</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                            <span>Verificat</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-center gap-2">
                      <LanguageCurrencySelector />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
