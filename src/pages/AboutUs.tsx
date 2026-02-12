import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Smartphone, ShoppingCart, Link as LinkIcon, CheckCircle, CreditCard, Shield, Users, Check, Crown, Star, Sparkles, Bot } from 'lucide-react';

export default function AboutUs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
           {/* Header */}
           <div className="text-center">
             <h1 className="text-3xl md:text-4xl font-bold mb-4">Despre Market Place România</h1>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Suntem <strong className="text-primary">prima platformă marketplace din România construită cu inteligență artificială</strong> și primul marketplace din lume care oferă <strong className="text-primary">Bifă Albastră</strong> vânzătorilor de top — la fel ca la vedetele de pe rețelele sociale. Cu <strong className="text-primary">0% comision pe vânzări</strong> și abonamente fixe de la 11 LEI/lună, conectăm vânzători și cumpărători într-un mediu sigur, transparent și profesionist.
             </p>
           </div>

           {/* Construită cu AI */}
           <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
             <CardContent className="p-6">
               <div className="flex items-start gap-4">
                 <div className="p-3 rounded-xl bg-primary/20 text-primary">
                   <Bot className="h-7 w-7" />
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <h3 className="font-bold text-lg">Prima Platformă Construită cu AI</h3>
                     <Badge variant="secondary" className="text-xs">Unic în România</Badge>
                   </div>
                   <p className="text-muted-foreground">
                     Market Place România este <strong className="text-foreground">prima platformă de tip marketplace din România dezvoltată integral cu inteligență artificială</strong>. Tehnologia AI ne permite să oferim o experiență de utilizare superioară, detectare automată a fraudelor, traducere în timp real și optimizări continue ale platformei.
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Bifa Albastră — Secțiune dedicată SEO */}
           <div className="space-y-4">
             <div className="flex items-center gap-3">
               <span className="h-8 w-8 rounded-full bg-[#1d9bf0] inline-flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 8px rgba(29, 155, 240, 0.4)' }}>
                 <Check className="h-5 w-5 text-white" strokeWidth={3.5} />
               </span>
               <h2 className="text-2xl font-bold">Bifă Albastră — Primul Marketplace cu Verificare ca la Vedete</h2>
             </div>
             <p className="text-muted-foreground leading-relaxed">
               Market Place România este <strong className="text-foreground">singurul marketplace din România — și primul din lume</strong> — care oferă un sistem de <strong className="text-foreground">Bifă Albastră (✓)</strong> similar cu cel de pe rețelele sociale ale vedetelor și influencerilor. Acest semn distinctiv certifică vânzătorii de elită ai platformei.
             </p>
             
             <Card className="border-[#1d9bf0]/30 bg-[#1d9bf0]/5">
               <CardContent className="p-6 space-y-4">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                   <Crown className="h-5 w-5 text-amber-500" />
                   Cum se obține Bifa Albastră?
                 </h3>
                 <p className="text-muted-foreground">
                   Bifa Albastră se acordă <strong className="text-foreground">automat și exclusiv</strong> celor mai buni vânzători de pe platformă, pe baza unui sistem transparent de criterii:
                 </p>
                 <div className="grid gap-3">
                   <div className="flex items-start gap-3">
                     <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                       <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                     </div>
                     <p className="text-muted-foreground">
                       <strong className="text-foreground">Top 10 Vânzători</strong> — Doar primii 10 vânzători cu cele mai multe produse vândute și livrate cu succes primesc Bifa Albastră.
                     </p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                       <Sparkles className="h-3.5 w-3.5 text-primary" />
                     </div>
                     <p className="text-muted-foreground">
                       <strong className="text-foreground">Sistem 100% Automat</strong> — Clasamentul se actualizează în timp real. Dacă un vânzător iese din Top 10, pierde automat Bifa Albastră. Dacă intră în Top 10, o primește automat.
                     </p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                       <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                     </div>
                     <p className="text-muted-foreground">
                       <strong className="text-foreground">Transparență totală</strong> — Nu se poate cumpăra și nu se acordă manual. Este un semn al excelenței bazat exclusiv pe performanța reală a vânzătorului.
                     </p>
                   </div>
                 </div>
                 <div className="bg-muted/50 rounded-lg p-4 mt-2">
                   <p className="text-sm text-muted-foreground italic">
                     💡 Vânzătorii cu Bifă Albastră beneficiază de vizibilitate sporită, numele magazinului afișat public și încrederea cumpărătorilor. Este cea mai înaltă distincție pe Market Place România.
                   </p>
                 </div>
               </CardContent>
             </Card>
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
