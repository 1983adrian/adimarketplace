import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { 
  Smartphone, 
  Apple, 
  Download, 
  Check, 
  Share, 
  Menu,
  Plus,
  Star,
  Shield,
  Zap,
  Bell,
  Wifi,
  HardDrive
} from "lucide-react";

const InstallApp = () => {
  const { 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isStandalone,
    promptInstall,
    getInstallInstructions,
    canPrompt
  } = usePWAInstall();

  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
  };

  const instructions = getInstallInstructions();

  const features = [
    { icon: Zap, title: "Rapid", description: "Se încarcă instant" },
    { icon: Bell, title: "Notificări", description: "Alerte în timp real" },
    { icon: Shield, title: "Securizat", description: "Date protejate" },
    { icon: Wifi, title: "Offline", description: "Funcționează fără net" },
    { icon: Star, title: "Nativ", description: "Ca o aplicație reală" },
    { icon: HardDrive, title: "Ușor", description: "Sub 5MB" }
  ];

  if (isStandalone || isInstalled) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Aplicația este instalată! 🎉
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Folosești deja C Market ca aplicație. Bucură-te de experiența completă!
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl">
              <Smartphone className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Instalează C Market
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Aplicația oficială direct pe telefonul tău - gratuit și instant!
          </p>
        </div>

        {/* Platform Detection */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge 
            variant={isIOS ? "default" : "outline"} 
            className={`px-4 py-2 text-sm ${isIOS ? 'bg-primary' : ''}`}
          >
            <Apple className="h-4 w-4 mr-2" />
            iPhone/iPad
            {isIOS && <Check className="h-3 w-3 ml-2" />}
          </Badge>
          <Badge 
            variant={isAndroid ? "default" : "outline"} 
            className={`px-4 py-2 text-sm ${isAndroid ? 'bg-primary' : ''}`}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Android
            {isAndroid && <Check className="h-3 w-3 ml-2" />}
          </Badge>
        </div>

        {/* Main Install Card */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-6 w-6" />
              {isIOS ? "Instalează pe iPhone/iPad" : 
               isAndroid ? "Instalează pe Android" : 
               "Instalează Aplicația"}
            </CardTitle>
            <CardDescription className="text-base">
              {canPrompt 
                ? "Un singur click și aplicația va fi instalată pe dispozitivul tău!"
                : "Urmează pașii simpli de mai jos pentru a instala aplicația"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Direct Install Button */}
            {canPrompt && (
              <Button 
                size="lg" 
                className="w-full py-8 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={handleInstall}
                disabled={installing}
              >
                <Download className="h-6 w-6 mr-3" />
                {installing ? "Se instalează..." : "Instalează C Market Acum"}
              </Button>
            )}

            {/* iOS Manual Instructions */}
            {isIOS && (
              <div className="space-y-4">
                {canPrompt && (
                  <p className="text-center text-sm text-muted-foreground font-medium">
                    sau urmează pașii manuali:
                  </p>
                )}
                
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Apasă pe butonul Share</p>
                      <p className="text-sm text-muted-foreground">
                        Găsește iconița <Share className="h-4 w-4 inline mx-1" /> în bara de jos a Safari
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Selectează "Add to Home Screen"</p>
                      <p className="text-sm text-muted-foreground">
                        Derulează și apasă pe <Plus className="h-4 w-4 inline mx-1" /> Add to Home Screen
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Confirmă cu "Add"</p>
                      <p className="text-sm text-muted-foreground">
                        Apasă butonul "Add" din colțul dreapta sus și gata!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Notă:</strong> Asigură-te că folosești Safari pentru a putea instala aplicația pe iPhone/iPad.
                  </p>
                </div>
              </div>
            )}

            {/* Android Manual Instructions */}
            {isAndroid && !canPrompt && (
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Deschide meniul browserului</p>
                    <p className="text-sm text-muted-foreground">
                      Apasă pe <Menu className="h-4 w-4 inline mx-1" /> (cele 3 puncte) din colțul dreapta sus
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Selectează "Install app"</p>
                    <p className="text-sm text-muted-foreground">
                      Sau "Add to Home screen" - depinde de browser
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Confirmă instalarea</p>
                    <p className="text-sm text-muted-foreground">
                      Apasă "Install" și aplicația va apărea pe ecranul tău
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !canPrompt && (
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Caută iconița de instalare</p>
                    <p className="text-sm text-muted-foreground">
                      În bara de adrese, caută iconița <Download className="h-4 w-4 inline mx-1" /> sau un computer cu săgeată
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Confirmă instalarea</p>
                    <p className="text-sm text-muted-foreground">
                      Click pe ea și confirmă pentru a instala aplicația
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">De ce să instalezi aplicația?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Întrebări Frecvente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Este gratuit?</h4>
              <p className="text-sm text-muted-foreground">Da, 100% gratuit! Nu trebuie să plătești nimic.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">De ce nu e în App Store / Google Play?</h4>
              <p className="text-sm text-muted-foreground">
                C Market folosește tehnologia PWA (Progressive Web App) care permite instalarea directă din browser, fără a fi nevoie de magazine. 
                Este la fel de sigur și funcțional ca o aplicație din magazin!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Ocupă mult spațiu?</h4>
              <p className="text-sm text-muted-foreground">Nu! Aplicația ocupă sub 5MB, mult mai puțin decât aplicațiile tradiționale.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Pot să o dezinstalez?</h4>
              <p className="text-sm text-muted-foreground">Da, la fel ca orice aplicație - ține apăsat pe iconiță și selectează dezinstalare.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InstallApp;
