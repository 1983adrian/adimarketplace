import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin } from 'lucide-react';

const romanianCities = [
  { name: "București", slug: "bucuresti", county: "Ilfov" },
  { name: "Cluj-Napoca", slug: "cluj-napoca", county: "Cluj" },
  { name: "Timișoara", slug: "timisoara", county: "Timiș" },
  { name: "Iași", slug: "iasi", county: "Iași" },
  { name: "Constanța", slug: "constanta", county: "Constanța" },
  { name: "Craiova", slug: "craiova", county: "Dolj" },
  { name: "Brașov", slug: "brasov", county: "Brașov" },
  { name: "Galați", slug: "galati", county: "Galați" },
  { name: "Ploiești", slug: "ploiesti", county: "Prahova" },
  { name: "Oradea", slug: "oradea", county: "Bihor" },
  { name: "Brăila", slug: "braila", county: "Brăila" },
  { name: "Arad", slug: "arad", county: "Arad" },
  { name: "Pitești", slug: "pitesti", county: "Argeș" },
  { name: "Sibiu", slug: "sibiu", county: "Sibiu" },
  { name: "Bacău", slug: "bacau", county: "Bacău" },
  { name: "Târgu Mureș", slug: "targu-mures", county: "Mureș" },
  { name: "Baia Mare", slug: "baia-mare", county: "Maramureș" },
  { name: "Buzău", slug: "buzau", county: "Buzău" },
  { name: "Botoșani", slug: "botosani", county: "Botoșani" },
  { name: "Satu Mare", slug: "satu-mare", county: "Satu Mare" },
  { name: "Râmnicu Vâlcea", slug: "ramnicu-valcea", county: "Vâlcea" },
  { name: "Drobeta-Turnu Severin", slug: "drobeta-turnu-severin", county: "Mehedinți" },
  { name: "Suceava", slug: "suceava", county: "Suceava" },
  { name: "Piatra Neamț", slug: "piatra-neamt", county: "Neamț" },
  { name: "Târgoviște", slug: "targoviste", county: "Dâmbovița" },
  { name: "Focșani", slug: "focsani", county: "Vrancea" },
  { name: "Bistrița", slug: "bistrita", county: "Bistrița-Năsăud" },
  { name: "Reșița", slug: "resita", county: "Caraș-Severin" },
  { name: "Tulcea", slug: "tulcea", county: "Tulcea" },
  { name: "Slatina", slug: "slatina", county: "Olt" },
  { name: "Călărași", slug: "calarasi", county: "Călărași" },
  { name: "Giurgiu", slug: "giurgiu", county: "Giurgiu" },
  { name: "Deva", slug: "deva", county: "Hunedoara" },
  { name: "Hunedoara", slug: "hunedoara", county: "Hunedoara" },
  { name: "Zalău", slug: "zalau", county: "Sălaj" },
  { name: "Sfântu Gheorghe", slug: "sfantu-gheorghe", county: "Covasna" },
  { name: "Alba Iulia", slug: "alba-iulia", county: "Alba" },
  { name: "Vaslui", slug: "vaslui", county: "Vaslui" },
  { name: "Mediaș", slug: "medias", county: "Sibiu" },
  { name: "Turda", slug: "turda", county: "Cluj" },
  { name: "Petroșani", slug: "petrosani", county: "Hunedoara" },
  { name: "Alexandria", slug: "alexandria", county: "Teleorman" },
];

