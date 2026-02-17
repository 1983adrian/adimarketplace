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

            {/* European SEO block - hidden, indexed by Google across all Europe */}
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <h3>🇪🇺 The Cheapest Marketplace in Europe — 0% Sales Commission</h3>
              <p>
                <strong>MarketPlaceRomania.com</strong> is the cheapest online marketplace in all of Europe. 
                While Amazon charges up to 15% commission, eBay up to 13%, and Etsy up to 6.5%, 
                MarketPlaceRomania.com charges <strong>0% commission on all sales</strong>. 
                You only pay a fixed subscription starting from just <strong>€2/month</strong>.
              </p>
              <p>
                <strong>Sell across Europe with 0% fees:</strong> Whether you're in Germany, France, Italy, Spain, 
                Netherlands, Belgium, Austria, Poland, Portugal, United Kingdom, Sweden, Denmark, Finland, Norway, 
                Ireland, Greece, Czech Republic, Hungary, Bulgaria, Croatia, Slovakia, Slovenia, Switzerland, 
                Lithuania, Latvia, Estonia, Luxembourg, Malta, or Cyprus — you can sell on MarketPlaceRomania.com 
                with absolutely <strong>zero commission</strong>.
              </p>
              <p>
                <strong>Why MarketPlaceRomania.com is the best marketplace in Europe:</strong> 
                ✅ 0% sales commission — the lowest fees in all of Europe, 
                ✅ Online auctions like eBay but with no selling fees, 
                ✅ Secure payments via PayPal and credit card, 
                ✅ Buyer protection with 14-day EU return guarantee, 
                ✅ AI-powered platform for smart selling, 
                ✅ Ship to all EU countries, 
                ✅ 30 days free trial for new sellers, 
                ✅ Subscriptions from only €2/month.
              </p>
              <p>
                <strong>Best alternative to Amazon, eBay, Etsy, Vinted in Europe:</strong> 
                Stop paying huge commissions. On MarketPlaceRomania.com everything you sell is 100% yours. 
                The cheapest way to sell online in Europe. Available in all 27 EU countries plus UK, Norway, and Switzerland.
              </p>
              <p>
                <strong>Marketplace Europe keywords:</strong> marketplace Europe, cheapest marketplace Europe, 
                0 commission marketplace, zero fees marketplace, sell online Europe, buy online Europe, 
                European marketplace, marketplace no commission, best marketplace Europe, 
                marketplace Deutschland, marketplace France, marketplace Italia, marketplace España, 
                marketplace Polska, marketplace Nederland, marketplace Österreich, marketplace Belgique, 
                marketplace Portugal, marketplace UK, marketplace Sverige, marketplace Danmark, 
                marketplace Suomi, marketplace Norge, marketplace Ελλάδα, marketplace Česko, 
                marketplace Magyarország, marketplace България, marketplace Hrvatska, marketplace Slovensko, 
                marketplace Slovenija, marketplace Schweiz, marketplace Lietuva, marketplace Latvija, 
                marketplace Eesti, marketplace Luxembourg, marketplace Malta, marketplace Κύπρος.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CityLandingSection;
