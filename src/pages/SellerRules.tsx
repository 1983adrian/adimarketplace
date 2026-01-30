import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Store, FileText, Tag, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SellerRules() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Regulament pentru Vânzători</h1>
            <p className="text-muted-foreground">Reguli obligatorii pentru activitatea de vânzare pe MarketPlaceRomania</p>
          </div>

          <div className="space-y-6">
            {/* Responsabilitate produse */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Responsabilitatea produselor</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii sunt <strong className="text-foreground">responsabili integral</strong> pentru produsele listate pe platformă, inclusiv descrieri, fotografii, stare și autenticitate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrieri reale */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Descrieri corecte și complete</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Descrierile produselor trebuie să fie <strong className="text-foreground">reale și complete</strong>. Este interzisă prezentarea înșelătoare a caracteristicilor sau stării produselor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prețuri transparente */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Tag className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Prețuri transparente</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Prețurile afișate trebuie să <strong className="text-foreground">includă toate taxele aplicabile</strong>. Prețul final plătit de cumpărător nu poate depăși prețul afișat plus costul livrării.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legislație */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Respectarea legislației</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii trebuie să respecte <strong className="text-foreground">legislația privind protecția consumatorilor</strong>, inclusiv dreptul la retur în 14 zile pentru vânzări la distanță (conform OUG 34/2014).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acceptare regulament */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Acceptarea regulamentului</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Este <strong className="text-foreground">obligatorie acceptarea regulamentului</strong> înainte de publicarea anunțurilor. Vânzătorii confirmă că au citit și înțeles toate regulile.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sancțiuni */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Sancțiuni</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      MarketPlaceRomania își rezervă dreptul de a <strong className="text-foreground">elimina anunțuri sau conturi</strong> care încalcă aceste reguli, fără notificare prealabilă în cazuri grave.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last updated */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
