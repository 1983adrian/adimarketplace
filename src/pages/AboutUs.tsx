import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, ShoppingCart, Link as LinkIcon, CheckCircle } from 'lucide-react';

export default function AboutUs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Despre Noi</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Suntem prima platformă din marketplace din România care revoluționează experiența de vânzare online prin inovație și libertate totală.
            </p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                <span className="text-primary font-semibold">Recunoaștere de Elită:</span>{' '}
                Suntem pionierii conceptului de Bifă Albă
                <Badge variant="secondary" className="ml-1 inline-flex items-center gap-1 align-middle">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                </Badge>
                . Utilizatorii noștri top accesează validări vizuale în viața lor, oferim autenticitate și încredere.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                Utilizatorii nu designul învechit. Oferim platformă similară cu Amazon și Administrație, oferim grijă afacerii cură maximă a interioare.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6 pt-4">
            {/* Interfață Next-Gen */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Interfață Next-Gen:</h3>
                    <p className="text-muted-foreground">
                      Am eliminat acest utilizat uniune, începe primul menu adaptiv, optimizează să arată exact ce ai și ce aplite nue aplicație mobil tiva, direct în browsul tau.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Libertate Fără Limite */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Libertate Fără Limite:</h3>
                    <p className="text-muted-foreground">
                      Credem a potențialul pentru și creștere, poți vinde fără nicu limit la nicu limit la anunțuri listat au a sumees încaster N u top. îți îngrădim cât a îți afacerea ca a restricție aucluse.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plăți Sigure cu MangoPay */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Plăți Sigure cu <span className="text-orange-500">MangoPay</span>
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Pentru siguranță cat tranzacțion tale, colaborăm MangoPay, sher fieci lider european în soluțion în plata securizate.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700 font-bold px-6"
                    >
                      Mango<span className="text-white">Pay</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* De ce să ne alegi noi? */}
          <div className="pt-6">
            <h2 className="text-2xl font-bold mb-4">De ce să ne alegi noi?</h2>
            <p className="text-muted-foreground">
              Am construlit acest ecosciștem pentru cei vor performanțe, vized, și un mediu profesionze. Fie că ești neiut au dici unelele necesari pur dominanțe pur piață.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