const CityLandingSection: React.FC = () => {
  // JSON-LD for local business presence in each city
  const localBusinessSchema = romanianCities.slice(0, 10).map(city => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Market Place România - ${city.name}`,
    "description": `Marketplace online în ${city.name}, județul ${city.county}. Cumpără și vinde produse noi și second hand în ${city.name} cu 0% comision pe Market Place România.`,
    "url": `https://www.marketplaceromania.com/browse?location=${city.slug}`,
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "containedInPlace": {
        "@type": "Country",
        "name": "Romania"
      }
    },
    "priceRange": "LEI",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressRegion": city.county,
      "addressCountry": "RO"
    }
  }));

  return (
    <>
      <Helmet>
        {localBusinessSchema.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <section className="sr-only" aria-hidden="false">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Market Place România — Disponibil în Toate Orașele
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cumpără și vinde online cu 0% comision în oricare din cele 42 de orașe mari din România. 
              Livrare rapidă 1-3 zile prin FAN Courier, Sameday și Cargus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {romanianCities.map((city) => (
              <a
                key={city.slug}
                href={`/browse?location=${city.slug}`}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-background border border-border hover:border-primary hover:shadow-sm transition-all text-sm group"
                title={`Marketplace ${city.name} — cumpără și vinde online în ${city.name}, ${city.county}`}
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate group-hover:text-primary transition-colors font-medium">
                  {city.name}
                </span>
              </a>
            ))}
          </div>

          {/* SEO competitive attack block */}
          <div className="mt-10 max-w-4xl mx-auto space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                🚀 Te-ai săturat de comisioanele mari? Treci pe 0% comision!
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Pe <strong>eMAG</strong> plătești până la <strong>25% comision</strong> din fiecare vânzare. 
                Pe <strong>OLX</strong> riști țepe fără protecție reală. Pe <strong>eBay</strong> plătești comisioane + taxe PayPal. 
                Pe <strong>Facebook Marketplace</strong> nu ai garanții, nu ai facturi, nu ai siguranță.
              </p>
              <p className="text-foreground font-semibold text-base md:text-lg">
                Pe <span className="text-primary">MarketPlaceRomania.com</span> vinzi cu <strong>0% comision</strong> — tot ce vinzi rămâne al tău!
              </p>
              <a href="/seller-plans" className="inline-block mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Începe Gratuit — 30 Zile Trial
              </a>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                <strong>Alternativă la eMAG Marketplace</strong> — MarketPlaceRomania.com este cea mai ieftină platformă de vânzare online din România. 
                Spre deosebire de eMAG, unde comisioanele ajung la 25%, pe Market Place România plătești doar un abonament fix de la 11 LEI/lună cu 0% din vânzări. 
                Fără taxe ascunse, fără comisioane pe tranzacții, fără surprize.
              </p>
              <p>
                <strong>Alternativă la OLX</strong> — Te-ai săturat de țepe pe OLX? Pe MarketPlaceRomania.com ai plată securizată prin PayPal, 
                protecție cumpărător cu garanție de returnare 14 zile și verificare a vânzătorilor. Nu mai riști bani trimiși în avans fără garanții.
              </p>
              <p>
                <strong>Alternativă la eBay</strong> — Vinzi în toată Europa fără comisioanele uriașe de pe eBay. 
                Market Place România oferă licitații online integrate, Buy Now instant și plată prin PayPal — la fel ca eBay, dar cu 0% comision pe vânzare!
              </p>
              <p>
                <strong>Alternativă la Facebook Marketplace</strong> — Vrei mai mult decât o postare pe Facebook? Pe MarketPlaceRomania.com ai magazin propriu, 
                facturi automate, tracking comenzi, licitații online și protecție reală pentru cumpărători și vânzători.
              </p>
              <p>
                <strong>Alternativă la Lajumate, Publi24, Autovit, Storia</strong> — O singură platformă pentru toate categoriile: electronice, haine, mobilă, 
                auto, imobiliare, jucării și mii de alte produse. Cel mai mic cost de vânzare din România și Europa.
              </p>
              <p>
                <strong>De ce MarketPlaceRomania.com?</strong> Pentru că este singura platformă din România cu: ✅ 0% comision pe vânzări, 
                ✅ Licitații online ca pe eBay, ✅ Plată securizată prin PayPal, ✅ Protecție cumpărător 14 zile, 
                ✅ Livrare rapidă prin FAN Courier, Sameday, Cargus, ✅ Abonamente de la doar 11 LEI/lună, 
                ✅ Construit cu inteligență artificială, ✅ 30 de zile gratuite pentru vânzători noi. 
                Market Place România® — cea mai ieftină și sigură alternativă la eMAG, OLX, eBay și Facebook Marketplace.
              </p>
            </div>

            {/* City SEO block */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                <strong>Market Place România</strong> este disponibil în toate cele 42 de orașe mari: 
                marketplace București, marketplace Cluj-Napoca, marketplace Timișoara, marketplace Iași, marketplace Constanța, 
                marketplace Craiova, marketplace Brașov, marketplace Galați, marketplace Ploiești, marketplace Oradea, 
                marketplace Sibiu, marketplace Bacău, marketplace Arad, marketplace Pitești, marketplace Brăila, 
                marketplace Târgu Mureș, marketplace Baia Mare, marketplace Buzău, marketplace Botoșani și marketplace Suceava.
              </p>
              <p>
                Vinde și cumpără în marketplace Satu Mare, marketplace Râmnicu Vâlcea, marketplace Drobeta-Turnu Severin, 
                marketplace Piatra Neamț, marketplace Târgoviște, marketplace Focșani, marketplace Bistrița, marketplace Reșița, 
                marketplace Tulcea, marketplace Slatina, marketplace Călărași, marketplace Giurgiu, marketplace Deva, 
                marketplace Hunedoara, marketplace Zalău, marketplace Sfântu Gheorghe, marketplace Alba Iulia, marketplace Vaslui, 
                marketplace Mediaș, marketplace Turda, marketplace Petroșani și marketplace Alexandria 
                — toate cu <strong>0% comision</strong> și plată securizată prin PayPal.
              </p>
              <p>
                Pe MarketPlaceRomania.com găsești electronice, haine, mobilă, auto, imobiliare și mii de alte categorii. 
                Abonamente de la <strong>11 LEI/lună</strong>. Livrare rapidă în toată România prin FAN Courier, Sameday și Cargus. 
                Market Place România® — primul market place din România construit cu inteligență artificială. 
                Cea mai bună alternativă românească la eMAG, OLX, eBay, Amazon, Vinted și Facebook Marketplace.
              </p>
            </div>

            {/* ENGLISH - UK / Scotland focused */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="en">
              <h3>🇬🇧 The Cheapest Marketplace in Europe — 0% Sales Commission | Sell from UK, Scotland, England, Wales</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> is the cheapest online marketplace in all of Europe — and it's open to sellers from the 
                <strong>United Kingdom, Scotland, England, Wales, Northern Ireland</strong> and every country in Europe. 
                While Amazon charges up to 15% commission, eBay up to 13%, and Etsy up to 6.5%, 
                MarketPlaceRomania.com charges <strong>0% commission on all sales</strong>. You keep 100% of what you earn.
              </p>
              <p>
                <strong>🚀 Start your online business for FREE — here's how it works:</strong> 
                Sign up and get <strong>30 days completely free</strong>. During your free trial, you can list up to 
                <strong>10 products</strong> — at fixed price or auction — and start making your first sales with zero risk. 
                Once you've earned your first money, upgrade to a <strong>€10/month plan for 50 listings</strong>, 
                then grow to <strong>150 listings for €30/month</strong>, or go unlimited with <strong>€200/month VIP</strong>. 
                Start small, grow big — all with <strong>0% commission forever</strong>.
              </p>
              <p>
                <strong>Perfect for UK sellers:</strong> Whether you're in London, Edinburgh, Glasgow, Manchester, Birmingham, 
                Leeds, Liverpool, Bristol, Cardiff, Belfast, Aberdeen, Dundee, Inverness, or anywhere in the UK — 
                you can sell across all of Europe from day one. Handmade crafts, vintage items, electronics, fashion, 
                collectibles, art — whatever you make or sell, this is the cheapest way to reach European buyers.
              </p>
              <p>
                <strong>Why choose MarketPlaceRomania.com over eBay UK, Amazon UK, Etsy, or Vinted?</strong> 
                ✅ 0% sales commission — everything you sell is 100% yours, 
                ✅ 30 days free trial with 10 product listings, 
                ✅ Online auctions AND fixed price — you choose, 
                ✅ Secure payments via PayPal and credit card, 
                ✅ 14-day buyer protection (EU consumer law), 
                ✅ AI-powered platform for smart selling, 
                ✅ Sell to all 27 EU countries + UK + Norway + Switzerland, 
                ✅ Plans from just €2/month after trial.
              </p>
              <p>
                <strong>Start a business from home:</strong> No experience needed. No stock required for dropshipping. 
                No upfront costs. Just sign up, list your first 10 products for free, make your first sale, 
                and reinvest to grow. Thousands of sellers across Europe are already building their businesses here. 
                Join them today at <strong>MarketPlaceRomania.com</strong>.
              </p>
            </div>

            {/* GERMAN / Deutsch */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="de">
              <h3>🇩🇪 Der günstigste Marktplatz Europas — 0% Verkaufsprovision | Verkaufe aus Deutschland, Österreich, Schweiz</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> ist der günstigste Online-Marktplatz in ganz Europa. 
                Amazon verlangt bis zu 15%, eBay bis zu 13%, Kleinanzeigen bietet keinen Käuferschutz — 
                bei uns zahlen Sie <strong>0% Provision auf alle Verkäufe</strong>.
              </p>
              <p>
                <strong>🚀 Starten Sie Ihr Online-Geschäft kostenlos:</strong> 
                Registrieren Sie sich und erhalten Sie <strong>30 Tage gratis</strong>. Listen Sie bis zu 
                <strong>10 Produkte</strong> — Festpreis oder Auktion — und verdienen Sie Ihr erstes Geld ohne Risiko. 
                Danach upgraden Sie auf <strong>50 Produkte für 10€/Monat</strong>, dann <strong>150 für 30€/Monat</strong>, 
                bis hin zu unbegrenzten Listings. Klein anfangen, groß werden — immer mit <strong>0% Provision</strong>.
              </p>
              <p>
                Ob Sie in Berlin, München, Hamburg, Frankfurt, Köln, Stuttgart, Wien, Zürich oder irgendwo in 
                Deutschland, Österreich oder der Schweiz sind — verkaufen Sie europaweit ab dem ersten Tag. 
                Beste Alternative zu Amazon, eBay Kleinanzeigen, Vinted und Etsy.
              </p>
            </div>

            {/* FRENCH / Français */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="fr">
              <h3>🇫🇷 Le marketplace le moins cher d'Europe — 0% de commission | Vendez depuis la France, Belgique, Suisse</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> est le marketplace le moins cher de toute l'Europe. 
                Amazon prend jusqu'à 15%, eBay 13%, Etsy 6,5% — chez nous : <strong>0% de commission sur toutes les ventes</strong>.
              </p>
              <p>
                <strong>🚀 Lancez votre business en ligne gratuitement :</strong> 
                Inscrivez-vous et profitez de <strong>30 jours entièrement gratuits</strong>. Publiez jusqu'à 
                <strong>10 produits</strong> — prix fixe ou enchère — et gagnez vos premiers euros sans aucun risque. 
                Ensuite, passez à <strong>50 produits pour 10€/mois</strong>, puis <strong>150 pour 30€/mois</strong>. 
                Commencez petit, grandissez — toujours avec <strong>0% de commission</strong>.
              </p>
              <p>
                Que vous soyez à Paris, Lyon, Marseille, Toulouse, Bruxelles, Genève ou n'importe où en France, 
                Belgique ou Suisse — vendez dans toute l'Europe dès le premier jour. 
                Meilleure alternative à Leboncoin, Amazon, eBay, Vinted et Etsy.
              </p>
            </div>

            {/* ITALIAN / Italiano */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="it">
              <h3>🇮🇹 Il marketplace più economico d'Europa — 0% di commissione | Vendi dall'Italia</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> è il marketplace più economico di tutta Europa: 
                <strong>0% di commissione su tutte le vendite</strong>. Amazon prende fino al 15%, eBay il 13%.
              </p>
              <p>
                <strong>🚀 Avvia il tuo business online gratis:</strong> 
                Registrati e ottieni <strong>30 giorni completamente gratuiti</strong>. Pubblica fino a 
                <strong>10 prodotti</strong> — prezzo fisso o asta — e guadagna i tuoi primi soldi senza rischi. 
                Poi passa a <strong>50 prodotti per 10€/mese</strong>, poi <strong>150 per 30€/mese</strong>. 
                Inizia in piccolo, cresci alla grande — sempre con <strong>0% commissione</strong>.
              </p>
              <p>
                Da Roma, Milano, Napoli, Torino, Firenze o qualsiasi città italiana — vendi in tutta Europa dal primo giorno. 
                Migliore alternativa a Subito.it, Amazon, eBay, Vinted ed Etsy.
              </p>
            </div>

            {/* SPANISH / Español */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="es">
              <h3>🇪🇸 El marketplace más barato de Europa — 0% de comisión | Vende desde España</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> es el marketplace más barato de toda Europa: 
                <strong>0% de comisión en todas las ventas</strong>.
              </p>
              <p>
                <strong>🚀 Empieza tu negocio online gratis:</strong> 
                Regístrate y obtén <strong>30 días completamente gratis</strong>. Publica hasta 
                <strong>10 productos</strong> — precio fijo o subasta — y gana tu primer dinero sin riesgo. 
                Luego pasa a <strong>50 productos por 10€/mes</strong>, después <strong>150 por 30€/mes</strong>. 
                Empieza pequeño, crece grande — siempre con <strong>0% comisión</strong>.
              </p>
              <p>
                Desde Madrid, Barcelona, Valencia, Sevilla o cualquier ciudad española — vende en toda Europa desde el primer día. 
                Mejor alternativa a Wallapop, Amazon, eBay, Vinted y Etsy.
              </p>
            </div>

            {/* DUTCH / Nederlands */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="nl">
              <h3>🇳🇱 De goedkoopste marktplaats van Europa — 0% verkoopcommissie | Verkoop vanuit Nederland, België</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> is de goedkoopste online marktplaats van heel Europa: 
                <strong>0% commissie op alle verkopen</strong>.
              </p>
              <p>
                <strong>🚀 Start uw online bedrijf gratis:</strong> 
                Meld u aan en krijg <strong>30 dagen volledig gratis</strong>. Plaats tot 
                <strong>10 producten</strong> — vaste prijs of veiling — en verdien uw eerste geld zonder risico. 
                Upgrade daarna naar <strong>50 producten voor €10/maand</strong>, dan <strong>150 voor €30/maand</strong>. 
                Begin klein, groei groot — altijd met <strong>0% commissie</strong>.
              </p>
              <p>
                Vanuit Amsterdam, Rotterdam, Utrecht, Antwerpen of waar dan ook in Nederland en België — 
                verkoop in heel Europa vanaf dag één. Beste alternatief voor Marktplaats.nl, Bol.com, Amazon, eBay, Vinted.
              </p>
            </div>

            {/* POLISH / Polski */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="pl">
              <h3>🇵🇱 Najtańszy marketplace w Europie — 0% prowizji | Sprzedawaj z Polski</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> to najtańszy marketplace w całej Europie: 
                <strong>0% prowizji od wszystkich sprzedaży</strong>.
              </p>
              <p>
                <strong>🚀 Rozpocznij swój biznes online za darmo:</strong> 
                Zarejestruj się i otrzymaj <strong>30 dni całkowicie za darmo</strong>. Wystaw do 
                <strong>10 produktów</strong> — cena stała lub licytacja — i zarób swoje pierwsze pieniądze bez ryzyka. 
                Potem przejdź na <strong>50 produktów za 10€/miesiąc</strong>, następnie <strong>150 za 30€/miesiąc</strong>. 
                Zacznij od małego, rozwijaj się — zawsze z <strong>0% prowizji</strong>.
              </p>
              <p>
                Z Warszawy, Krakowa, Wrocławia, Gdańska czy dowolnego miasta w Polsce — 
                sprzedawaj w całej Europie od pierwszego dnia. Najlepsza alternatywa dla Allegro, OLX, Amazon, Vinted.
              </p>
            </div>

            {/* PORTUGUESE / Português */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="pt">
              <h3>🇵🇹 O marketplace mais barato da Europa — 0% de comissão | Venda a partir de Portugal</h3>
              <p>
                <strong>🚀 Comece o seu negócio online grátis:</strong> 
                Registe-se e tenha <strong>30 dias completamente grátis</strong>. Publique até 
                <strong>10 produtos</strong> — preço fixo ou leilão — e ganhe o seu primeiro dinheiro sem risco. 
                Depois passe para <strong>50 produtos por 10€/mês</strong>, depois <strong>150 por 30€/mês</strong>. 
                Comece pequeno, cresça — sempre com <strong>0% de comissão</strong>.
              </p>
              <p>
                De Lisboa, Porto ou qualquer cidade em Portugal — venda em toda a Europa desde o primeiro dia. 
                Melhor alternativa ao OLX, Amazon, eBay, Vinted.
              </p>
            </div>

            {/* SWEDISH / Svenska */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sv">
              <h3>🇸🇪 Europas billigaste marknadsplats — 0% försäljningsprovision | Sälj från Sverige</h3>
              <p>
                <strong>🚀 Starta gratis:</strong> Registrera dig och få <strong>30 dagar helt gratis</strong>. 
                Lägg upp <strong>10 produkter</strong> — fast pris eller auktion — och tjäna dina första pengar utan risk. 
                Uppgradera sedan till <strong>50 produkter för 10€/månad</strong>, sedan <strong>150 för 30€/månad</strong>. 
                Börja smått, väx stort — alltid med <strong>0% provision</strong>. 
                Från Stockholm, Göteborg, Malmö — sälj i hela Europa. Bästa alternativet till Blocket, Tradera, Amazon.
              </p>
            </div>

            {/* DANISH / Dansk */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="da">
              <h3>🇩🇰 Europas billigste markedsplads — 0% salgskommission | Sælg fra Danmark</h3>
              <p>
                <strong>🚀 Start gratis:</strong> Tilmeld dig og få <strong>30 dage helt gratis</strong>. 
                List <strong>10 produkter</strong> — fast pris eller auktion — og tjen dine første penge uden risiko. 
                Opgrader derefter til <strong>50 produkter for 10€/måned</strong>. 
                Start småt, voks stort — altid med <strong>0% kommission</strong>. 
                Fra København, Aarhus, Odense — sælg i hele Europa. Bedste alternativ til DBA, Amazon.
              </p>
            </div>

            {/* FINNISH / Suomi */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="fi">
              <h3>🇫🇮 Euroopan halvin markkinapaikka — 0% myyntiprovisio | Myy Suomesta</h3>
              <p>
                <strong>🚀 Aloita ilmaiseksi:</strong> Rekisteröidy ja saat <strong>30 päivää täysin ilmaiseksi</strong>. 
                Listaa <strong>10 tuotetta</strong> — kiinteä hinta tai huutokauppa — ja ansaitse ensimmäiset rahasi ilman riskiä. 
                Päivitä sitten <strong>50 tuotteeseen 10€/kk</strong>. Aloita pienestä, kasva suureksi — aina <strong>0% provisio</strong>. 
                Helsingistä, Tampereelta, Turusta — myy koko Eurooppaan. Paras vaihtoehto Tori.fi:lle, Amazonille.
              </p>
            </div>

            {/* NORWEGIAN / Norsk */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="no">
              <h3>🇳🇴 Europas billigste markedsplass — 0% salgsprovisjon | Selg fra Norge</h3>
              <p>
                <strong>🚀 Start gratis:</strong> Registrer deg og få <strong>30 dager helt gratis</strong>. 
                List <strong>10 produkter</strong> — fast pris eller auksjon — og tjen dine første penger uten risiko. 
                Oppgrader til <strong>50 produkter for 10€/måned</strong>. 
                Start smått, voks stort — alltid med <strong>0% provisjon</strong>. 
                Fra Oslo, Bergen, Trondheim — selg i hele Europa. Beste alternativ til Finn.no, Amazon.
              </p>
            </div>

            {/* GREEK / Ελληνικά */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="el">
              <h3>🇬🇷 Η φθηνότερη αγορά στην Ευρώπη — 0% προμήθεια | Πουλήστε από την Ελλάδα</h3>
              <p>
                <strong>🚀 Ξεκινήστε δωρεάν:</strong> Εγγραφείτε και πάρτε <strong>30 ημέρες εντελώς δωρεάν</strong>. 
                Καταχωρίστε <strong>10 προϊόντα</strong> — σταθερή τιμή ή δημοπρασία — και κερδίστε τα πρώτα σας χρήματα χωρίς ρίσκο. 
                Αναβαθμίστε σε <strong>50 προϊόντα με 10€/μήνα</strong>. Ξεκινήστε μικρά, μεγαλώστε — πάντα με <strong>0% προμήθεια</strong>. 
                Από Αθήνα, Θεσσαλονίκη — πουλήστε σε όλη την Ευρώπη.
              </p>
            </div>

            {/* CZECH / Čeština */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="cs">
              <h3>🇨🇿 Nejlevnější marketplace v Evropě — 0% provize | Prodávejte z Česka</h3>
              <p>
                <strong>🚀 Začněte zdarma:</strong> Zaregistrujte se a získejte <strong>30 dní zcela zdarma</strong>. 
                Vystavte <strong>10 produktů</strong> — pevná cena nebo aukce — a vydělejte své první peníze bez rizika. 
                Poté přejděte na <strong>50 produktů za 10€/měsíc</strong>. Začněte v malém, rostěte — vždy s <strong>0% provizí</strong>. 
                Z Prahy, Brna — prodávejte po celé Evropě. Nejlepší alternativa k Bazos, Amazon.
              </p>
            </div>

            {/* HUNGARIAN / Magyar */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="hu">
              <h3>🇭🇺 Európa legolcsóbb piactere — 0% jutalék | Adj el Magyarországról</h3>
              <p>
                <strong>🚀 Kezdje ingyen:</strong> Regisztráljon és kapjon <strong>30 napot teljesen ingyen</strong>. 
                Tegyen ki <strong>10 terméket</strong> — fix áron vagy aukción — és keresse meg első pénzét kockázat nélkül. 
                Váltson <strong>50 termékre 10€/hó</strong>-ért. Kezdje kicsiben, nőjön nagyra — mindig <strong>0% jutalékkal</strong>. 
                Budapestről, Debrecenből — adjon el egész Európában. Legjobb alternatíva a Jófogáshoz, Amazonhoz.
              </p>
            </div>

            {/* BULGARIAN / Български */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="bg">
              <h3>🇧🇬 Най-евтиният маркетплейс в Европа — 0% комисиона | Продавайте от България</h3>
              <p>
                <strong>🚀 Започнете безплатно:</strong> Регистрирайте се и получете <strong>30 дни напълно безплатно</strong>. 
                Публикувайте <strong>10 продукта</strong> — фиксирана цена или търг — и спечелете първите си пари без риск. 
                След това преминете на <strong>50 продукта за 10€/месец</strong>. Започнете малко, растете — винаги с <strong>0% комисиона</strong>. 
                От София, Пловдив — продавайте в цяла Европа. Най-добра алтернатива на OLX, Amazon.
              </p>
            </div>

            {/* CROATIAN / Hrvatski */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="hr">
              <h3>🇭🇷 Najjeftiniji marketplace u Europi — 0% provizije | Prodajte iz Hrvatske</h3>
              <p>
                <strong>🚀 Započnite besplatno:</strong> Registrirajte se i dobijte <strong>30 dana potpuno besplatno</strong>. 
                Objavite <strong>10 proizvoda</strong> — fiksna cijena ili aukcija — i zaradite prvi novac bez rizika. 
                Nadogradite na <strong>50 proizvoda za 10€/mjesec</strong>. Počnite malo, rastite — uvijek s <strong>0% provizije</strong>. 
                Iz Zagreba, Splita — prodajte u cijeloj Europi. Najbolja alternativa Njuškalu, Amazonu.
              </p>
            </div>

            {/* SLOVAK / Slovenčina */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sk">
              <h3>🇸🇰 Najlacnejší marketplace v Európe — 0% provízia | Predávajte zo Slovenska</h3>
              <p>
                <strong>🚀 Začnite zadarmo:</strong> <strong>30 dní zadarmo</strong>, <strong>10 produktov</strong> — 
                fixná cena alebo aukcia. Zarobte prvé peniaze, potom prejdite na <strong>50 produktov za 10€/mesiac</strong>. 
                Vždy <strong>0% provízia</strong>. Z Bratislavy, Košíc — predávajte po celej Európe.
              </p>
            </div>

            {/* SLOVENIAN / Slovenščina */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sl">
              <h3>🇸🇮 Najcenejša tržnica v Evropi — 0% provizije | Prodajajte iz Slovenije</h3>
              <p>
                <strong>🚀 Začnite brezplačno:</strong> <strong>30 dni brezplačno</strong>, <strong>10 izdelkov</strong> — 
                fiksna cena ali dražba. Zaslužite prvi denar, nato nadgradite na <strong>50 izdelkov za 10€/mesec</strong>. 
                Vedno <strong>0% provizije</strong>. Iz Ljubljane, Maribora — prodajajte po vsej Evropi.
              </p>
            </div>

            {/* LITHUANIAN / Lietuvių */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="lt">
              <h3>🇱🇹 Pigiausia prekyvietė Europoje — 0% komisinio | Pardavinėkite iš Lietuvos</h3>
              <p>
                <strong>🚀 Pradėkite nemokamai:</strong> <strong>30 dienų nemokamai</strong>, <strong>10 produktų</strong> — 
                fiksuota kaina arba aukcionas. Užsidirbkite pirmuosius pinigus, tada pereikite prie <strong>50 produktų už 10€/mėn</strong>. 
                Visada <strong>0% komisinio</strong>. Iš Vilniaus, Kauno — pardavinėkite visoje Europoje.
              </p>
            </div>

            {/* LATVIAN / Latviešu */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="lv">
              <h3>🇱🇻 Lētākais tirgus Eiropā — 0% komisija | Pārdodiet no Latvijas</h3>
              <p>
                <strong>🚀 Sāciet bez maksas:</strong> <strong>30 dienas bez maksas</strong>, <strong>10 produkti</strong> — 
                fiksēta cena vai izsole. Nopelniet pirmo naudu, tad pārejiet uz <strong>50 produktiem par 10€/mēnesī</strong>. 
                Vienmēr <strong>0% komisija</strong>. No Rīgas, Daugavpils — pārdodiet visā Eiropā.
              </p>
            </div>

            {/* ESTONIAN / Eesti */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="et">
              <h3>🇪🇪 Euroopa odavaim turg — 0% vahendustasu | Müüge Eestist</h3>
              <p>
                <strong>🚀 Alustage tasuta:</strong> <strong>30 päeva tasuta</strong>, <strong>10 toodet</strong> — 
                fikseeritud hind või oksjon. Teenige esimene raha, siis uuendage <strong>50 tootele 10€/kuus</strong>. 
                Alati <strong>0% vahendustasu</strong>. Tallinnast, Tartust — müüge kogu Euroopas.
              </p>
            </div>

            {/* UKRAINIAN / Українська */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="uk">
              <h3>🇺🇦 Найдешевший маркетплейс в Європі — 0% комісії | Продавайте з України</h3>
              <p>
                <strong>🚀 Починайте безкоштовно:</strong> <strong>30 днів безкоштовно</strong>, <strong>10 товарів</strong> — 
                фіксована ціна або аукціон. Заробіть перші гроші, потім перейдіть на <strong>50 товарів за 10€/місяць</strong>. 
                Завжди <strong>0% комісії</strong>. З Києва, Львова, Одеси — продавайте по всій Європі. 
                Найкраща альтернатива OLX, Prom.ua, Amazon.
              </p>
            </div>

            {/* TURKISH / Türkçe */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="tr">
              <h3>🇹🇷 Avrupa'nın en ucuz pazaryeri — %0 komisyon | Türkiye'den satış yapın</h3>
              <p>
                <strong>🚀 Ücretsiz başlayın:</strong> <strong>30 gün tamamen ücretsiz</strong>, <strong>10 ürün</strong> — 
                sabit fiyat veya açık artırma. İlk paranızı kazanın, sonra <strong>50 ürüne 10€/ay</strong> ile yükseltin. 
                Her zaman <strong>%0 komisyon</strong>. İstanbul, Ankara, İzmir'den — tüm Avrupa'ya satış yapın. 
                Trendyol, Hepsiburada, Amazon'a en iyi alternatif.
              </p>
            </div>

            {/* CHINESE / 中文 */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="zh">
              <h3>🇨🇳 欧洲最便宜的在线市场 — 0%销售佣金 | 面向全欧洲销售</h3>
              <p>
                <strong>🚀 免费开始：</strong><strong>30天完全免费</strong>，发布<strong>10件商品</strong>——
                固定价格或拍卖——零风险赚取第一笔收入。然后升级到<strong>50件商品10€/月</strong>，
                再到<strong>150件30€/月</strong>。从小做起，不断成长——始终<strong>0%佣金</strong>。
                在MarketPlaceRomania.com向整个欧洲销售。亚马逊、eBay、Etsy的最佳替代品。
              </p>
            </div>

            {/* SCOTTISH GAELIC / Gàidhlig */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="gd">
              <h3>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Am margadh as saoire san Roinn Eòrpa — 0% coimisean | Reic à Alba</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — am margadh air-loidhne as saoire san Roinn Eòrpa le 
                <strong>0% coimisean air a h-uile reic</strong>. <strong>30 latha an-asgaidh</strong>, 
                <strong>10 toraidhean</strong>. Tòisich beag, fàs mòr. À Dùn Èideann, Glaschu, Obar Dheathain, 
                Inbhir Nis — reic air feadh na Roinn Eòrpa.
              </p>
            </div>

            {/* WELSH / Cymraeg */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="cy">
              <h3>🏴󠁧󠁢󠁷󠁬󠁳󠁿 Y farchnad rataf yn Ewrop — 0% comisiwn | Gwerthwch o Gymru</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — y farchnad ar-lein rataf yn Ewrop gyfan gyda 
                <strong>0% comisiwn ar bob gwerthiant</strong>. <strong>30 diwrnod am ddim</strong>, 
                <strong>10 cynnyrch</strong>. Dechreuwch yn fach, tyfwch yn fawr. O Gaerdydd, Abertawe, Casnewydd — 
                gwerthwch ledled Ewrop.
              </p>
            </div>

            {/* IRISH / Gaeilge */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="ga">
              <h3>🇮🇪 An margadh is saoire san Eoraip — 0% coimisiún | Díol ó Éirinn</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — an margadh ar líne is saoire san Eoraip ar fad le 
                <strong>0% coimisiún ar gach díolachán</strong>. <strong>30 lá saor in aisce</strong>, 
                <strong>10 táirge</strong>. Tosaigh beag, fás mór. Ó Bhaile Átha Cliath, Corcaigh, Gaillimh — 
                díol ar fud na hEorpa.
              </p>
            </div>

            {/* Multilingual keyword block */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                marketplace Europe, cheapest marketplace Europe, 0 commission marketplace, zero fees marketplace, 
                sell online Europe, buy online Europe, start online business Europe, sell from home Europe,
                start a business from home UK, sell online UK no fees, marketplace Scotland, marketplace England, 
                marketplace Wales, marketplace Northern Ireland, sell from Edinburgh, sell from Glasgow, sell from London,
                marketplace Deutschland, marketplace Frankreich, marketplace Italien, marketplace Spanien, 
                marketplace France, marketplace Italie, marketplace Espagne, marketplace Pays-Bas,
                marketplace Italia, marketplace Spagna, marketplace Germania, marketplace España,
                marketplace Polska, marketplace Niemcy, marketplace Portugal, marketplace UK, 
                marketplace Sverige, marketplace Danmark, marketplace Suomi, marketplace Norge, 
                marketplace Ελλάδα, marketplace Česko, marketplace Magyarország, marketplace България, 
                marketplace Hrvatska, marketplace Slovensko, marketplace Slovenija, marketplace Schweiz, 
                marketplace Lietuva, marketplace Latvija, marketplace Eesti, marketplace Україна, marketplace Türkiye,
                sell online Scotland, marketplace Edinburgh, marketplace Glasgow, marketplace Aberdeen,
                start business Scotland free, sell online Wales, sell from Cardiff, sell from Belfast,
                free marketplace trial, 30 days free marketplace, sell 10 products free, earn money online Europe,
                start selling online free Europe, no commission marketplace, best free marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CityLandingSection;
