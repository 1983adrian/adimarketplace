import React, { useState, useEffect } from 'react';
import { X, Play, ChevronRight, ChevronLeft, CheckCircle2, Camera, CreditCard, Package, Truck, BookOpen, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'stripe',
    icon: <CreditCard className="h-6 w-6" />,
    title: {
      en: 'Step 1: Connect Stripe Account',
      ro: 'Pasul 1: Conectează Contul Stripe'
    },
    description: {
      en: 'Set up your payment account to receive money from sales',
      ro: 'Configurează contul de plăți pentru a primi banii din vânzări'
    },
    details: {
      en: [
        'Go to Settings → Payouts section',
        'Click "Connect Stripe Account"',
        'Create a new Stripe account or log in to existing one',
        'Fill in all required information: personal details, address, bank account',
        'Verify your identity with a valid ID document',
        'Once verified, you can receive payments directly to your bank'
      ],
      ro: [
        'Mergi la Setări → Secțiunea Încasări',
        'Apasă "Conectează Cont Stripe"',
        'Creează un cont Stripe nou sau autentifică-te în cel existent',
        'Completează toate informațiile necesare: date personale, adresă, cont bancar',
        'Verifică-ți identitatea cu un document de identitate valid',
        'După verificare, poți primi plăți direct în contul tău bancar'
      ]
    },
    tips: {
      en: [
        '✓ Have your ID ready (passport or driving license)',
        '✓ Prepare bank account details (IBAN/Sort Code)',
        '✓ Use your real address for verification',
        '✓ Setup takes about 5-10 minutes'
      ],
      ro: [
        '✓ Pregătește actul de identitate (pașaport sau permis)',
        '✓ Pregătește detaliile contului bancar (IBAN)',
        '✓ Folosește adresa ta reală pentru verificare',
        '✓ Configurarea durează aproximativ 5-10 minute'
      ]
    }
  },
  {
    id: 'photos',
    icon: <Camera className="h-6 w-6" />,
    title: {
      en: 'Step 2: Take Great Photos',
      ro: 'Pasul 2: Fotografii de Calitate'
    },
    description: {
      en: 'Good photos sell products faster',
      ro: 'Fotografiile bune vând produsele mai repede'
    },
    details: {
      en: [
        'Use natural light - photograph near a window',
        'Use a clean, simple background (white or neutral)',
        'Take photos from multiple angles (front, back, sides)',
        'Show any defects or wear clearly',
        'Include close-ups of details, labels, or serial numbers',
        'Avoid blurry images - hold your phone steady'
      ],
      ro: [
        'Folosește lumină naturală - fotografiază lângă o fereastră',
        'Folosește un fundal curat și simplu (alb sau neutru)',
        'Fă poze din mai multe unghiuri (față, spate, laterale)',
        'Arată clar orice defecte sau uzură',
        'Include detalii de aproape: etichete, numere de serie',
        'Evită imaginile neclare - ține telefonul stabil'
      ]
    },
    tips: {
      en: [
        '📸 First photo is the main one buyers see',
        '📸 Add at least 3-5 photos per product',
        '📸 Show the product in use if possible',
        '📸 Take photos in landscape for better viewing'
      ],
      ro: [
        '📸 Prima fotografie este cea pe care o văd cumpărătorii',
        '📸 Adaugă cel puțin 3-5 fotografii per produs',
        '📸 Arată produsul în utilizare dacă e posibil',
        '📸 Fă fotografii în format landscape pentru vizualizare mai bună'
      ]
    }
  },
  {
    id: 'listing',
    icon: <Package className="h-6 w-6" />,
    title: {
      en: 'Step 3: Create Your Listing',
      ro: 'Pasul 3: Creează Anunțul'
    },
    description: {
      en: 'Write a clear title and description',
      ro: 'Scrie un titlu și o descriere clare'
    },
    details: {
      en: [
        'Title: Include brand, model, size, color (e.g., "iPhone 14 Pro 256GB Space Black")',
        'Description: List all features, specifications, and condition details',
        'Category: Choose the most accurate category for your product',
        'Condition: Be honest about the item\'s condition',
        'Price: Research similar items to set a competitive price',
        'Location: Add your city for local pickup options'
      ],
      ro: [
        'Titlu: Include marca, modelul, mărimea, culoarea (ex: "iPhone 14 Pro 256GB Space Black")',
        'Descriere: Listează toate caracteristicile, specificațiile și detalii despre stare',
        'Categorie: Alege cea mai potrivită categorie pentru produs',
        'Stare: Fii sincer despre starea produsului',
        'Preț: Cercetează produse similare pentru un preț competitiv',
        'Locație: Adaugă orașul tău pentru opțiuni de ridicare locală'
      ]
    },
    tips: {
      en: [
        '💡 Include keywords buyers search for',
        '💡 Mention original packaging if available',
        '💡 State if price is negotiable',
        '💡 Add relevant measurements or specifications'
      ],
      ro: [
        '💡 Include cuvinte cheie pe care le caută cumpărătorii',
        '💡 Menționează ambalajul original dacă îl ai',
        '💡 Specifică dacă prețul este negociabil',
        '💡 Adaugă măsurători sau specificații relevante'
      ]
    }
  },
  {
    id: 'pricing',
    icon: <CreditCard className="h-6 w-6" />,
    title: {
      en: 'Step 4: Set the Right Price',
      ro: 'Pasul 4: Setează Prețul Corect'
    },
    description: {
      en: 'Price competitively to sell faster',
      ro: 'Prețuri competitive pentru vânzări rapide'
    },
    details: {
      en: [
        'Research: Check prices of similar items on the marketplace',
        'Condition matters: Reduce price for used items proportionally',
        'Leave room for negotiation: Add 10-15% margin if open to offers',
        'Use psychological pricing: £99 instead of £100',
        'Consider fees: Platform takes 15% commission from each sale',
        'Factor in shipping costs if offering free delivery'
      ],
      ro: [
        'Cercetează: Verifică prețurile produselor similare pe platformă',
        'Starea contează: Reduce prețul proporțional pentru produse folosite',
        'Lasă loc de negociere: Adaugă 10-15% dacă accepți oferte',
        'Folosește prețuri psihologice: £99 în loc de £100',
        'Consideră comisioanele: Platforma ia 15% din fiecare vânzare',
        'Include costul transportului dacă oferi livrare gratuită'
      ]
    },
    tips: {
      en: [
        '💰 Start higher, you can always lower the price',
        '💰 Update price if item doesn\'t sell in 2 weeks',
        '💰 Consider auction format for unique items',
        '💰 Offer bundle discounts for multiple items'
      ],
      ro: [
        '💰 Începe mai sus, poți oricând să reduci prețul',
        '💰 Actualizează prețul dacă nu se vinde în 2 săptămâni',
        '💰 Consideră licitația pentru articole unice',
        '💰 Oferă reduceri pentru pachete de mai multe produse'
      ]
    }
  },
  {
    id: 'shipping',
    icon: <Truck className="h-6 w-6" />,
    title: {
      en: 'Step 5: Ship Your Items',
      ro: 'Pasul 5: Expediază Produsele'
    },
    description: {
      en: 'Pack securely and ship promptly',
      ro: 'Împachetează sigur și expediază prompt'
    },
    details: {
      en: [
        'Pack securely with bubble wrap or packing paper',
        'Use a sturdy box that fits the item (not too big)',
        'Include receipt or thank you note for personal touch',
        'Ship within 2-3 days after payment confirmation',
        'Add tracking number in Orders section',
        'Keep proof of postage until delivery is confirmed'
      ],
      ro: [
        'Împachetează sigur cu folie cu bule sau hârtie de ambalat',
        'Folosește o cutie rezistentă pe măsura produsului',
        'Include chitanță sau un bilet de mulțumire',
        'Expediază în 2-3 zile de la confirmarea plății',
        'Adaugă numărul de tracking în secțiunea Comenzi',
        'Păstrează dovada expedierii până la confirmarea livrării'
      ]
    },
    tips: {
      en: [
        '📦 Take photos of packaged item before shipping',
        '📦 Use tracked shipping for valuable items',
        '📦 Communicate with buyer about shipping timeline',
        '📦 Payment is released after delivery confirmation'
      ],
      ro: [
        '📦 Fă poze produsului împachetat înainte de expediere',
        '📦 Folosește livrare cu tracking pentru obiecte valoroase',
        '📦 Comunică cu cumpărătorul despre termenul de livrare',
        '📦 Plata este eliberată după confirmarea livrării'
      ]
    }
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
  const [showFullGuide, setShowFullGuide] = useState(false);

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
      title: 'Seller Tutorial',
      subtitle: 'Learn how to sell successfully on our marketplace',
      stepOf: 'Step {current} of {total}',
      next: 'Next',
      previous: 'Previous',
      finish: 'Start Selling',
      skip: 'Skip Tutorial',
      howTo: 'How to do it:',
      tips: 'Pro Tips:',
      fullGuide: 'View Full Guide',
      backToTutorial: 'Back to Tutorial'
    },
    ro: {
      title: 'Tutorial Vânzător',
      subtitle: 'Învață cum să vinzi cu succes pe platforma noastră',
      stepOf: 'Pasul {current} din {total}',
      next: 'Următorul',
      previous: 'Anterior',
      finish: 'Începe să Vinzi',
      skip: 'Sari Tutorial',
      howTo: 'Cum să faci:',
      tips: 'Sfaturi Pro:',
      fullGuide: 'Vezi Ghidul Complet',
      backToTutorial: 'Înapoi la Tutorial'
    }
  };

  const t = texts[lang];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.title}</DialogTitle>
                <p className="text-primary-foreground/80 text-sm">{t.subtitle}</p>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t.stepOf.replace('{current}', String(currentStep + 1)).replace('{total}', String(TUTORIAL_STEPS.length))}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {TUTORIAL_STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  index === currentStep 
                    ? 'bg-white text-primary scale-110' 
                    : completedSteps.has(index)
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  s.icon
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px] p-6">
          <div className="space-y-6">
            {/* Step title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{step.title[lang]}</h3>
                <p className="text-muted-foreground">{step.description[lang]}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">{t.howTo}</h4>
              <ul className="space-y-2">
                {step.details[lang].map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold">{t.tips}</h4>
              <ul className="space-y-1">
                {step.tips[lang].map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full guide link */}
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to="/seller-guide" onClick={() => onOpenChange(false)}>
                <ExternalLink className="h-4 w-4" />
                {t.fullGuide}
              </Link>
            </Button>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/30">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            {t.skip}
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                {t.previous}
              </Button>
            )}
            <Button onClick={handleNext} className="gap-1">
              {currentStep === TUTORIAL_STEPS.length - 1 ? t.finish : t.next}
              {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
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
