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
            <p className="text-muted-foreground">Reguli obligatorii pentru vânzarea pe Market Place România — 0% comision, abonamente fixe</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Responsabilitatea produselor</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii sunt <strong className="text-foreground">responsabili integral</strong> pentru produsele listate pe Market Place România, inclusiv descrieri, fotografii, stare și autenticitate. Fiecare produs poate avea maxim 3 fotografii.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Descrieri corecte și complete</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Descrierile produselor trebuie să fie <strong className="text-foreground">reale și complete</strong>. Este interzisă prezentarea înșelătoare a caracteristicilor sau stării produselor. Fotografiile trebuie să reprezinte produsul real.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Tag className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Prețuri transparente</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Prețurile afișate trebuie să <strong className="text-foreground">includă toate taxele aplicabile</strong>. Prețul final plătit de cumpărător nu poate depăși prețul afișat plus costul livrării. Market Place România nu percepe comisioane pe vânzări (0%).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Tag className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Abonamente și Limite</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii plătesc un <strong className="text-foreground">abonament lunar fix</strong> care determină numărul maxim de produse active. Planurile sunt: START (11 LEI — 10 produse), SILVER (50 LEI — 50 produse), GOLD (150 LEI — 150 produse), PLATINUM (499 LEI — 500 produse), VIP (999 LEI — nelimitat). Vânzătorii noi primesc 30 de zile gratuite.
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
                    <h2 className="text-lg font-semibold mb-2">Respectarea legislației</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vânzătorii trebuie să respecte <strong className="text-foreground">legislația privind protecția consumatorilor</strong>, inclusiv dreptul la retur în 14 zile pentru vânzări la distanță (conform OUG 34/2014).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Acceptarea regulamentului</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Este <strong className="text-foreground">obligatorie acceptarea regulamentului</strong> înainte de publicarea anunțurilor. Prin activarea modului vânzător, confirmați că ați citit și înțeles toate regulile Market Place România.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive mt-1 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Sancțiuni</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Market Place România își rezervă dreptul de a <strong className="text-foreground">elimina anunțuri sau suspenda conturi</strong> care încalcă aceste reguli, fără notificare prealabilă în cazuri grave (arme, substanțe ilegale, contrabandă).
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
