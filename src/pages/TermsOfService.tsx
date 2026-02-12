import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertTriangle, Users, Percent, Ban, Scale, Building2 } from 'lucide-react';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Termeni și Condiții</h1>
            <p className="text-muted-foreground">MarketPlaceRomania.com</p>
          </div>

          <div className="space-y-8">
            {/* 1. Despre platformă */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Building2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.1. Despre platformă</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      MarketPlaceRomania.com este o platformă online de tip marketplace care facilitează contactul dintre vânzători și cumpărători. Platforma nu este parte în tranzacțiile dintre utilizatori și nu vinde produse în nume propriu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.2. Rolul MarketPlaceRomania */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.2. Rolul MarketPlaceRomania</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      MarketPlaceRomania acționează exclusiv ca intermediar tehnic. Toate produsele, descrierile, prețurile, livrarea și garanțiile sunt responsabilitatea vânzătorilor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.3. Conturi de utilizator */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.3. Conturi de utilizator</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Crearea unui cont presupune furnizarea de informații reale și acceptarea prezentelor Termeni și Condiții. Platforma își rezervă dreptul de a suspenda sau șterge conturi care încalcă regulile.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.4. Vânzători */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.4. Vânzători</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii sunt obligați să declare dacă acționează ca persoană fizică sau persoană juridică și să respecte legislația în vigoare privind comerțul electronic și protecția consumatorilor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.5. Comision */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Percent className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.5. Abonamente</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Platforma funcționează pe bază de <strong className="text-foreground">abonamente lunare</strong>. Nu există comisioane pe vânzări (0%). Vânzătorii noi beneficiază de 30 de zile gratuite. Planuri disponibile: START (11 LEI), SILVER (50 LEI), GOLD (150 LEI), PLATINUM (499 LEI), VIP (999 LEI).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.6. Produse interzise */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Ban className="h-6 w-6 text-destructive mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.6. Produse interzise</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Este strict interzisă listarea de produse ilegale, contrafăcute sau care încalcă drepturile terților.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1.7. Limitarea răspunderii */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.7. Limitarea răspunderii</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      MarketPlaceRomania nu răspunde pentru calitatea produselor, livrare, retururi sau conflicte apărute între utilizatori.
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
