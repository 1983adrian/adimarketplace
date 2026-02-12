import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Smartphone, ShoppingCart, Link as LinkIcon, CheckCircle, CreditCard, Shield, Users } from 'lucide-react';

export default function AboutUs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Despre Market Place România</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Suntem primul market place online din România cu <strong className="text-primary">0% comision pe vânzări</strong> și abonamente fixe de la 11 LEI/lună. Platforma noastră conectează vânzători și cumpărători într-un mediu sigur, transparent și profesionist.
            </p>
          </div>

          {/* Misiunea noastră */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Misiunea noastră</h2>
            <p className="text-muted-foreground leading-relaxed">
              Market Place România a fost creat cu scopul de a oferi vânzătorilor din România o platformă modernă, fără comisioane ascunse. Credem că fiecare vânzător merită să păstreze <strong className="text-foreground">100% din veniturile sale</strong>, iar cumpărătorii merită o experiență de cumpărare sigură și simplă.
            </p>
          </div>

          {/* Avantaje */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">De ce Market Place România?</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-1 shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">0% comision pe vânzări</strong> — Tot ce vinzi rămâne al tău. Plătești doar un abonament fix lunar, fără surprize.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Plăți securizate</strong> — Tranzacțiile sunt procesate prin sisteme de plată de încredere, cu protecție pentru cumpărători și vânzători.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1 shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Comunitate verificată</strong> — Sistem de recenzii, verificare a vânzătorilor și Bifă Albastră pentru cei mai activi utilizatori din TOP 10.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6 pt-4">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Interfață Modernă</h3>
                    <p className="text-muted-foreground">
                      Platformă optimizată pentru mobil și desktop, cu design intuitiv și navigare rapidă. Instalează aplicația direct din browser, fără a descărca din magazinele de aplicații.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Abonamente Flexibile</h3>
                    <p className="text-muted-foreground">
                      Planuri de la 11 LEI/lună (START) până la VIP (999 LEI/lună, produse nelimitate). Vânzătorii noi primesc 30 de zile gratuite cu maxim 10 produse. Fără comisioane, fără taxe ascunse.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Sistem de Licitații</h3>
                    <p className="text-muted-foreground">
                      Pe lângă vânzarea directă, Market Place România oferă un sistem complet de licitații online. Cumpărătorii pot licita pe produse, iar vânzătorii beneficiază de prețuri competitive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center bg-muted/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Alătură-te comunității</h2>
            <p className="text-muted-foreground mb-6">
              Începe să vinzi sau să cumperi pe Market Place România — simplu, sigur și fără comisioane.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/seller-mode">Începe să Vinzi</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/browse">Explorează Produse</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
