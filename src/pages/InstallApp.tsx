import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  HardDrive,
  Laptop,
  Monitor,
  Chrome,
  Globe
} from "lucide-react";

const InstallApp = () => {
  const { 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isMacOS,
    isWindows,
    isStandalone,
    promptInstall,
    getInstallInstructions,
    canPrompt
  } = usePWAInstall();

  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    if (isMacOS) return 'macos';
    if (isWindows) return 'windows';
    return 'ios';
  });

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
                Folosești deja Marketplace România ca aplicație. Bucură-te de experiența completă!
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
            Instalează Marketplace România
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Aplicația oficială pe orice dispozitiv - gratuit și instant!
          </p>
        </div>

        {/* Direct Install Button for supported browsers */}
        {canPrompt && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <Button 
                size="lg" 
                className="w-full py-8 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={handleInstall}
                disabled={installing}
              >
                <Download className="h-6 w-6 mr-3" />
                {installing ? "Se instalează..." : "Instalează Marketplace România Acum"}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Un singur click și aplicația va fi instalată pe dispozitivul tău!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Platform Tabs */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-6 w-6" />
              Alege Platforma Ta
            </CardTitle>
            <CardDescription className="text-base">
              Instrucțiuni de instalare pentru fiecare sistem de operare
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="ios" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  <span className="hidden sm:inline">iOS</span>
                </TabsTrigger>
                <TabsTrigger value="android" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Android</span>
                </TabsTrigger>
                <TabsTrigger value="macos" className="flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  <span className="hidden sm:inline">macOS</span>
                </TabsTrigger>
                <TabsTrigger value="windows" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Windows</span>
                </TabsTrigger>
              </TabsList>

              {/* iOS Instructions */}
              <TabsContent value="ios" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white">
                    <Apple className="h-10 w-10" />
                    <div>
                      <h3 className="font-bold text-lg">iPhone & iPad</h3>
                      <p className="text-sm text-gray-300">Instalare din Safari</p>
                    </div>
                    {isIOS && (
                      <Badge className="ml-auto bg-green-500">Detectat</Badge>
                    )}
                  </div>
                  
                  <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Deschide în Safari</p>
                        <p className="text-sm text-muted-foreground">
                          Asigură-te că accesezi site-ul din browser-ul Safari (nu Chrome sau alt browser)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">2</span>
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
                        <span className="text-lg font-bold text-primary">3</span>
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
                        <span className="text-lg font-bold text-primary">4</span>
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
                      <strong>Notă:</strong> Pentru instalare pe iPhone/iPad este necesar Safari. Alte browsere nu suportă instalarea PWA pe iOS.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Android Instructions */}
              <TabsContent value="android" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl text-white">
                    <Smartphone className="h-10 w-10" />
                    <div>
                      <h3 className="font-bold text-lg">Android</h3>
                      <p className="text-sm text-green-100">Instalare din Chrome sau alt browser</p>
                    </div>
                    {isAndroid && (
                      <Badge className="ml-auto bg-white text-green-700">Detectat</Badge>
                    )}
                  </div>
                  
                  <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Deschide meniul browserului</p>
                        <p className="text-sm text-muted-foreground">
                          Apasă pe <Menu className="h-4 w-4 inline mx-1" /> (cele 3 puncte) din colțul dreapta sus
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Selectează "Install app" sau "Add to Home screen"</p>
                        <p className="text-sm text-muted-foreground">
                          Opțiunea poate varia în funcție de browser (Chrome, Samsung Internet, etc.)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Confirmă instalarea</p>
                        <p className="text-sm text-muted-foreground">
                          Apasă "Install" și aplicația va apărea pe ecranul tău principal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Tip:</strong> Dacă vezi un banner "Add to Home Screen" în partea de jos a ecranului, poți apăsa direct pe el pentru instalare rapidă!
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* macOS Instructions */}
              <TabsContent value="macos" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl text-white">
                    <Laptop className="h-10 w-10" />
                    <div>
                      <h3 className="font-bold text-lg">macOS</h3>
                      <p className="text-sm text-gray-300">Instalare din Chrome sau Safari</p>
                    </div>
                    {isMacOS && (
                      <Badge className="ml-auto bg-blue-500">Detectat</Badge>
                    )}
                  </div>

                  {/* Chrome on macOS */}
                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Chrome className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Google Chrome (Recomandat)</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Caută iconița <Download className="h-4 w-4 inline mx-1" /> în bara de adrese (dreapta)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Click pe ea și selectează "Install"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Aplicația va apărea în Applications și în Dock</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safari on macOS */}
                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold">Safari (macOS Sonoma+)</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-500">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Mergi la meniul <strong>File</strong> din bara de sus</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-500">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Selectează <strong>"Add to Dock"</strong></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-500">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Confirmă și aplicația va fi adăugată în Dock</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Notă:</strong> Safari suportă PWA doar pe macOS Sonoma (14+) sau mai nou. Pentru versiuni mai vechi, folosește Chrome.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Windows Instructions */}
              <TabsContent value="windows" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white">
                    <Monitor className="h-10 w-10" />
                    <div>
                      <h3 className="font-bold text-lg">Windows</h3>
                      <p className="text-sm text-blue-100">Instalare din Chrome sau Edge</p>
                    </div>
                    {isWindows && (
                      <Badge className="ml-auto bg-white text-blue-700">Detectat</Badge>
                    )}
                  </div>

                  {/* Chrome on Windows */}
                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Chrome className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Google Chrome</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Caută iconița <Download className="h-4 w-4 inline mx-1" /> în bara de adrese (dreapta)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Click pe "Install" și confirmă</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Aplicația va fi adăugată în Start Menu și pe Desktop</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edge on Windows */}
                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-cyan-500" />
                      <h4 className="font-semibold">Microsoft Edge</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-cyan-600">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Apasă pe cele 3 puncte <Menu className="h-4 w-4 inline mx-1" /> din dreapta sus</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-cyan-600">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Selectează <strong>"Apps" → "Install this site as an app"</strong></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-cyan-600">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">Confirmă și aplicația va fi instalată</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200">
                      <strong>Tip:</strong> Pe Windows, aplicația se va comporta exact ca un program nativ cu fereastră proprie!
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
              <p className="text-sm text-muted-foreground">Da, la fel ca orice aplicație - pe mobil ține apăsat pe iconiță și selectează dezinstalare, pe desktop din Settings sau Control Panel.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Funcționează pe Mac și Windows?</h4>
              <p className="text-sm text-muted-foreground">Da! Aplicația poate fi instalată pe macOS (din Chrome sau Safari 17+) și pe Windows (din Chrome sau Edge).</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InstallApp;