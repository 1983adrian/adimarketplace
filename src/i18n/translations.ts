// Static translations for UI elements - auto-selected based on user's country
// This file contains all UI text translations

import { SupportedLanguage } from './config';

type TranslationKeys = {
  // Navigation
  'nav.home': string;
  'nav.browse': string;
  'nav.sell': string;
  'nav.dashboard': string;
  'nav.messages': string;
  'nav.favorites': string;
  'nav.orders': string;
  'nav.settings': string;
  'nav.login': string;
  'nav.signup': string;
  'nav.logout': string;
  
  // Home page
  'home.hero.title': string;
  'home.hero.subtitle': string;
  'home.featured': string;
  'home.categories': string;
  'home.shopByCategory': string;
  'home.viewAll': string;
  'home.startSelling': string;
  
  // Search
  'search.placeholder': string;
  'search.noResults': string;
  'search.results': string;
  
  // Product
  'product.addToCart': string;
  'product.buyNow': string;
  'product.condition': string;
  'product.description': string;
  'product.price': string;
  'product.shipping': string;
  'product.seller': string;
  'product.quantity': string;
  'product.outOfStock': string;
  'product.inStock': string;
  
  // Conditions
  'condition.new': string;
  'condition.like_new': string;
  'condition.good': string;
  'condition.fair': string;
  'condition.poor': string;
  
  // Cart
  'cart.empty': string;
  'cart.checkout': string;
  'cart.total': string;
  'cart.items': string;
  
  // Checkout
  'checkout.title': string;
  'checkout.shipping': string;
  'checkout.payment': string;
  'checkout.review': string;
  'checkout.placeOrder': string;
  'checkout.success': string;
  
  // Auth
  'auth.email': string;
  'auth.password': string;
  'auth.forgotPassword': string;
  'auth.noAccount': string;
  'auth.hasAccount': string;
  'auth.loginButton': string;
  'auth.signupButton': string;
  
  // Common
  'common.loading': string;
  'common.error': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.view': string;
  'common.back': string;
  'common.next': string;
  'common.submit': string;
  'common.close': string;
  'common.or': string;
  'common.and': string;
  'common.all': string;
  'common.none': string;
  
  // Filters
  'filter.price': string;
  'filter.category': string;
  'filter.condition': string;
  'filter.location': string;
  'filter.sort': string;
  'filter.apply': string;
  'filter.reset': string;
  
  // Selling
  'sell.title': string;
  'sell.addPhotos': string;
  'sell.description': string;
  'sell.price': string;
  'sell.category': string;
  'sell.condition': string;
  'sell.shipping': string;
  'sell.publish': string;
  
  // Messages
  'messages.noMessages': string;
  'messages.send': string;
  'messages.placeholder': string;
  
  // Brand
  'brand.tagline': string;
  'brand.welcome': string;
  'brand.goodbye': string;
  'brand.buy': string;
  'brand.sell': string;
  'brand.bid': string;
  
  // Footer
  'footer.about': string;
  'footer.contact': string;
  'footer.help': string;
  'footer.terms': string;
  'footer.privacy': string;
  'footer.cookies': string;
};

type Translations = Record<SupportedLanguage, TranslationKeys>;

