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

      <section className="py-12 bg-muted/30">
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

          {/* SEO-rich text block — visible to crawlers and users */}
          <div className="mt-10 max-w-4xl mx-auto text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              <strong>Market Place România</strong> este cel mai mare marketplace online românesc, disponibil în toate cele 42 de orașe mari: 
              marketplace București, marketplace Cluj-Napoca, marketplace Timișoara, marketplace Iași, marketplace Constanța, 
              marketplace Craiova, marketplace Brașov, marketplace Galați, marketplace Ploiești, marketplace Oradea, 
              marketplace Sibiu, marketplace Bacău, marketplace Arad, marketplace Pitești, marketplace Brăila, 
              marketplace Târgu Mureș, marketplace Baia Mare, marketplace Buzău, marketplace Botoșani și marketplace Suceava.
            </p>
            <p>
              Vinde și cumpără produse noi sau second hand în marketplace Satu Mare, marketplace Râmnicu Vâlcea, 
              marketplace Drobeta-Turnu Severin, marketplace Piatra Neamț, marketplace Târgoviște, marketplace Focșani, 
              marketplace Bistrița, marketplace Reșița, marketplace Tulcea, marketplace Slatina, marketplace Călărași, 
              marketplace Giurgiu, marketplace Deva, marketplace Hunedoara, marketplace Zalău, marketplace Sfântu Gheorghe, 
              marketplace Alba Iulia, marketplace Vaslui, marketplace Mediaș, marketplace Turda, marketplace Petroșani 
              și marketplace Alexandria — toate cu <strong>0% comision</strong> și plată securizată prin PayPal.
            </p>
            <p>
              Pe MarketPlaceRomania.com găsești electronice, haine, mobilă, auto, imobiliare și mii de alte categorii. 
              Abonamente de la <strong>11 LEI/lună</strong>. Livrare rapidă în toată România prin FAN Courier, Sameday și Cargus. 
              Market Place România® — primul market place din România construit cu inteligență artificială.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default CityLandingSection;
