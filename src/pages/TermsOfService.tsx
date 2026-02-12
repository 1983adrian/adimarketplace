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
            <p className="text-muted-foreground">Market Place România — marketplaceromania.lovable.app</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Building2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.1. Despre platformă</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Market Place România este o platformă online de tip marketplace care facilitează contactul dintre vânzători și cumpărători din România și din întreaga lume. Platforma nu este parte în tranzacțiile dintre utilizatori și nu vinde produse în nume propriu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.2. Rolul Market Place România</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Market Place România acționează exclusiv ca intermediar tehnic. Toate produsele, descrierile, prețurile, livrarea și garanțiile sunt responsabilitatea exclusivă a vânzătorilor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Percent className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.5. Taxe și Abonamente</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Market Place România funcționează pe bază de <strong className="text-foreground">abonamente lunare fixe</strong> cu <strong className="text-foreground">0% comision pe vânzări</strong>. Nu există taxe pentru cumpărători. Vânzătorii noi beneficiază de 30 de zile gratuite. Planuri disponibile: START (11 LEI/lună), LICITAȚII (11 LEI/lună), SILVER (50 LEI/lună), GOLD (150 LEI/lună), PLATINUM (499 LEI/lună), VIP (999 LEI/lună — produse nelimitate).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Ban className="h-6 w-6 text-destructive mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.6. Produse interzise</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Este strict interzisă listarea de arme, substanțe ilegale, contrabandă, produse contrafăcute sau orice obiect care încalcă legislația în vigoare. Încălcarea duce la suspendarea imediată a contului.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1.7. Limitarea răspunderii</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Market Place România nu răspunde pentru calitatea produselor, livrare, retururi sau conflicte apărute între utilizatori. Platforma oferă un sistem de dispute pentru rezolvarea problemelor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
