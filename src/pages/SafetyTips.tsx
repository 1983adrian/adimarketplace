import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  CreditCard, 
  MapPin,
  MessageCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const safetyTips = [
  {
    title: 'Verifică Vânzătorul',
    icon: Eye,
    tips: [
      'Citește review-urile și rating-ul vânzătorului',
      'Verifică de cât timp este activ pe platformă',
      'Analizează istoricul de vânzări',
      'Fii atent la prețuri care par prea bune pentru a fi adevărate',
    ],
  },
  {
    title: 'Protejează-ți Datele',
    icon: Lock,
    tips: [
      'Nu partaja parola contului tău',
      'Folosește o parolă puternică și unică',
      'Activează autentificarea în doi pași când este disponibilă',
      'Nu trimite date sensibile prin mesaje',
    ],
  },
  {
    title: 'Plăți Sigure',
    icon: CreditCard,
    tips: [
      'Folosește metodele de plată integrate în platformă',
      'Evită plățile în avans prin transfer bancar direct',
      'Păstrează dovezile de plată',
      'Verifică dacă suma este corectă înainte de confirmare',
    ],
  },
  {
    title: 'Întâlniri în Persoană',
    icon: MapPin,
    tips: [
      'Întâlnește-te în locuri publice și aglomerate',
      'Du-te însoțit de o persoană de încredere',
      'Evită întâlnirile noaptea sau în locuri izolate',
      'Informează pe cineva despre locația întâlnirii',
    ],
  },
  {
    title: 'Comunicare Responsabilă',
    icon: MessageCircle,
    tips: [
      'Comunică prin sistemul de mesagerie al platformei',
      'Nu partaja informații personale sensibile',
      'Fii respectuos și profesionist',
      'Raportează comportamentele suspecte',
    ],
  },
];

const redFlags = [
  'Vânzător care insistă pentru plată în afara platformei',
  'Prețuri mult sub valoarea de piață',
  'Presiune pentru a lua decizii rapide',
  'Refuzul de a furniza detalii despre produs',
  'Cereri de informații personale excesive',
  'Fotografii care par luate de pe internet',
];

const goodSigns = [
  'Profil complet cu review-uri pozitive',
  'Răspunsuri prompte și profesionale',
  'Fotografii originale și detaliate ale produsului',
  'Acceptă metodele de plată ale platformei',
  'Oferă informații complete despre produs',
  'Este dispus să răspundă la întrebări',
];

export default function SafetyTips() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Sfaturi de Siguranță</h1>
            <p className="text-xl text-muted-foreground">
              Tranzacționează în siguranță pe platforma noastră
            </p>
          </div>

          {/* Alert */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Fii vigilent!</AlertTitle>
            <AlertDescription>
              Dacă ceva pare prea bun pentru a fi adevărat, probabil că așa și este. 
              Raportează orice activitate suspectă echipei noastre.
            </AlertDescription>
          </Alert>

          {/* Safety Tips */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {safetyTips.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Red Flags vs Good Signs */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Semnale de Alarmă
                </CardTitle>
                <CardDescription>Fii atent la aceste semne</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Semne Bune
                </CardTitle>
                <CardDescription>Indicatori de încredere</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {goodSigns.map((sign, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Report Section */}
          <Card className="mt-8">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-semibold mb-2">Ai întâlnit o problemă?</h3>
              <p className="text-muted-foreground mb-4">
                Dacă ai întâlnit un comportament suspect sau ai fost victima unei înșelăciuni,
                te rugăm să ne contactezi imediat.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Raportează o problemă →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
