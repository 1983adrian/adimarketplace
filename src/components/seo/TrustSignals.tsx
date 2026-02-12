import React from 'react';
import { Shield, Truck, CreditCard, HeadphonesIcon, Award, CheckCircle } from 'lucide-react';

export const TrustSignals: React.FC = () => {
  const signals = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Protecție Cumpărător',
      description: 'Garanție returnare 14 zile conform legislației UE',
      color: 'text-green-600'
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Livrare Rapidă',
      description: 'Expediere în 24-48h cu curieri verificați',
      color: 'text-blue-600'
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Plată Securizată',
      description: 'Tranzacții criptate SSL, plată la livrare disponibilă',
      color: 'text-primary'
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8" />,
      title: 'Suport 24/7',
      description: 'Asistență în limba română, răspuns rapid',
      color: 'text-amber-600'
    }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            De Ce Să Alegi Marketplace România?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Platformă 100% românească — 0% comision pe vânzări, doar abonament lunar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {signals.map((signal, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow"
            >
              <div className={`${signal.color} mb-4`}>
                {signal.icon}
              </div>
              <h3 className="font-semibold mb-2">{signal.title}</h3>
              <p className="text-sm text-muted-foreground">{signal.description}</p>
            </div>
          ))}
        </div>

        {/* Badges and certifications */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Verificat ANPC</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Conformitate GDPR</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-5 w-5 text-amber-600" />
            <span>0% comision pe vânzări</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Plăți securizate SSL</span>
          </div>
        </div>

        {/* Rich SEO content */}
        <div className="mt-10 p-6 rounded-xl bg-primary/5 border border-primary/10">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Despre Marketplace România
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Marketplace România</strong> este prima platformă românească de cumpărături și vânzări online 
            cu sistem de licitații integrate. Fondată în 2024, oferim o alternativă locală la platformele 
            internaționale precum OLX, eBay sau Amazon. Cu <strong>0% comision pe vânzări</strong> și abonamente accesibile de la 11 LEI/lună, 
            <strong>protecție cumpărător garantată</strong>, și suport pentru <strong>plata la livrare (ramburs)</strong>, 
            suntem alegerea ideală pentru românii care vor să vândă sau să cumpere online în siguranță. 
            Acceptăm plăți prin PayPal. Livrare în toată România și UK.
          </p>
        </div>
      </div>
    </section>
  );
};
