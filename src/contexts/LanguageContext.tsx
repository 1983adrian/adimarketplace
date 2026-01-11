import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ro' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.search': 'Search for items...',
    'header.sell': 'Sell',
    'header.login': 'Log In',
    'header.signup': 'Sign Up',
    'header.dashboard': 'My Dashboard',
    'header.listings': 'My Listings',
    'header.favorites': 'Favorites',
    'header.messages': 'Messages',
    'header.orders': 'My Orders',
    'header.settings': 'Settings',
    'header.signout': 'Sign Out',
    'header.sellItem': 'Sell an Item',
    
    // Home
    'home.hero.title': 'Buy & Sell Locally',
    'home.hero.subtitle': 'Discover amazing deals in your community',
    'home.hero.cta': 'Start Browsing',
    'home.categories': 'Categories',
    'home.featured': 'Featured Listings',
    'home.viewAll': 'View All',
    'home.howItWorks': 'How It Works',
    'home.step1.title': 'List Your Item',
    'home.step1.desc': 'Take photos and create your listing in minutes',
    'home.step2.title': 'Connect with Buyers',
    'home.step2.desc': 'Chat directly with interested buyers',
    'home.step3.title': 'Get Paid Securely',
    'home.step3.desc': 'Receive payment through our secure platform',
    
    // Browse
    'browse.search': 'Search items...',
    'browse.filters': 'Filters',
    'browse.category': 'Category',
    'browse.allCategories': 'All Categories',
    'browse.priceRange': 'Price Range',
    'browse.condition': 'Condition',
    'browse.anyCondition': 'Any Condition',
    'browse.clearFilters': 'Clear Filters',
    'browse.sort': 'Sort by',
    'browse.newest': 'Newest First',
    'browse.priceLow': 'Price: Low to High',
    'browse.priceHigh': 'Price: High to Low',
    'browse.itemsFound': 'items found',
    'browse.noListings': 'No listings found matching your criteria',
    
    // Conditions
    'condition.new': 'New',
    'condition.like_new': 'Like New',
    'condition.good': 'Good',
    'condition.fair': 'Fair',
    'condition.poor': 'Poor',
    
    // Dashboard
    'dashboard.welcome': 'Welcome!',
    'dashboard.seller': 'Seller',
    'dashboard.newListing': 'New Listing',
    'dashboard.becomeSeller': 'Become a Seller',
    'dashboard.subscription': 'Monthly Platform Access',
    'dashboard.subscribed': 'Active until',
    'dashboard.subscribe': 'Pay monthly fee to list items for sale',
    'dashboard.manageSubscription': 'Manage Payment',
    'dashboard.subscribeNow': 'Activate Access (£1/month)',
    'dashboard.sellerBenefits': 'Seller benefits: Create unlimited listings, 15% commission on sales (only when you sell). £1 is charged automatically each month.',
    'dashboard.activeListings': 'Active Listings',
    'dashboard.totalViews': 'Total Views',
    'dashboard.totalEarned': 'Total Earned',
    'dashboard.myFavorites': 'My Favorites',
    'dashboard.itemsSaved': 'Items you\'ve saved',
    'dashboard.chatWithUsers': 'Chat with buyers & sellers',
    'dashboard.manageAccount': 'Manage your account',
    'dashboard.myListings': 'My Listings',
    'dashboard.noListings': 'No listings yet',
    'dashboard.startSelling': 'Start selling by creating your first listing',
    'dashboard.subscribeToSell': 'Activate monthly access to become a seller and create listings',
    'dashboard.createListing': 'Create Listing',
    'dashboard.loading': 'Loading...',
    'dashboard.subscriptionActivated': 'Access activated!',
    'dashboard.canCreateListings': 'You can now create listings.',
    'dashboard.subscriptionCanceled': 'Access payment canceled',
    'dashboard.canSubscribeAnytime': 'You can activate anytime.',
    
    // Settings tabs
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.payments': 'Payments',
    'settings.payouts': 'Payouts',
    'settings.shipping': 'Shipping',
    'settings.seller': 'Seller',
    'settings.notifications': 'Alerts',
    'settings.security': 'Security',
    
    // Profile settings
    'settings.profileInfo': 'Profile Information',
    'settings.profileDesc': 'Update your personal information visible to other users',
    'settings.changeAvatar': 'Change Avatar',
    'settings.displayName': 'Display Name',
    'settings.username': 'Username',
    'settings.email': 'Email',
    'settings.emailCantChange': 'Email cannot be changed',
    'settings.bio': 'Bio',
    'settings.bioPlaceholder': 'Tell others about yourself...',
    'settings.location': 'Location',
    'settings.phone': 'Phone',
    'settings.saveChanges': 'Save Changes',
    'settings.saving': 'Saving...',
    
    // Auth
    'auth.login': 'Log In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.loginButton': 'Log In',
    'auth.signupButton': 'Create Account',
    
    // Listing
    'listing.buyNow': 'Buy Now',
    'listing.addToCart': 'Add to Cart',
    'listing.contactSeller': 'Contact Seller',
    'listing.description': 'Description',
    'listing.sellerInfo': 'Seller Information',
    'listing.memberSince': 'Member since',
    'listing.viewProfile': 'View Profile',
    'listing.report': 'Report Listing',
    'listing.share': 'Share',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.viewAll': 'View All',
    
    // Footer
    'footer.about': 'About Us',
    'footer.help': 'Help Center',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    'footer.copyright': 'All rights reserved.',
    
    // Admin
    'admin.dashboard': 'Dashboard Overview',
    'admin.welcome': 'Welcome to the admin panel. Monitor and manage your marketplace.',
    'admin.totalUsers': 'Total Users',
    'admin.registeredAccounts': 'Registered accounts',
    'admin.activeSellers': 'Active Sellers',
    'admin.withSubscription': 'With active subscription',
    'admin.activeListings': 'Active Listings',
    'admin.totalOrders': 'Total Orders',
    'admin.allTime': 'All time',
    'admin.platformRevenue': 'Platform Revenue',
    'admin.revenueDesc': 'Total revenue from completed orders',
    'admin.feeStructure': 'Current Fee Structure',
    'admin.activeFees': 'Active platform fees',
    'admin.buyerFee': 'Buyer Fee',
    'admin.sellerCommission': 'Seller Commission',
    'admin.sellerSubscription': 'Seller Monthly Fee',
    'admin.recentOrders': 'Recent Orders',
    'admin.latestTransactions': 'Latest transactions on the platform',
    'admin.noOrders': 'No orders yet',
  },
  ro: {
    // Header
    'header.search': 'Caută produse...',
    'header.sell': 'Vinde',
    'header.login': 'Autentificare',
    'header.signup': 'Înregistrare',
    'header.dashboard': 'Tabloul Meu',
    'header.listings': 'Anunțurile Mele',
    'header.favorites': 'Favorite',
    'header.messages': 'Mesaje',
    'header.orders': 'Comenzile Mele',
    'header.settings': 'Setări',
    'header.signout': 'Deconectare',
    'header.sellItem': 'Vinde un Articol',
    
    // Home
    'home.hero.title': 'Cumpără și Vinde Local',
    'home.hero.subtitle': 'Descoperă oferte extraordinare în comunitatea ta',
    'home.hero.cta': 'Începe să Cauți',
    'home.categories': 'Categorii',
    'home.featured': 'Anunțuri Promovate',
    'home.viewAll': 'Vezi Tot',
    'home.howItWorks': 'Cum Funcționează',
    'home.step1.title': 'Listează Articolul',
    'home.step1.desc': 'Fă poze și creează anunțul în câteva minute',
    'home.step2.title': 'Conectează-te cu Cumpărători',
    'home.step2.desc': 'Discută direct cu cumpărătorii interesați',
    'home.step3.title': 'Primește Plata Securizat',
    'home.step3.desc': 'Primește plata prin platforma noastră securizată',
    
    // Browse
    'browse.search': 'Caută articole...',
    'browse.filters': 'Filtre',
    'browse.category': 'Categorie',
    'browse.allCategories': 'Toate Categoriile',
    'browse.priceRange': 'Interval Preț',
    'browse.condition': 'Stare',
    'browse.anyCondition': 'Orice Stare',
    'browse.clearFilters': 'Șterge Filtrele',
    'browse.sort': 'Sortează după',
    'browse.newest': 'Cele Mai Noi',
    'browse.priceLow': 'Preț: Mic la Mare',
    'browse.priceHigh': 'Preț: Mare la Mic',
    'browse.itemsFound': 'articole găsite',
    'browse.noListings': 'Nu s-au găsit anunțuri pentru criteriile tale',
    
    // Conditions
    'condition.new': 'Nou',
    'condition.like_new': 'Ca Nou',
    'condition.good': 'Bun',
    'condition.fair': 'Acceptabil',
    'condition.poor': 'Uzat',
    
    // Dashboard
    'dashboard.welcome': 'Bine ai venit!',
    'dashboard.seller': 'Vânzător',
    'dashboard.newListing': 'Anunț Nou',
    'dashboard.becomeSeller': 'Devino Vânzător',
    'dashboard.subscription': 'Taxă Lunară de Acces',
    'dashboard.subscribed': 'Activ până la',
    'dashboard.subscribe': 'Plătește taxa lunară pentru a lista articole',
    'dashboard.manageSubscription': 'Gestionează Plata',
    'dashboard.subscribeNow': 'Activează Accesul (£1/lună)',
    'dashboard.sellerBenefits': 'Beneficii vânzător: Creează anunțuri nelimitate, comision 15% la vânzări (doar când vinzi). £1 se încasează automat în fiecare lună.',
    'dashboard.activeListings': 'Anunțuri Active',
    'dashboard.totalViews': 'Total Vizualizări',
    'dashboard.totalEarned': 'Total Câștigat',
    'dashboard.myFavorites': 'Favoritele Mele',
    'dashboard.itemsSaved': 'Articolele salvate de tine',
    'dashboard.chatWithUsers': 'Discută cu cumpărători și vânzători',
    'dashboard.manageAccount': 'Gestionează contul tău',
    'dashboard.myListings': 'Anunțurile Mele',
    'dashboard.noListings': 'Niciun anunț încă',
    'dashboard.startSelling': 'Începe să vinzi creând primul tău anunț',
    'dashboard.subscribeToSell': 'Activează accesul lunar pentru a deveni vânzător și a crea anunțuri',
    'dashboard.createListing': 'Creează Anunț',
    'dashboard.loading': 'Se încarcă...',
    'dashboard.subscriptionActivated': 'Acces activat!',
    'dashboard.canCreateListings': 'Acum poți crea anunțuri.',
    'dashboard.subscriptionCanceled': 'Plata accesului anulată',
    'dashboard.canSubscribeAnytime': 'Poți activa oricând.',
    
    // Settings tabs
    'settings.title': 'Setări',
    'settings.profile': 'Profil',
    'settings.payments': 'Plăți',
    'settings.payouts': 'Încasări',
    'settings.shipping': 'Livrare',
    'settings.seller': 'Vânzător',
    'settings.notifications': 'Alerte',
    'settings.security': 'Securitate',
    
    // Profile settings
    'settings.profileInfo': 'Informații Profil',
    'settings.profileDesc': 'Actualizează informațiile personale vizibile pentru alți utilizatori',
    'settings.changeAvatar': 'Schimbă Avatar',
    'settings.displayName': 'Nume Afișat',
    'settings.username': 'Nume Utilizator',
    'settings.email': 'Email',
    'settings.emailCantChange': 'Email-ul nu poate fi schimbat',
    'settings.bio': 'Descriere',
    'settings.bioPlaceholder': 'Spune-le altora despre tine...',
    'settings.location': 'Locație',
    'settings.phone': 'Telefon',
    'settings.saveChanges': 'Salvează Modificările',
    'settings.saving': 'Se salvează...',
    
    // Auth
    'auth.login': 'Autentificare',
    'auth.signup': 'Înregistrare',
    'auth.email': 'Email',
    'auth.password': 'Parolă',
    'auth.confirmPassword': 'Confirmă Parola',
    'auth.forgotPassword': 'Ai uitat parola?',
    'auth.noAccount': 'Nu ai cont?',
    'auth.hasAccount': 'Ai deja cont?',
    'auth.loginButton': 'Autentifică-te',
    'auth.signupButton': 'Creează Cont',
    
    // Listing
    'listing.buyNow': 'Cumpără Acum',
    'listing.addToCart': 'Adaugă în Coș',
    'listing.contactSeller': 'Contactează Vânzătorul',
    'listing.description': 'Descriere',
    'listing.sellerInfo': 'Informații Vânzător',
    'listing.memberSince': 'Membru din',
    'listing.viewProfile': 'Vezi Profilul',
    'listing.report': 'Raportează Anunțul',
    'listing.share': 'Distribuie',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'common.cancel': 'Anulează',
    'common.save': 'Salvează',
    'common.delete': 'Șterge',
    'common.edit': 'Editează',
    'common.back': 'Înapoi',
    'common.next': 'Următorul',
    'common.submit': 'Trimite',
    'common.search': 'Caută',
    'common.viewAll': 'Vezi Tot',
    
    // Footer
    'footer.about': 'Despre Noi',
    'footer.help': 'Centru de Ajutor',
    'footer.privacy': 'Politica de Confidențialitate',
    'footer.terms': 'Termeni și Condiții',
    'footer.contact': 'Contactează-ne',
    'footer.copyright': 'Toate drepturile rezervate.',
    
    // Admin
    'admin.dashboard': 'Prezentare Generală',
    'admin.welcome': 'Bine ai venit în panoul de administrare. Monitorizează și gestionează marketplace-ul.',
    'admin.totalUsers': 'Total Utilizatori',
    'admin.registeredAccounts': 'Conturi înregistrate',
    'admin.activeSellers': 'Vânzători Activi',
    'admin.withSubscription': 'Cu abonament activ',
    'admin.activeListings': 'Anunțuri Active',
    'admin.totalOrders': 'Total Comenzi',
    'admin.allTime': 'Din totdeauna',
    'admin.platformRevenue': 'Venituri Platformă',
    'admin.revenueDesc': 'Venituri totale din comenzile finalizate',
    'admin.feeStructure': 'Structură Taxe Curente',
    'admin.activeFees': 'Taxe active pe platformă',
    'admin.buyerFee': 'Taxă Cumpărător',
    'admin.sellerCommission': 'Comision Vânzător',
    'admin.sellerSubscription': 'Taxă Lunară Vânzător',
    'admin.recentOrders': 'Comenzi Recente',
    'admin.latestTransactions': 'Ultimele tranzacții pe platformă',
    'admin.noOrders': 'Nicio comandă încă',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved) return saved;
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ro')) return 'ro';
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
