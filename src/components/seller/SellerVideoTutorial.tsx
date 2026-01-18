import React, { useState, useEffect } from 'react';
import { X, Play, ChevronRight, ChevronLeft, CheckCircle2, Camera, CreditCard, Package, Truck, BookOpen, ExternalLink, Shield, ArrowRightLeft, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface SellerVideoTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  title: { en: string; ro: string };
  description: { en: string; ro: string };
  details: { en: string[]; ro: string[] };
  tips: { en: string[]; ro: string[] };
  timeEstimate: string; // Time to complete this step
}

// Tutorial optimizat pentru 3-4 minute total (5 pași x ~45 secunde fiecare)
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'stripe',
    icon: <CreditCard className="h-6 w-6" />,
    title: {
      en: 'Step 1: Connect Your Stripe Account',
      ro: 'Pasul 1: Conectează Contul Stripe'
    },
    description: {
      en: 'Required to receive payments automatically',
      ro: 'Necesar pentru a primi plăți automat'
    },
    details: {
      en: [
        '1. Go to Settings → Payouts',
        '2. Click "Connect Stripe Account"',
        '3. Enter your details: name, address, bank account',
        '4. Upload ID for verification (passport/driving license)'
      ],
      ro: [
        '1. Mergi la Setări → Încasări',
        '2. Apasă "Conectează Cont Stripe"',
        '3. Completează: nume, adresă, cont bancar',
        '4. Încarcă act de identitate pentru verificare'
      ]
    },
    tips: {
      en: [
        '✓ Have ID & bank details ready (5-10 min setup)',
        '✓ Your account links directly to the marketplace',
        '✓ Payments transfer automatically after delivery'
      ],
      ro: [
        '✓ Pregătește actul de identitate și IBAN (5-10 min)',
        '✓ Contul tău se conectează direct la marketplace',
        '✓ Banii se transferă automat după livrare'
      ]
    },
    timeEstimate: '45s'
  },
  {
    id: 'photos',
    icon: <Camera className="h-6 w-6" />,
    title: {
      en: 'Step 2: Take Quality Photos',
      ro: 'Pasul 2: Fotografii de Calitate'
    },
    description: {
      en: 'Good photos = faster sales',
      ro: 'Fotografii bune = vânzări rapide'
    },
    details: {
      en: [
        '1. Use natural light (near a window)',
        '2. Clean, neutral background (white/light)',
        '3. Multiple angles: front, back, sides',
        '4. Show any defects clearly'
      ],
      ro: [
        '1. Lumină naturală (lângă fereastră)',
        '2. Fundal curat, neutru (alb/deschis)',
        '3. Mai multe unghiuri: față, spate, lateral',
        '4. Arată clar orice defecte'
      ]
    },
    tips: {
      en: [
        '📸 Add 3-5 photos per product',
        '📸 First photo is what buyers see first',
        '📸 Include labels/details close-up'
      ],
      ro: [
        '📸 Adaugă 3-5 fotografii per produs',
        '📸 Prima fotografie e ce văd cumpărătorii',
        '📸 Include etichete/detalii de aproape'
      ]
    },
    timeEstimate: '45s'
  },
  {
    id: 'listing',
    icon: <Package className="h-6 w-6" />,
    title: {
      en: 'Step 3: Create Your Listing',
      ro: 'Pasul 3: Creează Anunțul'
    },
    description: {
      en: 'Clear title + honest description',
      ro: 'Titlu clar + descriere sinceră'
    },
    details: {
      en: [
        '1. Title: Brand + Model + Size + Color',
        '2. Description: Features, specs, condition',
        '3. Category: Choose the best match',
        '4. Condition: Be honest (buyers appreciate it)'
      ],
      ro: [
        '1. Titlu: Marcă + Model + Mărime + Culoare',
        '2. Descriere: Caracteristici, specificații, stare',
        '3. Categorie: Alege cea mai potrivită',
        '4. Stare: Fii sincer (cumpărătorii apreciază)'
      ]
    },
    tips: {
      en: [
        '💡 Include keywords buyers search for',
        '💡 Mention if price is negotiable',
        '💡 Add your city for local pickup'
      ],
      ro: [
        '💡 Include cuvinte cheie căutate',
        '💡 Menționează dacă prețul e negociabil',
        '💡 Adaugă orașul pentru ridicare locală'
      ]
    },
    timeEstimate: '45s'
  },
  {
    id: 'pricing',
    icon: <CreditCard className="h-6 w-6" />,
    title: {
      en: 'Step 4: Price Your Item',
      ro: 'Pasul 4: Setează Prețul'
    },
    description: {
      en: 'Research + competitive pricing',
      ro: 'Cercetează + preț competitiv'
    },
    details: {
      en: [
        '1. Check similar items on the marketplace',
        '2. Price based on condition (reduce for wear)',
        '3. Add 10-15% margin for negotiation',
        '4. Platform fee: £1 per sale (you receive rest)'
      ],
      ro: [
        '1. Verifică produse similare pe platformă',
        '2. Preț bazat pe stare (reduce pentru uzură)',
        '3. Adaugă 10-15% marjă de negociere',
        '4. Comision platformă: £1 per vânzare (restul e al tău)'
      ]
    },
    tips: {
      en: [
        '💰 You can always lower price later',
        '💰 Use £99 instead of £100 (psychology)',
        '💰 Consider auction for unique items'
      ],
      ro: [
        '💰 Poți reduce prețul oricând',
        '💰 Folosește £99 în loc de £100 (psihologie)',
        '💰 Consideră licitație pentru articole unice'
      ]
    },
    timeEstimate: '45s'
  },
  {
    id: 'shipping',
    icon: <Truck className="h-6 w-6" />,
    title: {
      en: 'Step 5: Ship & Get Paid',
      ro: 'Pasul 5: Expediază & Primești Banii'
    },
    description: {
      en: 'Pack securely → Ship → Get paid automatically',
      ro: 'Împachetează → Expediază → Primești banii automat'
    },
    details: {
      en: [
        '1. Pack securely (bubble wrap, sturdy box)',
        '2. Ship within 2-3 days of payment',
        '3. Add tracking number in Orders section',
        '4. Payment releases after buyer confirms delivery'
      ],
      ro: [
        '1. Împachetează sigur (folie bule, cutie rezistentă)',
        '2. Expediază în 2-3 zile de la plată',
        '3. Adaugă tracking în secțiunea Comenzi',
        '4. Banii se eliberează când cumpărătorul confirmă'
      ]
    },
    tips: {
      en: [
        '📦 Keep proof of postage until confirmed',
        '📦 Money transfers directly to your bank',
        '📦 Platform handles all payment security'
      ],
      ro: [
        '📦 Păstrează dovada expedierii până la confirmare',
        '📦 Banii se transferă direct în contul tău',
        '📦 Platforma gestionează securitatea plăților'
      ]
    },
    timeEstimate: '45s'
  }
];

