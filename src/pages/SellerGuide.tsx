import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Camera, Package, CheckCircle2,
  ArrowRight, ArrowLeft, Lightbulb, Star,
  Truck, Shield, Wallet, Building2, FileText,
  ExternalLink, MapPin, BadgeCheck, Play, Pause,
  Clock, PercentCircle, Receipt
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const SellerGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const tutorialSteps = [
    {
      id: 'intro',
      title: 'Bine ai venit!',
      icon: Star,
      color: 'text-yellow-500',
      duration: '30 sec',
    },
    {
      id: 'mangopay',
      title: 'Verificare MangoPay',
      icon: Shield,
      color: 'text-green-500',
      duration: '45 sec',
    },
    {
      id: 'listing',
      title: 'Creează Anunț',
      icon: Package,
      color: 'text-blue-500',
      duration: '45 sec',
    },
    {
      id: 'photos',
      title: 'Fotografii',
      icon: Camera,
      color: 'text-purple-500',
      duration: '30 sec',
    },
    {
      id: 'shipping',
      title: 'Livrare & Plată',
      icon: Truck,
      color: 'text-orange-500',
      duration: '30 sec',
    },
  ];

  const totalDuration = "3 minute";
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 gap-2">
            <BookOpen className="h-4 w-4" />
            Ghid Rapid Vânzător • {totalDuration}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            Cum să vinzi pe AdiMarket
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Învață în 3 minute cum funcționează platforma, cum primești banii și cum expediezi comenzile
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tutorialSteps.map((step, index) => (
            <Button
              key={step.id}
              variant={currentStep === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="gap-2"
            >
              <step.icon className={`h-4 w-4 ${currentStep === index ? '' : step.color}`} />
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </Button>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Pas {currentStep + 1} din {tutorialSteps.length}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Step 1: Introduction */}
          {currentStep === 0 && (
            <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-yellow-500/20">
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Bine ai venit în AdiMarket!</CardTitle>
                    <CardDescription>Platformă de vânzare sigură cu plăți prin MangoPay</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-green-500/30 bg-green-500/5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">Cum funcționează?</AlertTitle>
                  <AlertDescription>
                    1. Te verifici prin MangoPay → 2. Postezi produse → 3. Vinzi → 4. Primești banii automat în cont
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <PercentCircle className="h-5 w-5" />
                      Comision Platformă
                    </div>
                    <p className="text-2xl font-bold">10%</p>
                    <p className="text-sm text-muted-foreground">
                      Din fiecare vânzare. Restul de 90% + costul livrării îți revine ție.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Receipt className="h-5 w-5" />
                      Taxă Cumpărător
                    </div>
                    <p className="text-2xl font-bold">£2</p>
                    <p className="text-sm text-muted-foreground">
                      Cumpărătorul plătește această taxă suplimentară.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ce vei învăța în acest ghid:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Cum te verifici pentru a primi plăți (MangoPay)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Cum creezi un anunț care vinde
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Cum faci fotografii atractive
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Cum expediezi și primești banii
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: MangoPay Verification */}
          {currentStep === 1 && (
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-green-500/20">
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Verificare Identitate - MangoPay</CardTitle>
                    <CardDescription>Obligatoriu pentru a primi plăți în contul tău bancar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700">De ce este necesar?</AlertTitle>
                  <AlertDescription>
                    MangoPay este procesatorul nostru de plăți. Fără verificare KYC (Know Your Customer), 
                    nu poți primi fonduri din vânzări.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h4 className="font-medium">📋 Ce ai nevoie pentru verificare:</h4>
                  
                  <div className="grid gap-3">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Act de Identitate</h5>
                        <p className="text-sm text-muted-foreground">
                          Pașaport, Carte de identitate sau Permis de conducere (față + spate)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Adresă din UK</h5>
                        <p className="text-sm text-muted-foreground">
                          Adresa ta completă cu cod poștal (trebuie să corespundă documentelor)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Cont Bancar UK sau IBAN</h5>
                        <p className="text-sm text-muted-foreground">
                          Pentru primirea banilor din vânzări (Sort Code + Account Number sau IBAN)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-3">🚀 Cum te verifici:</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Mergi în <strong>Setări → Verificare</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Completează datele personale și încarcă documentele</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>MangoPay verifică automat (durează până la 24h)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      <span>Odată verificat, poți primi plăți direct în contul bancar</span>
                    </li>
                  </ol>
                </div>

                <Button 
                  onClick={() => navigate('/settings?tab=verification')}
                  className="w-full gap-2"
                >
                  Începe Verificarea
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Create Listing */}
          {currentStep === 2 && (
            <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20">
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Creează Primul Anunț</CardTitle>
                    <CardDescription>Listează produsul tău în câteva minute</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                      Titlu Atractiv
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Folosește cuvinte cheie pe care cumpărătorii le caută
                    </p>
                    <div className="text-sm space-y-1">
                      <p className="text-green-600">✓ "iPhone 14 Pro Max 256GB Negru - Ca Nou"</p>
                      <p className="text-red-600">✗ "Telefon de vanzare"</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                      Descriere Completă
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Include: starea produsului, motivul vânzării, ce include în pachet, 
                      eventuale defecte sau zgârieturi.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                      Preț Corect
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Verifică prețuri similare pe piață. Un preț competitiv vinde mai repede!
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                      Cost Livrare
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Setezi manual costul livrării și alegi curierul. Costul e adăugat la prețul final.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/sell')}
                  className="w-full gap-2"
                >
                  Creează Anunț Nou
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Photos */}
          {currentStep === 3 && (
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-purple-500/20">
                    <Camera className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Fotografii Care Vând</CardTitle>
                    <CardDescription>Produsele cu poze bune se vând de 3x mai repede</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="font-medium text-green-700 mb-2">✓ Fă așa:</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Lumină naturală, ziua</li>
                      <li>• Fundal curat și simplu</li>
                      <li>• Fotografii din mai multe unghiuri</li>
                      <li>• Arată eventualele defecte</li>
                      <li>• Minim 3-5 fotografii</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-medium text-red-700 mb-2">✗ Evită:</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Fotografii blurate sau întunecate</li>
                      <li>• Fundaluri dezordonate</li>
                      <li>• Filtre exagerate</li>
                      <li>• Watermark-uri sau texte</li>
                      <li>• Fotografii de pe internet</li>
                    </ul>
                  </div>
                </div>

                <Alert>
                  <BadgeCheck className="h-4 w-4" />
                  <AlertTitle>Sfat Pro</AlertTitle>
                  <AlertDescription>
                    Prima fotografie apare în listare - alege cea mai bună! 
                    Poți încărca până la 8 fotografii per produs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Shipping & Payment */}
          {currentStep === 4 && (
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-orange-500/20">
                    <Truck className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Livrare și Primirea Banilor</CardTitle>
                    <CardDescription>Ultimul pas: expediezi produsul și primești banii</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">📦 Când primești o comandă:</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <div>
                        <p className="font-medium">Primești notificare</p>
                        <p className="text-sm text-muted-foreground">Email + notificare în aplicație cu detaliile comenzii</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <div>
                        <p className="font-medium">Împachetează și expediază</p>
                        <p className="text-sm text-muted-foreground">Folosește curierul selectat. Adaugă AWB-ul în platformă.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <div>
                        <p className="font-medium">Cumpărătorul confirmă primirea</p>
                        <p className="text-sm text-muted-foreground">Sau automat după livrarea confirmată de curier</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/50 bg-green-500/5">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      <div>
                        <p className="font-medium text-green-700">Primești banii!</p>
                        <p className="text-sm text-muted-foreground">
                          MangoPay transferă automat 90% din preț + costul livrării în contul tău
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Exemplu de calcul:
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Preț produs:</span>
                      <span className="font-medium">£100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost livrare:</span>
                      <span className="font-medium">£5</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Comision platformă (10%):</span>
                      <span>-£10</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Tu primești:</span>
                      <span>£95</span>
                    </div>
                  </div>
                </div>

                <Alert className="border-primary/30 bg-primary/5">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Felicitări!</AlertTitle>
                  <AlertDescription>
                    Ai terminat ghidul! Ești gata să începi să vinzi pe AdiMarket.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/settings?tab=verification')}
                    className="flex-1 gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Verifică-te
                  </Button>
                  <Button 
                    onClick={() => navigate('/sell')}
                    className="flex-1 gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Începe să vinzi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi
            </Button>
            {currentStep < tutorialSteps.length - 1 ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="gap-2"
              >
                Următorul
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/sell')}
                className="gap-2"
              >
                Creează Anunț
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerGuide;
