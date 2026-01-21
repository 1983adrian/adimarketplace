import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Heart, MessageCircle, User, Plus, LogOut, Settings, Package, Search, Shield, Crown, CreditCard, ShoppingBag } from 'lucide-react';
import logo from '@/assets/cmarket-hero.png';
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
import { LanguageSelector } from './LanguageSelector';
import { SearchDialog } from './SearchDialog';
import { NotificationBell } from './NotificationBell';
import { CartDropdown } from './CartDropdown';
import { useRealTimeNotifications, useRealTimeOrders } from '@/hooks/useRealTimeNotifications';
import { useIsAdmin } from '@/hooks/useAdmin';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useRealTimeNotifications();
  useRealTimeOrders();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img 
              src={logo} 
              alt="CMarket" 
              className="h-9 md:h-10 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full flex shadow-sm rounded-lg overflow-hidden border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <Input
                type="search"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />
              <Button type="submit" size="sm" className="h-10 px-4 rounded-none gradient-primary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <CartDropdown />
            <LanguageSelector />
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </Button>
                <NotificationBell />
                <Button asChild className="gap-2 ml-2 gradient-primary text-primary-foreground font-medium">
                  <Link to="/sell">
                    <Plus className="h-4 w-4" />
                    {t('header.sell')}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full ml-1">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 shadow-dropdown">
                    <div className="px-2 py-2 border-b border-border">
                      <p className="font-medium text-sm">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        {t('header.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard/listings">
                        <Package className="mr-2 h-4 w-4" />
                        {t('header.listings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/orders">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {t('header.orders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        {t('header.favorites')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('header.settings')}
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
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('header.signout')}
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

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <CartDropdown />
            <SearchDialog />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <img src={logo} alt="CMarket" className="h-9 object-contain" style={{ mixBlendMode: 'multiply' }} />
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
                        
                        <Button asChild className="w-full gap-2 gradient-primary" onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/sell">
                            <Plus className="h-4 w-4" />
                            {t('header.sellItem')}
                          </Link>
                        </Button>
                        
                        <div className="space-y-1 pt-2">
                          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/dashboard">
                              <User className="mr-3 h-4 w-4" />
                              {t('header.dashboard')}
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/favorites">
                              <Heart className="mr-3 h-4 w-4" />
                              {t('header.favorites')}
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/orders">
                              <Package className="mr-3 h-4 w-4" />
                              {t('header.orders')}
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/messages">
                              <MessageCircle className="mr-3 h-4 w-4" />
                              {t('header.messages')}
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/settings">
                              <Settings className="mr-3 h-4 w-4" />
                              {t('header.settings')}
                            </Link>
                          </Button>
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
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            {t('header.signout')}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Button asChild className="w-full gradient-primary" onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/signup">{t('header.signup')}</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/login">{t('header.login')}</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-center gap-2">
                      <LanguageSelector />
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
