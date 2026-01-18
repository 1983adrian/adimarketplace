import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Camera, DollarSign, Package, CreditCard, CheckCircle2,
  ArrowRight, ArrowLeft, Play, Lightbulb, AlertCircle, Star,
  Upload, Edit, Truck, Shield, Wallet, Building2, FileText,
  ChevronDown, ChevronUp, ExternalLink, Phone, MapPin, BadgeCheck
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const SellerGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      id: 'intro',
      title: 'Bine ai venit, Vânzător!',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      id: 'stripe',
      title: 'Configurare Stripe',
      icon: CreditCard,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'create',
      title: 'Adaugă Produs',
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'photos',
      title: 'Fotografii Profesionale',
      icon: Camera,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'pricing',
      title: 'Stabilire Preț',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'shipping',
      title: 'Livrare & Urmărire',
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 gap-2">
            <BookOpen className="h-4 w-4" />
            Ghid Complet Vânzător
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Învață să vinzi pe Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tot ce trebuie să știi pentru a-ți crea contul, lista produse și primi plăți - pas cu pas!
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tutorialSteps.map((step, index) => (
            <Button
              key={step.id}
              variant={currentStep === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="gap-2"
            >
              <step.icon className="h-4 w-4" />
              {step.title}
            </Button>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progres tutorial</span>
            <span className="font-medium">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / tutorialSteps.length) * 100} className="h-2" />
        </div>

        <Tabs value={tutorialSteps[currentStep].id} onValueChange={(v) => setCurrentStep(tutorialSteps.findIndex(s => s.id === v))}>
          <TabsList className="hidden">
            {tutorialSteps.map((step) => (
              <TabsTrigger key={step.id} value={step.id}>{step.title}</TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: Introduction */}
          <TabsContent value="intro" className="space-y-6">
            <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-yellow-500/20">
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Bine ai venit în comunitatea vânzătorilor!</CardTitle>
                    <CardDescription className="text-base">Să începem călătoria ta spre succes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Ce vei învăța
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
                        <span>Cum să îți configurezi contul Stripe pentru a primi bani</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">2</div>
                        <span>Cum să adaugi un produs nou pe marketplace</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">3</div>
                        <span>Cum să faci fotografii care vând</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">4</div>
                        <span>Cum să stabilești prețul corect</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">5</div>
                        <span>Cum să expediezi și să urmărești comenzile</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Sfaturi importante
                    </h3>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Cont Stripe obligatoriu</AlertTitle>
                      <AlertDescription>
                        Pentru a primi banii din vânzări, trebuie să ai un cont Stripe conectat. Fără el, plățile vor fi reținute.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Camera className="h-4 w-4" />
                      <AlertTitle>Fotografii de calitate</AlertTitle>
                      <AlertDescription>
                        Produsele cu fotografii clare și profesionale se vând de 3x mai repede!
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Durată estimată: ~10 minute</p>
                  <Button onClick={() => setCurrentStep(1)} className="gap-2">
                    Începe Tutorialul
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Stripe Setup */}
          <TabsContent value="stripe" className="space-y-6">
            <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-purple-500/20">
                    <CreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Configurare Cont Stripe</CardTitle>
                    <CardDescription className="text-base">Pasul cel mai important - fără el nu poți primi bani!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-500/50 bg-red-500/5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle className="text-red-600">Obligatoriu!</AlertTitle>
                  <AlertDescription>
                    Stripe este singura metodă prin care poți primi banii din vânzări. Configurează-l înainte de a lista produse!
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">📋 Ce ai nevoie pentru înregistrare Stripe:</h3>
                  
                  <div className="grid gap-3">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">1. Document de Identitate</h4>
                        <p className="text-sm text-muted-foreground">Buletin, pașaport sau permis de conducere valid</p>
                        <Badge variant="secondary" className="mt-2">Poză față + spate</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">2. Adresă Completă din UK</h4>
                        <p className="text-sm text-muted-foreground">Adresa ta de reședință completă cu cod poștal</p>
                        <Badge variant="secondary" className="mt-2">Trebuie să fie aceeași cu cea de pe document</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">3. Cont Bancar UK</h4>
                        <p className="text-sm text-muted-foreground">Sort Code (6 cifre) și Account Number (8 cifre)</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Ex: Sort Code: 04-00-04</Badge>
                          <Badge variant="outline">Ex: Account: 12345678</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">4. Număr de Telefon UK</h4>
                        <p className="text-sm text-muted-foreground">Pentru verificare prin SMS</p>
                        <Badge variant="secondary" className="mt-2">Format: +44 7XXX XXX XXX</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">🚀 Pași pentru conectare Stripe:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <p className="font-medium">Mergi în Setări → Încasări</p>
                        <p className="text-sm text-muted-foreground">Din meniul contului tău</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=payouts')}>
                        Deschide <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <p className="font-medium">Apasă "Conectează Cont Stripe"</p>
                        <p className="text-sm text-muted-foreground">Vei fi redirecționat către Stripe</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <p className="font-medium">Completează formularul Stripe</p>
                        <p className="text-sm text-muted-foreground">Durează aproximativ 5-10 minute</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">4</div>
                      <div className="flex-1">
                        <p className="font-medium">Verificare automată</p>
                        <p className="text-sm text-muted-foreground">Stripe verifică datele tale (poate dura până la 24h)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border border-green-500/50 bg-green-500/5">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
                      <div className="flex-1">
                        <p className="font-medium text-green-600">Gata! Poți primi plăți</p>
                        <p className="text-sm text-muted-foreground">Banii vor ajunge automat în contul tău bancar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>Ce se întâmplă dacă nu am cont Stripe?</AccordionTrigger>
                    <AccordionContent>
                      Ți se va crea automat un cont nou când apeși pe "Conectează Stripe". Nu trebuie să ai un cont dinainte - procesul de înregistrare se face direct prin platforma noastră.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>Cât durează verificarea?</AccordionTrigger>
                    <AccordionContent>
                      De obicei, verificarea este instantă. În cazuri rare, Stripe poate cere documente suplimentare și verificarea poate dura până la 24-48 de ore.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>Ce comisioane percepe Stripe?</AccordionTrigger>
                    <AccordionContent>
                      Platforma percepe un comision de 10% din fiecare vânzare. Stripe în sine nu percepe comisioane suplimentare pentru transferurile către contul tău bancar.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} className="gap-2">
                    Următorul: Adaugă Produs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Create Product */}
          <TabsContent value="create" className="space-y-6">
            <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20">
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Adaugă un Produs Nou</CardTitle>
                    <CardDescription className="text-base">Creează anunțul tău în câteva minute</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">📝 Cum să adaugi un produs:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                      <div className="flex-1">
                        <h4 className="font-bold">Mergi în Dashboard → "Adaugă Produs"</h4>
                        <p className="text-sm text-muted-foreground mb-2">Sau apasă butonul + din meniul principal</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/create-listing')}>
                          Adaugă Produs Acum <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-bold">Completează Titlul</h4>
                        <p className="text-sm text-muted-foreground">Fii specific și descriptiv</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-green-600">✓ Bun: "iPhone 14 Pro Max 256GB Space Black - Stare Impecabilă"</p>
                          <p className="text-xs text-red-500">✗ Rău: "Telefon de vânzare"</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-bold">Selectează Categoria</h4>
                        <p className="text-sm text-muted-foreground">Alege categoria care se potrivește cel mai bine produsului</p>
                        <Badge variant="secondary" className="mt-2">Categoriile ajută cumpărătorii să găsească produsul</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">4</div>
                      <div>
                        <h4 className="font-bold">Adaugă Descrierea</h4>
                        <p className="text-sm text-muted-foreground">Descrie produsul în detaliu</p>
                        <ul className="mt-2 text-sm space-y-1">
                          <li>• Starea produsului (nou, folosit, defecte)</li>
                          <li>• Specificații tehnice</li>
                          <li>• Ce include pachetul</li>
                          <li>• Motivul vânzării</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">5</div>
                      <div>
                        <h4 className="font-bold">Selectează Condiția</h4>
                        <p className="text-sm text-muted-foreground">Fii sincer despre starea produsului</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge>Nou</Badge>
                          <Badge variant="secondary">Ca Nou</Badge>
                          <Badge variant="secondary">Bun</Badge>
                          <Badge variant="secondary">Acceptabil</Badge>
                          <Badge variant="outline">Cu Defecte</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">6</div>
                      <div>
                        <h4 className="font-bold">Publică Anunțul</h4>
                        <p className="text-sm text-muted-foreground">Apasă "Publică" și anunțul va fi vizibil imediat</p>
                        <Badge className="mt-2 bg-green-500">Poți edita oricând după publicare</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Sfat Pro</AlertTitle>
                  <AlertDescription>
                    Anunțurile complete și detaliate se vând de 5x mai repede decât cele cu informații minime!
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="gap-2">
                    Următorul: Fotografii
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Photos */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-green-500/20">
                    <Camera className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Fotografii care Vând</CardTitle>
                    <CardDescription className="text-base">Secretele fotografiilor profesionale cu telefonul</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-green-500/50 bg-green-500/5">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Știai că...</AlertTitle>
                  <AlertDescription>
                    Produsele cu fotografii de calitate se vând de 3x mai repede și la prețuri cu 20% mai mari!
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Fă Așa ✓
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-green-700">☀️ Lumină naturală</p>
                        <p className="text-sm text-muted-foreground">Fotografiază lângă fereastră, ziua</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-green-700">📐 Fundal simplu</p>
                        <p className="text-sm text-muted-foreground">Alb, gri sau o masă curată</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-green-700">📷 Mai multe unghiuri</p>
                        <p className="text-sm text-muted-foreground">Față, spate, lateral, detalii</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-green-700">🔍 Arată defectele</p>
                        <p className="text-sm text-muted-foreground">Fotografii clare cu orice zgârietură</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-green-700">📦 Include accesoriile</p>
                        <p className="text-sm text-muted-foreground">Tot ce primește cumpărătorul</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Evită ✗
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-red-700">🌙 Lumină slabă</p>
                        <p className="text-sm text-muted-foreground">Fotografii întunecate, neclare</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-red-700">🗑️ Fundal dezordonat</p>
                        <p className="text-sm text-muted-foreground">Pat nestrâns, masă plină</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-red-700">🖼️ Fotografii de pe net</p>
                        <p className="text-sm text-muted-foreground">Folosește doar poze proprii!</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-red-700">📱 O singură poză</p>
                        <p className="text-sm text-muted-foreground">Minimum 3-4 fotografii</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-red-700">✨ Filtre exagerate</p>
                        <p className="text-sm text-muted-foreground">Arată produsul real</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">📸 Câte fotografii să adaugi:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-3xl font-bold text-primary">1</div>
                      <p className="text-sm text-muted-foreground">Poza principală</p>
                      <p className="text-xs">(cea mai bună)</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-3xl font-bold text-blue-500">2-3</div>
                      <p className="text-sm text-muted-foreground">Unghiuri diferite</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-3xl font-bold text-green-500">1-2</div>
                      <p className="text-sm text-muted-foreground">Detalii/defecte</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-3xl font-bold text-orange-500">1</div>
                      <p className="text-sm text-muted-foreground">Accesorii incluse</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="gap-2">
                    Următorul: Stabilire Preț
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Pricing */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/20">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Stabilește Prețul Corect</CardTitle>
                    <CardDescription className="text-base">Strategii pentru a vinde rapid și profitabil</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">💰 Cum să stabilești prețul:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                        <div>
                          <p className="font-medium">Cercetează piața</p>
                          <p className="text-sm text-muted-foreground">Caută produse similare și vezi la cât se vând</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                        <div>
                          <p className="font-medium">Consideră starea</p>
                          <p className="text-sm text-muted-foreground">Nou = 80-90% din retail, Folosit = 50-70%</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                        <div>
                          <p className="font-medium">Lasă loc de negociere</p>
                          <p className="text-sm text-muted-foreground">Adaugă 5-10% peste prețul dorit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">📊 Exemplu practic:</h3>
                    <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                      <div className="flex justify-between">
                        <span>Preț nou în magazin:</span>
                        <span className="font-bold">£1,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stare "Ca Nou" (-30%):</span>
                        <span className="font-bold">£700</span>
                      </div>
                      <div className="flex justify-between">
                        <span>+ Marjă negociere (+10%):</span>
                        <span className="font-bold">£770</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-green-600">Preț recomandat:</span>
                        <span className="font-bold text-green-600">£770</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Nu uita de comision!</AlertTitle>
                  <AlertDescription>
                    Platforma percepe un comision de <strong>10%</strong> din vânzare. Dacă vinzi la £100, primești £90 net.
                  </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tip-1">
                    <AccordionTrigger>🚀 Sfat: Prețul psihologic</AccordionTrigger>
                    <AccordionContent>
                      Folosește prețuri care se termină în 9 sau 99 (£99 în loc de £100). Cumpărătorii percep aceste prețuri ca fiind semnificativ mai mici.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tip-2">
                    <AccordionTrigger>⏰ Când să cobori prețul?</AccordionTrigger>
                    <AccordionContent>
                      Dacă nu ai vizualizări în primele 3-5 zile, încearcă să reduci prețul cu 5-10%. Dacă ai vizualizări dar nu ai vânzări, probabil prețul e prea mare pentru piață.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button onClick={() => setCurrentStep(5)} className="gap-2">
                    Următorul: Livrare
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 6: Shipping */}
          <TabsContent value="shipping" className="space-y-6">
            <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-orange-500/20">
                    <Truck className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Livrare & Urmărire</CardTitle>
                    <CardDescription className="text-base">Cum să expediezi și să urmărești comenzile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">📦 După ce primești o comandă:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-bold">Primești notificare de comandă</h4>
                        <p className="text-sm text-muted-foreground">Email + notificare în aplicație când cineva cumpără</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-bold">Pregătește coletul</h4>
                        <p className="text-sm text-muted-foreground">Împachetează produsul cu grijă și sigur</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>• Folosește cutie/plic de dimensiuni potrivite</p>
                          <p>• Adaugă material de protecție (bubble wrap)</p>
                          <p>• Lipește eticheta clar vizibilă</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-bold">Expediază cu un curier</h4>
                        <p className="text-sm text-muted-foreground">Royal Mail, DPD, Evri, etc.</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">📮 Royal Mail</Badge>
                          <Badge variant="outline">📦 DPD</Badge>
                          <Badge variant="outline">🚚 Evri</Badge>
                          <Badge variant="outline">✈️ DHL</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">4</div>
                      <div>
                        <h4 className="font-bold">Adaugă numărul de tracking</h4>
                        <p className="text-sm text-muted-foreground">În pagina comenzii, adaugă AWB-ul primit de la curier</p>
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Tracking-ul este obligatoriu! Fără el, nu poți dovedi că ai trimis coletul.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl border border-green-500/50 bg-green-500/5">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shrink-0">5</div>
                      <div>
                        <h4 className="font-bold text-green-600">Cumpărătorul confirmă primirea</h4>
                        <p className="text-sm text-muted-foreground">După confirmare, banii sunt transferați în contul tău Stripe!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <h3 className="font-bold text-lg mb-3">🎉 Felicitări! Ai terminat tutorialul!</h3>
                  <p className="text-muted-foreground mb-4">
                    Acum știi tot ce trebuie pentru a vinde cu succes pe marketplace. Ești gata să începi?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/settings?tab=payouts')} className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      Conectează Stripe
                    </Button>
                    <Button onClick={() => navigate('/create-listing')} variant="secondary" className="gap-2">
                      <Package className="h-4 w-4" />
                      Adaugă Primul Produs
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2">
                      Dashboard
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(4)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-2">
                    <Play className="h-4 w-4" />
                    Revezi de la început
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerGuide;
