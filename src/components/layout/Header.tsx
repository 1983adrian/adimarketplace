import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, MessageCircle, User, Plus, LogOut, ShoppingBag, Settings, Package } from 'lucide-react';
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

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-serif">MarketPlace</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/sell">
                    <Plus className="h-4 w-4" />
                    {t('header.sell')}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {t('header.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/listings" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {t('header.listings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        {t('header.orders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        {t('header.favorites')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('header.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('header.signout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('header.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">{t('header.signup')}</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
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

                  {user ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.display_name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <Button asChild className="w-full gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/sell">
                          <Plus className="h-4 w-4" />
                          {t('header.sellItem')}
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          {t('header.dashboard')}
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          {t('header.favorites')}
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          {t('header.orders')}
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/messages">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {t('header.messages')}
                        </Link>
                      </Button>

                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('header.settings')}
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" className="justify-start text-destructive" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('header.signout')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/signup">{t('header.signup')}</Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/login">{t('header.login')}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