export const SellerVideoTutorial: React.FC<SellerVideoTutorialProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const lang = language as 'en' | 'ro';
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial complete
      localStorage.setItem('sellerTutorialCompleted', 'true');
      onComplete?.();
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sellerTutorialSkipped', 'true');
    onOpenChange(false);
  };

  const texts = {
    en: {
      title: 'Quick Seller Tutorial',
      subtitle: '3-4 minutes to learn everything you need',
      stepOf: 'Step {current} of {total}',
      next: 'Next',
      previous: 'Previous',
      finish: 'Start Selling!',
      skip: 'Skip',
      howTo: 'How to do it:',
      tips: 'Quick Tips:',
      fullGuide: 'Full Seller Guide',
      paymentFlow: 'How Payments Work',
      paymentFlowDesc: 'Your Stripe account connects directly to the marketplace. When a buyer pays, funds are held securely. After you ship and the buyer confirms delivery, payment transfers automatically to your bank account (minus £1 platform fee).',
      timeRemaining: '~{time} remaining'
    },
    ro: {
      title: 'Tutorial Rapid Vânzător',
      subtitle: '3-4 minute să înveți tot ce ai nevoie',
      stepOf: 'Pasul {current} din {total}',
      next: 'Următorul',
      previous: 'Anterior',
      finish: 'Începe să Vinzi!',
      skip: 'Sari',
      howTo: 'Cum să faci:',
      tips: 'Sfaturi Rapide:',
      fullGuide: 'Ghid Complet Vânzător',
      paymentFlow: 'Cum Funcționează Plățile',
      paymentFlowDesc: 'Contul tău Stripe se conectează direct la marketplace. Când un cumpărător plătește, fondurile sunt păstrate în siguranță. După ce expediezi și cumpărătorul confirmă livrarea, plata se transferă automat în contul tău bancar (minus £1 comision platformă).',
      timeRemaining: '~{time} rămas'
    }
  };

  const t = texts[lang];

  // Calculate remaining time
  const remainingSteps = TUTORIAL_STEPS.length - currentStep;
  const remainingSeconds = remainingSteps * 45;
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{t.title}</DialogTitle>
                <p className="text-primary-foreground/80 text-xs">{t.subtitle}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Clock className="h-3 w-3 mr-1" />
              ~{remainingMinutes} min
            </Badge>
          </div>
          
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{t.stepOf.replace('{current}', String(currentStep + 1)).replace('{total}', String(TUTORIAL_STEPS.length))}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/20" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {TUTORIAL_STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  index === currentStep 
                    ? 'bg-white text-primary scale-110' 
                    : completedSteps.has(index)
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[350px] p-5">
          <div className="space-y-4">
            {/* Step title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold">{step.title[lang]}</h3>
                <p className="text-muted-foreground text-sm">{step.description[lang]}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t.howTo}</h4>
              <ul className="space-y-1.5">
                {step.details[lang].map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <h4 className="font-semibold text-sm">{t.tips}</h4>
              <ul className="space-y-0.5">
                {step.tips[lang].map((tip, index) => (
                  <li key={index} className="text-xs text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Flow Explanation (shown on Stripe step) */}
            {step.id === 'stripe' && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <ArrowRightLeft className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-xs">
                  <strong className="text-green-700">{t.paymentFlow}:</strong>
                  <br />
                  {t.paymentFlowDesc}
                </AlertDescription>
              </Alert>
            )}

            {/* Payment confirmation (shown on shipping step) */}
            {step.id === 'shipping' && (
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                  <strong className="text-blue-700">
                    {lang === 'ro' ? 'Siguranța Plăților:' : 'Payment Security:'}
                  </strong>
                  <br />
                  {lang === 'ro' 
                    ? 'Banii sunt păstrați în escrow de platformă. După confirmarea livrării, se transferă automat în contul tău Stripe conectat, apoi în banca ta.' 
                    : 'Funds are held in escrow by the platform. After delivery confirmation, they transfer automatically to your connected Stripe account, then to your bank.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Full guide link */}
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <Link to="/seller-guide" onClick={() => onOpenChange(false)}>
                <ExternalLink className="h-3 w-3" />
                {t.fullGuide}
              </Link>
            </Button>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3 flex items-center justify-between bg-muted/30">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground text-xs">
            {t.skip}
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious} className="gap-1">
                <ChevronLeft className="h-3 w-3" />
                {t.previous}
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1">
              {currentStep === TUTORIAL_STEPS.length - 1 ? t.finish : t.next}
              {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to check if user should see tutorial
export const useSellerTutorial = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('sellerTutorialCompleted');
    const skipped = localStorage.getItem('sellerTutorialSkipped');
    
    // Show tutorial if not completed and not skipped
    if (!completed && !skipped) {
      setShouldShow(true);
    }
  }, []);

  const resetTutorial = () => {
    localStorage.removeItem('sellerTutorialCompleted');
    localStorage.removeItem('sellerTutorialSkipped');
    setShouldShow(true);
  };

  const markComplete = () => {
    localStorage.setItem('sellerTutorialCompleted', 'true');
    setShouldShow(false);
  };

  return { shouldShow, setShouldShow, resetTutorial, markComplete };
};
