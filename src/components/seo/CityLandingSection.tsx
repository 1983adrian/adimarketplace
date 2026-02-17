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

            {/* European SEO block - ENGLISH */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="en">
              <h3>🇪🇺 The Cheapest Marketplace in Europe — 0% Sales Commission</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> is the cheapest online marketplace in all of Europe. 
                While Amazon charges up to 15% commission, eBay up to 13%, and Etsy up to 6.5%, 
                MarketPlaceRomania.com charges <strong>0% commission on all sales</strong>. 
                You only pay a fixed subscription starting from just <strong>€2/month</strong>.
              </p>
              <p>
                <strong>Start your online business today!</strong> Whether you're a small business owner, 
                a handmade creator, or someone who wants to sell from home — MarketPlaceRomania.com is the perfect 
                platform to start selling across Europe with zero fees. Create your store in minutes, list unlimited 
                products, and reach millions of buyers. No experience needed. 30 days free trial!
              </p>
              <p>
                <strong>Sell across Europe with 0% fees:</strong> Germany, France, Italy, Spain, 
                Netherlands, Belgium, Austria, Poland, Portugal, United Kingdom, Sweden, Denmark, Finland, Norway, 
                Ireland, Greece, Czech Republic, Hungary, Bulgaria, Croatia, Slovakia, Slovenia, Switzerland, 
                Lithuania, Latvia, Estonia, Luxembourg, Malta, Cyprus — sell with <strong>zero commission</strong>.
              </p>
              <p>
                ✅ 0% sales commission, ✅ Online auctions, ✅ Secure PayPal payments, 
                ✅ 14-day EU return guarantee, ✅ AI-powered, ✅ Ship to all EU countries, 
                ✅ 30 days free trial, ✅ From €2/month. Best alternative to Amazon, eBay, Etsy, Vinted.
              </p>
            </div>

            {/* GERMAN / Deutsch */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="de">
              <h3>🇩🇪 Der günstigste Marktplatz in Europa — 0% Verkaufsprovision</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> ist der günstigste Online-Marktplatz in ganz Europa. 
                Amazon verlangt bis zu 15% Provision, eBay bis zu 13%, Etsy bis zu 6,5% — 
                MarketPlaceRomania.com berechnet <strong>0% Provision auf alle Verkäufe</strong>. 
                Nur ein festes Abo ab <strong>2€/Monat</strong>.
              </p>
              <p>
                <strong>Starten Sie Ihr Online-Geschäft noch heute!</strong> Ob kleiner Unternehmer, Handwerker oder 
                Heimverkäufer — erstellen Sie Ihren Shop in Minuten, verkaufen Sie europaweit ohne Gebühren. 
                30 Tage kostenlos testen! Beste Alternative zu Amazon, eBay, Kleinanzeigen, Vinted.
              </p>
            </div>

            {/* FRENCH / Français */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="fr">
              <h3>🇫🇷 Le marketplace le moins cher d'Europe — 0% de commission</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> est le marketplace le moins cher de toute l'Europe. 
                Amazon facture jusqu'à 15%, eBay 13%, Etsy 6,5% — MarketPlaceRomania.com prend 
                <strong>0% de commission sur toutes les ventes</strong>. Abonnement fixe dès <strong>2€/mois</strong>.
              </p>
              <p>
                <strong>Lancez votre activité en ligne dès aujourd'hui !</strong> Créez votre boutique en minutes, 
                vendez dans toute l'Europe sans frais. 30 jours d'essai gratuit ! 
                Meilleure alternative à Amazon, eBay, Leboncoin, Vinted.
              </p>
            </div>

            {/* ITALIAN / Italiano */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="it">
              <h3>🇮🇹 Il marketplace più economico d'Europa — 0% di commissione</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> è il marketplace più economico di tutta Europa. 
                Amazon addebita fino al 15%, eBay 13%, Etsy 6,5% — MarketPlaceRomania.com: 
                <strong>0% commissione su tutte le vendite</strong>. Abbonamento da soli <strong>2€/mese</strong>.
              </p>
              <p>
                <strong>Avvia la tua attività online oggi!</strong> Crea il tuo negozio in minuti, vendi in tutta Europa 
                senza commissioni. 30 giorni di prova gratuita! Migliore alternativa ad Amazon, eBay, Subito, Vinted.
              </p>
            </div>

            {/* SPANISH / Español */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="es">
              <h3>🇪🇸 El marketplace más barato de Europa — 0% de comisión</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> es el marketplace más barato de toda Europa. 
                Amazon cobra hasta 15%, eBay 13%, Etsy 6,5% — MarketPlaceRomania.com cobra 
                <strong>0% de comisión en todas las ventas</strong>. Suscripción desde solo <strong>2€/mes</strong>.
              </p>
              <p>
                <strong>¡Empieza tu negocio online hoy!</strong> Crea tu tienda en minutos, vende en toda Europa 
                sin comisiones. ¡30 días de prueba gratis! Mejor alternativa a Amazon, eBay, Wallapop, Vinted.
              </p>
            </div>

            {/* DUTCH / Nederlands */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="nl">
              <h3>🇳🇱 De goedkoopste marktplaats van Europa — 0% verkoopcommissie</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> is de goedkoopste online marktplaats van heel Europa met 
                <strong>0% commissie op alle verkopen</strong>. Vast abonnement vanaf slechts <strong>€2/maand</strong>.
              </p>
              <p>
                <strong>Start vandaag uw online bedrijf!</strong> Maak uw winkel aan in minuten, verkoop in heel Europa 
                zonder kosten. 30 dagen gratis proberen! Beste alternatief voor Marktplaats.nl, Amazon, eBay, Vinted.
              </p>
            </div>

            {/* POLISH / Polski */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="pl">
              <h3>🇵🇱 Najtańszy marketplace w Europie — 0% prowizji od sprzedaży</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> to najtańszy marketplace w całej Europie z 
                <strong>0% prowizji od wszystkich sprzedaży</strong>. Stały abonament od zaledwie <strong>2€/miesiąc</strong>.
              </p>
              <p>
                <strong>Rozpocznij swój biznes online już dziś!</strong> Utwórz sklep w kilka minut, sprzedawaj w całej Europie 
                bez prowizji. 30 dni za darmo! Najlepsza alternatywa dla Allegro, OLX, Amazon, Vinted.
              </p>
            </div>

            {/* PORTUGUESE / Português */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="pt">
              <h3>🇵🇹 O marketplace mais barato da Europa — 0% de comissão</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> é o marketplace mais barato da Europa com 
                <strong>0% de comissão em todas as vendas</strong>. Assinatura fixa desde <strong>2€/mês</strong>.
              </p>
              <p>
                <strong>Comece o seu negócio online hoje!</strong> Crie a sua loja em minutos, venda em toda a Europa 
                sem comissões. 30 dias grátis! Melhor alternativa ao OLX, Amazon, eBay, Vinted.
              </p>
            </div>

            {/* SWEDISH / Svenska */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sv">
              <h3>🇸🇪 Europas billigaste marknadsplats — 0% försäljningsprovision</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> är den billigaste marknadsplatsen i hela Europa med 
                <strong>0% provision på all försäljning</strong>. Fast prenumeration från bara <strong>2€/månad</strong>.
                Starta ditt onlineföretag idag! 30 dagars gratis provperiod!
              </p>
            </div>

            {/* DANISH / Dansk */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="da">
              <h3>🇩🇰 Europas billigste markedsplads — 0% salgskommission</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> er den billigste markedsplads i hele Europa med 
                <strong>0% kommission på alle salg</strong>. Fast abonnement fra kun <strong>2€/måned</strong>.
                Start din online-forretning i dag! 30 dages gratis prøveperiode!
              </p>
            </div>

            {/* FINNISH / Suomi */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="fi">
              <h3>🇫🇮 Euroopan halvin markkinapaikka — 0% myyntiprovisio</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> on halvin verkkokauppapaikka koko Euroopassa: 
                <strong>0% provisiota kaikista myynneistä</strong>. Kiinteä tilaus alkaen <strong>2€/kuukausi</strong>.
                Aloita verkkoliiketoimintasi tänään! 30 päivän ilmainen kokeilu!
              </p>
            </div>

            {/* NORWEGIAN / Norsk */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="no">
              <h3>🇳🇴 Europas billigste markedsplass — 0% salgsprovisjon</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> er den billigste nettmarkedsplassen i hele Europa med 
                <strong>0% provisjon på alt salg</strong>. Fast abonnement fra kun <strong>2€/måned</strong>.
                Start din nettbutikk i dag! 30 dagers gratis prøveperiode!
              </p>
            </div>

            {/* GREEK / Ελληνικά */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="el">
              <h3>🇬🇷 Η φθηνότερη αγορά στην Ευρώπη — 0% προμήθεια πωλήσεων</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> είναι η φθηνότερη ηλεκτρονική αγορά σε ολόκληρη την Ευρώπη: 
                <strong>0% προμήθεια σε όλες τις πωλήσεις</strong>. Σταθερή συνδρομή από μόλις <strong>2€/μήνα</strong>.
                Ξεκινήστε την επιχείρησή σας σήμερα! 30 ημέρες δωρεάν δοκιμή!
              </p>
            </div>

            {/* CZECH / Čeština */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="cs">
              <h3>🇨🇿 Nejlevnější marketplace v Evropě — 0% provize z prodeje</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> je nejlevnější online tržiště v celé Evropě: 
                <strong>0% provize ze všech prodejů</strong>. Fixní předplatné od <strong>2€/měsíc</strong>.
                Začněte svůj online byznys ještě dnes! 30 dní zdarma!
              </p>
            </div>

            {/* HUNGARIAN / Magyar */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="hu">
              <h3>🇭🇺 Európa legolcsóbb piactere — 0% eladási jutalék</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> a legolcsóbb online piactér egész Európában: 
                <strong>0% jutalék minden eladásra</strong>. Fix előfizetés mindössze <strong>2€/hó</strong>-tól.
                Indítsa el online vállalkozását még ma! 30 napos ingyenes próbaidőszak!
              </p>
            </div>

            {/* BULGARIAN / Български */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="bg">
              <h3>🇧🇬 Най-евтиният маркетплейс в Европа — 0% комисиона</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> е най-евтиният онлайн маркетплейс в цяла Европа: 
                <strong>0% комисиона от всички продажби</strong>. Фиксиран абонамент от <strong>2€/месец</strong>.
                Започнете своя онлайн бизнес днес! 30 дни безплатен пробен период!
              </p>
            </div>

            {/* CROATIAN / Hrvatski */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="hr">
              <h3>🇭🇷 Najjeftiniji marketplace u Europi — 0% provizije</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> je najjeftiniji online marketplace u cijeloj Europi: 
                <strong>0% provizije na sve prodaje</strong>. Fiksna pretplata od samo <strong>2€/mjesec</strong>.
                Pokrenite svoj online posao danas! 30 dana besplatno!
              </p>
            </div>

            {/* SLOVAK / Slovenčina */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sk">
              <h3>🇸🇰 Najlacnejší marketplace v Európe — 0% provízia</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% provízia</strong>, predplatné od <strong>2€/mesiac</strong>. 
                Začnite predávať ešte dnes! 30 dní zadarmo!
              </p>
            </div>

            {/* SLOVENIAN / Slovenščina */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="sl">
              <h3>🇸🇮 Najcenejša tržnica v Evropi — 0% provizije</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% provizijo</strong>, naročnina od <strong>2€/mesec</strong>. 
                Začnite prodajati danes! 30 dni brezplačno!
              </p>
            </div>

            {/* LITHUANIAN / Lietuvių */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="lt">
              <h3>🇱🇹 Pigiausia prekyvietė Europoje — 0% komisinio</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% komisiniu</strong>, prenumerata nuo <strong>2€/mėn</strong>. 
                Pradėkite pardavinėti šiandien! 30 dienų nemokamas bandymas!
              </p>
            </div>

            {/* LATVIAN / Latviešu */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="lv">
              <h3>🇱🇻 Lētākais tirgus Eiropā — 0% komisija</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% komisiju</strong>, abonements no <strong>2€/mēnesī</strong>. 
                Sāciet pārdot šodien! 30 dienu bezmaksas izmēģinājums!
              </p>
            </div>

            {/* ESTONIAN / Eesti */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="et">
              <h3>🇪🇪 Euroopa odavaim turg — 0% vahendustasu</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% vahendustasuga</strong>, tellimus alates <strong>2€/kuus</strong>. 
                Alustage müüki juba täna! 30 päeva tasuta!
              </p>
            </div>

            {/* UKRAINIAN / Українська */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="uk">
              <h3>🇺🇦 Найдешевший маркетплейс в Європі — 0% комісії</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>0% комісії з продажів</strong>, підписка від <strong>2€/місяць</strong>. 
                Розпочніть свій онлайн-бізнес сьогодні! 30 днів безкоштовно!
              </p>
            </div>

            {/* TURKISH / Türkçe */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="tr">
              <h3>🇹🇷 Avrupa'nın en ucuz pazaryeri — %0 komisyon</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> — <strong>%0 satış komisyonu</strong>, abonelik sadece <strong>2€/ay</strong>'dan. 
                Online işinizi bugün başlatın! 30 gün ücretsiz deneme!
              </p>
            </div>

            {/* CHINESE / 中文 */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3" lang="zh">
              <h3>🇨🇳 欧洲最便宜的在线市场 — 0%销售佣金</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> 是全欧洲最便宜的在线市场，<strong>所有销售0%佣金</strong>。
                固定订阅费仅需<strong>2欧元/月</strong>起。今天就开始您的在线业务！30天免费试用！
              </p>
            </div>

            {/* Multilingual keyword block */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                marketplace Europe, cheapest marketplace Europe, 0 commission marketplace, zero fees marketplace, 
                sell online Europe, buy online Europe, start online business Europe, sell from home Europe,
                marketplace Deutschland, marketplace Frankreich, marketplace Italien, marketplace Spanien, 
                marketplace France, marketplace Italie, marketplace Espagne, marketplace Pays-Bas,
                marketplace Italia, marketplace Spagna, marketplace Germania, marketplace España,
                marketplace Polska, marketplace Niemcy, marketplace Portugal, marketplace UK, 
                marketplace Sverige, marketplace Danmark, marketplace Suomi, marketplace Norge, 
                marketplace Ελλάδα, marketplace Česko, marketplace Magyarország, marketplace България, 
                marketplace Hrvatska, marketplace Slovensko, marketplace Slovenija, marketplace Schweiz, 
                marketplace Lietuva, marketplace Latvija, marketplace Eesti, marketplace Україна, marketplace Türkiye.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CityLandingSection;