export const translations: Translations = {
  ro: {
    // Navigation
    'nav.home': 'Acasă',
    'nav.browse': 'Caută',
    'nav.sell': 'Vinde',
    'nav.dashboard': 'Panou',
    'nav.messages': 'Mesaje',
    'nav.favorites': 'Favorite',
    'nav.orders': 'Comenzi',
    'nav.settings': 'Setări',
    'nav.login': 'Conectare',
    'nav.signup': 'Înregistrare',
    'nav.logout': 'Deconectare',
    
    // Home page
    'home.hero.title': 'Cumpără și Vinde în România',
    'home.hero.subtitle': 'Cea mai mare piață online din România',
    'home.featured': 'Produse Recomandate',
    'home.categories': 'Categorii',
    'home.shopByCategory': 'Cumpără după Categorie',
    'home.viewAll': 'Vezi Tot',
    'home.startSelling': 'Începe să Vinzi',
    
    // Search
    'search.placeholder': 'Caută produse...',
    'search.noResults': 'Nu s-au găsit rezultate',
    'search.results': 'Rezultate',
    
    // Product
    'product.addToCart': 'Adaugă în Coș',
    'product.buyNow': 'Cumpără Acum',
    'product.condition': 'Stare',
    'product.description': 'Descriere',
    'product.price': 'Preț',
    'product.shipping': 'Livrare',
    'product.seller': 'Vânzător',
    'product.quantity': 'Cantitate',
    'product.outOfStock': 'Stoc Epuizat',
    'product.inStock': 'În Stoc',
    
    // Conditions
    'condition.new': 'Nou',
    'condition.like_new': 'Ca Nou',
    'condition.good': 'Bun',
    'condition.fair': 'Acceptabil',
    'condition.poor': 'Uzat',
    
    // Cart
    'cart.empty': 'Coșul este gol',
    'cart.checkout': 'Finalizează Comanda',
    'cart.total': 'Total',
    'cart.items': 'produse',
    
    // Checkout
    'checkout.title': 'Finalizare Comandă',
    'checkout.shipping': 'Livrare',
    'checkout.payment': 'Plată',
    'checkout.review': 'Revizuire',
    'checkout.placeOrder': 'Plasează Comanda',
    'checkout.success': 'Comandă Plasată cu Succes!',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Parolă',
    'auth.forgotPassword': 'Ai uitat parola?',
    'auth.noAccount': 'Nu ai cont?',
    'auth.hasAccount': 'Ai deja cont?',
    'auth.loginButton': 'Conectează-te',
    'auth.signupButton': 'Creează Cont',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.save': 'Salvează',
    'common.cancel': 'Anulează',
    'common.delete': 'Șterge',
    'common.edit': 'Editează',
    'common.view': 'Vezi',
    'common.back': 'Înapoi',
    'common.next': 'Următorul',
    'common.submit': 'Trimite',
    'common.close': 'Închide',
    'common.or': 'sau',
    'common.and': 'și',
    'common.all': 'Toate',
    'common.none': 'Niciunul',
    
    // Filters
    'filter.price': 'Preț',
    'filter.category': 'Categorie',
    'filter.condition': 'Stare',
    'filter.location': 'Locație',
    'filter.sort': 'Sortare',
    'filter.apply': 'Aplică',
    'filter.reset': 'Resetează',
    
    // Selling
    'sell.title': 'Vinde un Produs',
    'sell.addPhotos': 'Adaugă Poze',
    'sell.description': 'Descriere',
    'sell.price': 'Preț',
    'sell.category': 'Categorie',
    'sell.condition': 'Stare',
    'sell.shipping': 'Livrare',
    'sell.publish': 'Publică Anunț',
    
    // Messages
    'messages.noMessages': 'Nu ai mesaje',
    'messages.send': 'Trimite',
    'messages.placeholder': 'Scrie un mesaj...',
    
    // Brand
    'brand.tagline': 'Piața ta online din România',
    'brand.welcome': 'Bine ai venit!',
    'brand.goodbye': 'La revedere!',
    'brand.buy': 'Cumpără',
    'brand.sell': 'Vinde',
    'brand.bid': 'Licitează',
    
    // Footer
    'footer.about': 'Despre Noi',
    'footer.contact': 'Contact',
    'footer.help': 'Ajutor',
    'footer.terms': 'Termeni și Condiții',
    'footer.privacy': 'Confidențialitate',
    'footer.cookies': 'Politica Cookie',
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.sell': 'Sell',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favorites',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    
    // Home page
    'home.hero.title': 'Buy and Sell in Romania',
    'home.hero.subtitle': 'The largest online marketplace in Romania',
    'home.featured': 'Featured Products',
    'home.categories': 'Categories',
    'home.shopByCategory': 'Shop by Category',
    'home.viewAll': 'View All',
    'home.startSelling': 'Start Selling',
    
    // Search
    'search.placeholder': 'Search products...',
    'search.noResults': 'No results found',
    'search.results': 'Results',
    
    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.condition': 'Condition',
    'product.description': 'Description',
    'product.price': 'Price',
    'product.shipping': 'Shipping',
    'product.seller': 'Seller',
    'product.quantity': 'Quantity',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    
    // Conditions
    'condition.new': 'New',
    'condition.like_new': 'Like New',
    'condition.good': 'Good',
    'condition.fair': 'Fair',
    'condition.poor': 'Poor',
    
    // Cart
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.items': 'items',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping',
    'checkout.payment': 'Payment',
    'checkout.review': 'Review',
    'checkout.placeOrder': 'Place Order',
    'checkout.success': 'Order Placed Successfully!',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginButton': 'Login',
    'auth.signupButton': 'Sign Up',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.or': 'or',
    'common.and': 'and',
    'common.all': 'All',
    'common.none': 'None',
    
    // Filters
    'filter.price': 'Price',
    'filter.category': 'Category',
    'filter.condition': 'Condition',
    'filter.location': 'Location',
    'filter.sort': 'Sort',
    'filter.apply': 'Apply',
    'filter.reset': 'Reset',
    
    // Selling
    'sell.title': 'Sell a Product',
    'sell.addPhotos': 'Add Photos',
    'sell.description': 'Description',
    'sell.price': 'Price',
    'sell.category': 'Category',
    'sell.condition': 'Condition',
    'sell.shipping': 'Shipping',
    'sell.publish': 'Publish Listing',
    
    // Messages
    'messages.noMessages': 'No messages',
    'messages.send': 'Send',
    'messages.placeholder': 'Type a message...',
    
    // Brand
    'brand.tagline': 'Your online marketplace in Romania',
    'brand.welcome': 'Welcome!',
    'brand.goodbye': 'Goodbye!',
    'brand.buy': 'Buy',
    'brand.sell': 'Sell',
    'brand.bid': 'Bid',
    
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.help': 'Help',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.cookies': 'Cookie Policy',
  },
  
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.browse': 'Durchsuchen',
    'nav.sell': 'Verkaufen',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Nachrichten',
    'nav.favorites': 'Favoriten',
    'nav.orders': 'Bestellungen',
    'nav.settings': 'Einstellungen',
    'nav.login': 'Anmelden',
    'nav.signup': 'Registrieren',
    'nav.logout': 'Abmelden',
    
    // Home page
    'home.hero.title': 'Kaufen und Verkaufen in Rumänien',
    'home.hero.subtitle': 'Der größte Online-Marktplatz in Rumänien',
    'home.featured': 'Empfohlene Produkte',
    'home.categories': 'Kategorien',
    'home.shopByCategory': 'Nach Kategorie einkaufen',
    'home.viewAll': 'Alle anzeigen',
    'home.startSelling': 'Verkaufen starten',
    
    // Search
    'search.placeholder': 'Produkte suchen...',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.results': 'Ergebnisse',
    
    // Product
    'product.addToCart': 'In den Warenkorb',
    'product.buyNow': 'Jetzt kaufen',
    'product.condition': 'Zustand',
    'product.description': 'Beschreibung',
    'product.price': 'Preis',
    'product.shipping': 'Versand',
    'product.seller': 'Verkäufer',
    'product.quantity': 'Menge',
    'product.outOfStock': 'Nicht vorrätig',
    'product.inStock': 'Auf Lager',
    
    // Conditions
    'condition.new': 'Neu',
    'condition.like_new': 'Wie neu',
    'condition.good': 'Gut',
    'condition.fair': 'Akzeptabel',
    'condition.poor': 'Gebraucht',
    
    // Cart
    'cart.empty': 'Ihr Warenkorb ist leer',
    'cart.checkout': 'Zur Kasse',
    'cart.total': 'Gesamt',
    'cart.items': 'Artikel',
    
    // Checkout
    'checkout.title': 'Kasse',
    'checkout.shipping': 'Versand',
    'checkout.payment': 'Zahlung',
    'checkout.review': 'Überprüfen',
    'checkout.placeOrder': 'Bestellung aufgeben',
    'checkout.success': 'Bestellung erfolgreich aufgegeben!',
    
    // Auth
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.noAccount': 'Kein Konto?',
    'auth.hasAccount': 'Bereits ein Konto?',
    'auth.loginButton': 'Anmelden',
    'auth.signupButton': 'Registrieren',
    
    // Common
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Ansehen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.submit': 'Absenden',
    'common.close': 'Schließen',
    'common.or': 'oder',
    'common.and': 'und',
    'common.all': 'Alle',
    'common.none': 'Keine',
    
    // Filters
    'filter.price': 'Preis',
    'filter.category': 'Kategorie',
    'filter.condition': 'Zustand',
    'filter.location': 'Standort',
    'filter.sort': 'Sortieren',
    'filter.apply': 'Anwenden',
    'filter.reset': 'Zurücksetzen',
    
    // Selling
    'sell.title': 'Produkt verkaufen',
    'sell.addPhotos': 'Fotos hinzufügen',
    'sell.description': 'Beschreibung',
    'sell.price': 'Preis',
    'sell.category': 'Kategorie',
    'sell.condition': 'Zustand',
    'sell.shipping': 'Versand',
    'sell.publish': 'Anzeige veröffentlichen',
    
    // Messages
    'messages.noMessages': 'Keine Nachrichten',
    'messages.send': 'Senden',
    'messages.placeholder': 'Nachricht schreiben...',
    
    // Brand
    'brand.tagline': 'Ihr Online-Marktplatz in Rumänien',
    'brand.welcome': 'Willkommen!',
    'brand.goodbye': 'Auf Wiedersehen!',
    'brand.buy': 'Kaufen',
    'brand.sell': 'Verkaufen',
    'brand.bid': 'Bieten',
    
    // Footer
    'footer.about': 'Über uns',
    'footer.contact': 'Kontakt',
    'footer.help': 'Hilfe',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.privacy': 'Datenschutz',
    'footer.cookies': 'Cookie-Richtlinie',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.browse': 'Explorar',
    'nav.sell': 'Vender',
    'nav.dashboard': 'Panel',
    'nav.messages': 'Mensajes',
    'nav.favorites': 'Favoritos',
    'nav.orders': 'Pedidos',
    'nav.settings': 'Configuración',
    'nav.login': 'Iniciar sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar sesión',
    
    // Home page
    'home.hero.title': 'Compra y Vende en Rumania',
    'home.hero.subtitle': 'El mercado en línea más grande de Rumania',
    'home.featured': 'Productos Destacados',
    'home.categories': 'Categorías',
    'home.shopByCategory': 'Comprar por Categoría',
    'home.viewAll': 'Ver Todo',
    'home.startSelling': 'Empezar a Vender',
    
    // Search
    'search.placeholder': 'Buscar productos...',
    'search.noResults': 'No se encontraron resultados',
    'search.results': 'Resultados',
    
    // Product
    'product.addToCart': 'Añadir al Carrito',
    'product.buyNow': 'Comprar Ahora',
    'product.condition': 'Condición',
    'product.description': 'Descripción',
    'product.price': 'Precio',
    'product.shipping': 'Envío',
    'product.seller': 'Vendedor',
    'product.quantity': 'Cantidad',
    'product.outOfStock': 'Agotado',
    'product.inStock': 'En Stock',
    
    // Conditions
    'condition.new': 'Nuevo',
    'condition.like_new': 'Como Nuevo',
    'condition.good': 'Bueno',
    'condition.fair': 'Aceptable',
    'condition.poor': 'Usado',
    
    // Cart
    'cart.empty': 'Tu carrito está vacío',
    'cart.checkout': 'Finalizar Compra',
    'cart.total': 'Total',
    'cart.items': 'artículos',
    
    // Checkout
    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Envío',
    'checkout.payment': 'Pago',
    'checkout.review': 'Revisar',
    'checkout.placeOrder': 'Realizar Pedido',
    'checkout.success': '¡Pedido Realizado con Éxito!',
    
    // Auth
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.loginButton': 'Iniciar Sesión',
    'auth.signupButton': 'Registrarse',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',
    'common.or': 'o',
    'common.and': 'y',
    'common.all': 'Todos',
    'common.none': 'Ninguno',
    
    // Filters
    'filter.price': 'Precio',
    'filter.category': 'Categoría',
    'filter.condition': 'Condición',
    'filter.location': 'Ubicación',
    'filter.sort': 'Ordenar',
    'filter.apply': 'Aplicar',
    'filter.reset': 'Restablecer',
    
    // Selling
    'sell.title': 'Vender un Producto',
    'sell.addPhotos': 'Añadir Fotos',
    'sell.description': 'Descripción',
    'sell.price': 'Precio',
    'sell.category': 'Categoría',
    'sell.condition': 'Condición',
    'sell.shipping': 'Envío',
    'sell.publish': 'Publicar Anuncio',
    
    // Messages
    'messages.noMessages': 'Sin mensajes',
    'messages.send': 'Enviar',
    'messages.placeholder': 'Escribe un mensaje...',
    
    // Brand
    'brand.tagline': 'Tu mercado en línea en Rumania',
    'brand.welcome': '¡Bienvenido!',
    'brand.goodbye': '¡Adiós!',
    'brand.buy': 'Comprar',
    'brand.sell': 'Vender',
    'brand.bid': 'Pujar',
    
    // Footer
    'footer.about': 'Sobre Nosotros',
    'footer.contact': 'Contacto',
    'footer.help': 'Ayuda',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.cookies': 'Política de Cookies',
  },
  
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.browse': '浏览',
    'nav.sell': '出售',
    'nav.dashboard': '仪表板',
    'nav.messages': '消息',
    'nav.favorites': '收藏',
    'nav.orders': '订单',
    'nav.settings': '设置',
    'nav.login': '登录',
    'nav.signup': '注册',
    'nav.logout': '退出',
    
    // Home page
    'home.hero.title': '在罗马尼亚买卖',
    'home.hero.subtitle': '罗马尼亚最大的在线市场',
    'home.featured': '推荐商品',
    'home.categories': '分类',
    'home.shopByCategory': '按类别购物',
    'home.viewAll': '查看全部',
    'home.startSelling': '开始销售',
    
    // Search
    'search.placeholder': '搜索商品...',
    'search.noResults': '未找到结果',
    'search.results': '结果',
    
    // Product
    'product.addToCart': '加入购物车',
    'product.buyNow': '立即购买',
    'product.condition': '状况',
    'product.description': '描述',
    'product.price': '价格',
    'product.shipping': '配送',
    'product.seller': '卖家',
    'product.quantity': '数量',
    'product.outOfStock': '缺货',
    'product.inStock': '有货',
    
    // Conditions
    'condition.new': '全新',
    'condition.like_new': '几乎全新',
    'condition.good': '良好',
    'condition.fair': '一般',
    'condition.poor': '较旧',
    
    // Cart
    'cart.empty': '购物车是空的',
    'cart.checkout': '结账',
    'cart.total': '总计',
    'cart.items': '件商品',
    
    // Checkout
    'checkout.title': '结账',
    'checkout.shipping': '配送',
    'checkout.payment': '支付',
    'checkout.review': '确认',
    'checkout.placeOrder': '下单',
    'checkout.success': '订单成功!',
    
    // Auth
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.forgotPassword': '忘记密码?',
    'auth.noAccount': '没有账户?',
    'auth.hasAccount': '已有账户?',
    'auth.loginButton': '登录',
    'auth.signupButton': '注册',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.back': '返回',
    'common.next': '下一步',
    'common.submit': '提交',
    'common.close': '关闭',
    'common.or': '或',
    'common.and': '和',
    'common.all': '全部',
    'common.none': '无',
    
    // Filters
    'filter.price': '价格',
    'filter.category': '类别',
    'filter.condition': '状况',
    'filter.location': '位置',
    'filter.sort': '排序',
    'filter.apply': '应用',
    'filter.reset': '重置',
    
    // Selling
    'sell.title': '出售商品',
    'sell.addPhotos': '添加照片',
    'sell.description': '描述',
    'sell.price': '价格',
    'sell.category': '类别',
    'sell.condition': '状况',
    'sell.shipping': '配送',
    'sell.publish': '发布',
    
    // Messages
    'messages.noMessages': '没有消息',
    'messages.send': '发送',
    'messages.placeholder': '输入消息...',
    
    // Brand
    'brand.tagline': '您在罗马尼亚的在线市场',
    'brand.welcome': '欢迎!',
    'brand.goodbye': '再见!',
    'brand.buy': '购买',
    'brand.sell': '出售',
    'brand.bid': '竞拍',
    
    // Footer
    'footer.about': '关于我们',
    'footer.contact': '联系我们',
    'footer.help': '帮助',
    'footer.terms': '服务条款',
    'footer.privacy': '隐私政策',
    'footer.cookies': 'Cookie政策',
  },
  
  fr: {
    'nav.home': 'Accueil',
    'nav.browse': 'Parcourir',
    'nav.sell': 'Vendre',
    'nav.dashboard': 'Tableau de bord',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favoris',
    'nav.orders': 'Commandes',
    'nav.settings': 'Paramètres',
    'nav.login': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.logout': 'Déconnexion',
    'home.hero.title': 'Achetez et Vendez en Roumanie',
    'home.hero.subtitle': 'La plus grande marketplace en ligne de Roumanie',
    'home.featured': 'Produits en Vedette',
    'home.categories': 'Catégories',
    'home.shopByCategory': 'Acheter par Catégorie',
    'home.viewAll': 'Voir Tout',
    'home.startSelling': 'Commencer à Vendre',
    'search.placeholder': 'Rechercher des produits...',
    'search.noResults': 'Aucun résultat trouvé',
    'search.results': 'Résultats',
    'product.addToCart': 'Ajouter au Panier',
    'product.buyNow': 'Acheter Maintenant',
    'product.condition': 'État',
    'product.description': 'Description',
    'product.price': 'Prix',
    'product.shipping': 'Livraison',
    'product.seller': 'Vendeur',
    'product.quantity': 'Quantité',
    'product.outOfStock': 'Rupture de Stock',
    'product.inStock': 'En Stock',
    'condition.new': 'Neuf',
    'condition.like_new': 'Comme Neuf',
    'condition.good': 'Bon',
    'condition.fair': 'Acceptable',
    'condition.poor': 'Usagé',
    'cart.empty': 'Votre panier est vide',
    'cart.checkout': 'Passer à la Caisse',
    'cart.total': 'Total',
    'cart.items': 'articles',
    'checkout.title': 'Paiement',
    'checkout.shipping': 'Livraison',
    'checkout.payment': 'Paiement',
    'checkout.review': 'Vérifier',
    'checkout.placeOrder': 'Passer la Commande',
    'checkout.success': 'Commande Passée avec Succès!',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.noAccount': "Pas de compte?",
    'auth.hasAccount': 'Déjà un compte?',
    'auth.loginButton': 'Se Connecter',
    'auth.signupButton': "S'inscrire",
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
    'common.or': 'ou',
    'common.and': 'et',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    'filter.price': 'Prix',
    'filter.category': 'Catégorie',
    'filter.condition': 'État',
    'filter.location': 'Emplacement',
    'filter.sort': 'Trier',
    'filter.apply': 'Appliquer',
    'filter.reset': 'Réinitialiser',
    'sell.title': 'Vendre un Produit',
    'sell.addPhotos': 'Ajouter des Photos',
    'sell.description': 'Description',
    'sell.price': 'Prix',
    'sell.category': 'Catégorie',
    'sell.condition': 'État',
    'sell.shipping': 'Livraison',
    'sell.publish': 'Publier',
    'messages.noMessages': 'Aucun message',
    'messages.send': 'Envoyer',
    'messages.placeholder': 'Écrire un message...',
    'brand.tagline': 'Votre marketplace en ligne en Roumanie',
    'brand.welcome': 'Bienvenue!',
    'brand.goodbye': 'Au revoir!',
    'brand.buy': 'Acheter',
    'brand.sell': 'Vendre',
    'brand.bid': 'Enchérir',
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.help': 'Aide',
    'footer.terms': "Conditions d'Utilisation",
    'footer.privacy': 'Confidentialité',
    'footer.cookies': 'Politique des Cookies',
  },
  
  it: {
    'nav.home': 'Home',
    'nav.browse': 'Sfoglia',
    'nav.sell': 'Vendi',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messaggi',
    'nav.favorites': 'Preferiti',
    'nav.orders': 'Ordini',
    'nav.settings': 'Impostazioni',
    'nav.login': 'Accedi',
    'nav.signup': 'Registrati',
    'nav.logout': 'Esci',
    'home.hero.title': 'Compra e Vendi in Romania',
    'home.hero.subtitle': 'Il più grande marketplace online in Romania',
    'home.featured': 'Prodotti in Evidenza',
    'home.categories': 'Categorie',
    'home.shopByCategory': 'Acquista per Categoria',
    'home.viewAll': 'Vedi Tutto',
    'home.startSelling': 'Inizia a Vendere',
    'search.placeholder': 'Cerca prodotti...',
    'search.noResults': 'Nessun risultato trovato',
    'search.results': 'Risultati',
    'product.addToCart': 'Aggiungi al Carrello',
    'product.buyNow': 'Acquista Ora',
    'product.condition': 'Condizione',
    'product.description': 'Descrizione',
    'product.price': 'Prezzo',
    'product.shipping': 'Spedizione',
    'product.seller': 'Venditore',
    'product.quantity': 'Quantità',
    'product.outOfStock': 'Esaurito',
    'product.inStock': 'Disponibile',
    'condition.new': 'Nuovo',
    'condition.like_new': 'Come Nuovo',
    'condition.good': 'Buono',
    'condition.fair': 'Discreto',
    'condition.poor': 'Usato',
    'cart.empty': 'Il carrello è vuoto',
    'cart.checkout': 'Checkout',
    'cart.total': 'Totale',
    'cart.items': 'articoli',
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Spedizione',
    'checkout.payment': 'Pagamento',
    'checkout.review': 'Verifica',
    'checkout.placeOrder': 'Effettua Ordine',
    'checkout.success': 'Ordine Effettuato con Successo!',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Password dimenticata?',
    'auth.noAccount': 'Non hai un account?',
    'auth.hasAccount': 'Hai già un account?',
    'auth.loginButton': 'Accedi',
    'auth.signupButton': 'Registrati',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.view': 'Visualizza',
    'common.back': 'Indietro',
    'common.next': 'Avanti',
    'common.submit': 'Invia',
    'common.close': 'Chiudi',
    'common.or': 'o',
    'common.and': 'e',
    'common.all': 'Tutti',
    'common.none': 'Nessuno',
    'filter.price': 'Prezzo',
    'filter.category': 'Categoria',
    'filter.condition': 'Condizione',
    'filter.location': 'Posizione',
    'filter.sort': 'Ordina',
    'filter.apply': 'Applica',
    'filter.reset': 'Reimposta',
    'sell.title': 'Vendi un Prodotto',
    'sell.addPhotos': 'Aggiungi Foto',
    'sell.description': 'Descrizione',
    'sell.price': 'Prezzo',
    'sell.category': 'Categoria',
    'sell.condition': 'Condizione',
    'sell.shipping': 'Spedizione',
    'sell.publish': 'Pubblica',
    'messages.noMessages': 'Nessun messaggio',
    'messages.send': 'Invia',
    'messages.placeholder': 'Scrivi un messaggio...',
    'brand.tagline': 'Il tuo marketplace online in Romania',
    'brand.welcome': 'Benvenuto!',
    'brand.goodbye': 'Arrivederci!',
    'brand.buy': 'Compra',
    'brand.sell': 'Vendi',
    'brand.bid': 'Offri',
    'footer.about': 'Chi Siamo',
    'footer.contact': 'Contatti',
    'footer.help': 'Aiuto',
    'footer.terms': 'Termini di Servizio',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookie Policy',
  },
  
  pt: {
    'nav.home': 'Início',
    'nav.browse': 'Explorar',
    'nav.sell': 'Vender',
    'nav.dashboard': 'Painel',
    'nav.messages': 'Mensagens',
    'nav.favorites': 'Favoritos',
    'nav.orders': 'Pedidos',
    'nav.settings': 'Configurações',
    'nav.login': 'Entrar',
    'nav.signup': 'Registrar',
    'nav.logout': 'Sair',
    'home.hero.title': 'Compre e Venda na Romênia',
    'home.hero.subtitle': 'O maior marketplace online da Romênia',
    'home.featured': 'Produtos em Destaque',
    'home.categories': 'Categorias',
    'home.shopByCategory': 'Comprar por Categoria',
    'home.viewAll': 'Ver Tudo',
    'home.startSelling': 'Começar a Vender',
    'search.placeholder': 'Buscar produtos...',
    'search.noResults': 'Nenhum resultado encontrado',
    'search.results': 'Resultados',
    'product.addToCart': 'Adicionar ao Carrinho',
    'product.buyNow': 'Comprar Agora',
    'product.condition': 'Condição',
    'product.description': 'Descrição',
    'product.price': 'Preço',
    'product.shipping': 'Envio',
    'product.seller': 'Vendedor',
    'product.quantity': 'Quantidade',
    'product.outOfStock': 'Esgotado',
    'product.inStock': 'Em Estoque',
    'condition.new': 'Novo',
    'condition.like_new': 'Como Novo',
    'condition.good': 'Bom',
    'condition.fair': 'Razoável',
    'condition.poor': 'Usado',
    'cart.empty': 'Seu carrinho está vazio',
    'cart.checkout': 'Finalizar Compra',
    'cart.total': 'Total',
    'cart.items': 'itens',
    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Envio',
    'checkout.payment': 'Pagamento',
    'checkout.review': 'Revisar',
    'checkout.placeOrder': 'Fazer Pedido',
    'checkout.success': 'Pedido Realizado com Sucesso!',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.noAccount': 'Não tem conta?',
    'auth.hasAccount': 'Já tem conta?',
    'auth.loginButton': 'Entrar',
    'auth.signupButton': 'Registrar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.submit': 'Enviar',
    'common.close': 'Fechar',
    'common.or': 'ou',
    'common.and': 'e',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'filter.price': 'Preço',
    'filter.category': 'Categoria',
    'filter.condition': 'Condição',
    'filter.location': 'Localização',
    'filter.sort': 'Ordenar',
    'filter.apply': 'Aplicar',
    'filter.reset': 'Redefinir',
    'sell.title': 'Vender um Produto',
    'sell.addPhotos': 'Adicionar Fotos',
    'sell.description': 'Descrição',
    'sell.price': 'Preço',
    'sell.category': 'Categoria',
    'sell.condition': 'Condição',
    'sell.shipping': 'Envio',
    'sell.publish': 'Publicar',
    'messages.noMessages': 'Sem mensagens',
    'messages.send': 'Enviar',
    'messages.placeholder': 'Escreva uma mensagem...',
    'brand.tagline': 'Seu marketplace online na Romênia',
    'brand.welcome': 'Bem-vindo!',
    'brand.goodbye': 'Adeus!',
    'brand.buy': 'Comprar',
    'brand.sell': 'Vender',
    'brand.bid': 'Licitar',
    'footer.about': 'Sobre Nós',
    'footer.contact': 'Contato',
    'footer.help': 'Ajuda',
    'footer.terms': 'Termos de Serviço',
    'footer.privacy': 'Privacidade',
    'footer.cookies': 'Política de Cookies',
  },
  
  nl: {
    'nav.home': 'Home',
    'nav.browse': 'Bladeren',
    'nav.sell': 'Verkopen',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Berichten',
    'nav.favorites': 'Favorieten',
    'nav.orders': 'Bestellingen',
    'nav.settings': 'Instellingen',
    'nav.login': 'Inloggen',
    'nav.signup': 'Registreren',
    'nav.logout': 'Uitloggen',
    'home.hero.title': 'Koop en Verkoop in Roemenië',
    'home.hero.subtitle': 'De grootste online marktplaats in Roemenië',
    'home.featured': 'Uitgelichte Producten',
    'home.categories': 'Categorieën',
    'home.shopByCategory': 'Winkel per Categorie',
    'home.viewAll': 'Bekijk Alles',
    'home.startSelling': 'Start met Verkopen',
    'search.placeholder': 'Zoek producten...',
    'search.noResults': 'Geen resultaten gevonden',
    'search.results': 'Resultaten',
    'product.addToCart': 'Toevoegen aan Winkelwagen',
    'product.buyNow': 'Nu Kopen',
    'product.condition': 'Conditie',
    'product.description': 'Beschrijving',
    'product.price': 'Prijs',
    'product.shipping': 'Verzending',
    'product.seller': 'Verkoper',
    'product.quantity': 'Hoeveelheid',
    'product.outOfStock': 'Niet op Voorraad',
    'product.inStock': 'Op Voorraad',
    'condition.new': 'Nieuw',
    'condition.like_new': 'Als Nieuw',
    'condition.good': 'Goed',
    'condition.fair': 'Redelijk',
    'condition.poor': 'Gebruikt',
    'cart.empty': 'Je winkelwagen is leeg',
    'cart.checkout': 'Afrekenen',
    'cart.total': 'Totaal',
    'cart.items': 'artikelen',
    'checkout.title': 'Afrekenen',
    'checkout.shipping': 'Verzending',
    'checkout.payment': 'Betaling',
    'checkout.review': 'Controleren',
    'checkout.placeOrder': 'Bestelling Plaatsen',
    'checkout.success': 'Bestelling Succesvol Geplaatst!',
    'auth.email': 'E-mail',
    'auth.password': 'Wachtwoord',
    'auth.forgotPassword': 'Wachtwoord vergeten?',
    'auth.noAccount': 'Geen account?',
    'auth.hasAccount': 'Al een account?',
    'auth.loginButton': 'Inloggen',
    'auth.signupButton': 'Registreren',
    'common.loading': 'Laden...',
    'common.error': 'Fout',
    'common.save': 'Opslaan',
    'common.cancel': 'Annuleren',
    'common.delete': 'Verwijderen',
    'common.edit': 'Bewerken',
    'common.view': 'Bekijken',
    'common.back': 'Terug',
    'common.next': 'Volgende',
    'common.submit': 'Verzenden',
    'common.close': 'Sluiten',
    'common.or': 'of',
    'common.and': 'en',
    'common.all': 'Alle',
    'common.none': 'Geen',
    'filter.price': 'Prijs',
    'filter.category': 'Categorie',
    'filter.condition': 'Conditie',
    'filter.location': 'Locatie',
    'filter.sort': 'Sorteren',
    'filter.apply': 'Toepassen',
    'filter.reset': 'Resetten',
    'sell.title': 'Verkoop een Product',
    'sell.addPhotos': "Foto's Toevoegen",
    'sell.description': 'Beschrijving',
    'sell.price': 'Prijs',
    'sell.category': 'Categorie',
    'sell.condition': 'Conditie',
    'sell.shipping': 'Verzending',
    'sell.publish': 'Publiceren',
    'messages.noMessages': 'Geen berichten',
    'messages.send': 'Verzenden',
    'messages.placeholder': 'Typ een bericht...',
    'brand.tagline': 'Uw online marktplaats in Roemenië',
    'brand.welcome': 'Welkom!',
    'brand.goodbye': 'Tot ziens!',
    'brand.buy': 'Kopen',
    'brand.sell': 'Verkopen',
    'brand.bid': 'Bieden',
    'footer.about': 'Over Ons',
    'footer.contact': 'Contact',
    'footer.help': 'Help',
    'footer.terms': 'Servicevoorwaarden',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookiebeleid',
  },
  
  pl: {
    'nav.home': 'Strona główna',
    'nav.browse': 'Przeglądaj',
    'nav.sell': 'Sprzedaj',
    'nav.dashboard': 'Panel',
    'nav.messages': 'Wiadomości',
    'nav.favorites': 'Ulubione',
    'nav.orders': 'Zamówienia',
    'nav.settings': 'Ustawienia',
    'nav.login': 'Zaloguj',
    'nav.signup': 'Zarejestruj',
    'nav.logout': 'Wyloguj',
    'home.hero.title': 'Kupuj i Sprzedawaj w Rumunii',
    'home.hero.subtitle': 'Największy marketplace online w Rumunii',
    'home.featured': 'Polecane Produkty',
    'home.categories': 'Kategorie',
    'home.shopByCategory': 'Kupuj według Kategorii',
    'home.viewAll': 'Zobacz Wszystko',
    'home.startSelling': 'Zacznij Sprzedawać',
    'search.placeholder': 'Szukaj produktów...',
    'search.noResults': 'Nie znaleziono wyników',
    'search.results': 'Wyniki',
    'product.addToCart': 'Dodaj do Koszyka',
    'product.buyNow': 'Kup Teraz',
    'product.condition': 'Stan',
    'product.description': 'Opis',
    'product.price': 'Cena',
    'product.shipping': 'Wysyłka',
    'product.seller': 'Sprzedawca',
    'product.quantity': 'Ilość',
    'product.outOfStock': 'Brak w magazynie',
    'product.inStock': 'Dostępny',
    'condition.new': 'Nowy',
    'condition.like_new': 'Jak Nowy',
    'condition.good': 'Dobry',
    'condition.fair': 'Akceptowalny',
    'condition.poor': 'Używany',
    'cart.empty': 'Twój koszyk jest pusty',
    'cart.checkout': 'Zamów',
    'cart.total': 'Suma',
    'cart.items': 'produkty',
    'checkout.title': 'Zamówienie',
    'checkout.shipping': 'Wysyłka',
    'checkout.payment': 'Płatność',
    'checkout.review': 'Przegląd',
    'checkout.placeOrder': 'Złóż Zamówienie',
    'checkout.success': 'Zamówienie Złożone Pomyślnie!',
    'auth.email': 'Email',
    'auth.password': 'Hasło',
    'auth.forgotPassword': 'Zapomniałeś hasła?',
    'auth.noAccount': 'Nie masz konta?',
    'auth.hasAccount': 'Masz już konto?',
    'auth.loginButton': 'Zaloguj',
    'auth.signupButton': 'Zarejestruj',
    'common.loading': 'Ładowanie...',
    'common.error': 'Błąd',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.delete': 'Usuń',
    'common.edit': 'Edytuj',
    'common.view': 'Zobacz',
    'common.back': 'Wstecz',
    'common.next': 'Dalej',
    'common.submit': 'Wyślij',
    'common.close': 'Zamknij',
    'common.or': 'lub',
    'common.and': 'i',
    'common.all': 'Wszystkie',
    'common.none': 'Brak',
    'filter.price': 'Cena',
    'filter.category': 'Kategoria',
    'filter.condition': 'Stan',
    'filter.location': 'Lokalizacja',
    'filter.sort': 'Sortuj',
    'filter.apply': 'Zastosuj',
    'filter.reset': 'Resetuj',
    'sell.title': 'Sprzedaj Produkt',
    'sell.addPhotos': 'Dodaj Zdjęcia',
    'sell.description': 'Opis',
    'sell.price': 'Cena',
    'sell.category': 'Kategoria',
    'sell.condition': 'Stan',
    'sell.shipping': 'Wysyłka',
    'sell.publish': 'Opublikuj',
    'messages.noMessages': 'Brak wiadomości',
    'messages.send': 'Wyślij',
    'messages.placeholder': 'Napisz wiadomość...',
    'brand.tagline': 'Twój marketplace online w Rumunii',
    'brand.welcome': 'Witamy!',
    'brand.goodbye': 'Do widzenia!',
    'brand.buy': 'Kup',
    'brand.sell': 'Sprzedaj',
    'brand.bid': 'Licytuj',
    'footer.about': 'O Nas',
    'footer.contact': 'Kontakt',
    'footer.help': 'Pomoc',
    'footer.terms': 'Regulamin',
    'footer.privacy': 'Prywatność',
    'footer.cookies': 'Polityka Cookies',
  },
};

// Helper to get translation
export function getTranslation(lang: SupportedLanguage, key: keyof TranslationKeys): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
