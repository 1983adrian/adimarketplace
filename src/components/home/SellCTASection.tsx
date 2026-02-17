import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, Shirt, ArrowRight, Zap } from 'lucide-react';

export const SellCTASection: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Zap className="h-3.5 w-3.5" />
            0% Comision pe Vânzări
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Vinde pe Marketplace România®
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Ai produse de vânzare? Haine nefolosite? Un magazin online? 
            Începe să vinzi fără comisioane — abonamente de la 11 LEI/lună.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <Store className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Afaceri & Magazine</p>
              <p className="text-xs text-muted-foreground">Canal nou, zero comisioane</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <ShoppingBag className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Vânzători Ocazionali</p>
              <p className="text-xs text-muted-foreground">Transformă obiectele în bani</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <Shirt className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Modă Second-Hand</p>
              <p className="text-xs text-muted-foreground">Dă o nouă viață hainelor</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="px-8">
            <Link to="/vinde-pe-marketplace">
              Află Cum Poți Vinde <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
