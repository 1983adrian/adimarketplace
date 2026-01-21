import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { 
  Smartphone, 
  Apple, 
  Play, 
  Download, 
  Check, 
  Share, 
  Menu,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Bell
} from "lucide-react";

const InstallApp = () => {
  const { 
    isInstallable, 
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
    { icon: Zap, title: "Rapid", description: "Se încarcă instant, chiar și offline" },
    { icon: Bell, title: "Notificări", description: "Primești alerte pentru comenzi și mesaje" },
    { icon: Shield, title: "Securizat", description: "Datele tale sunt în siguranță" },
    { icon: Star, title: "Experiență nativă", description: "Arată și funcționează ca o aplicație reală" }
  ];

  if (isStandalone || isInstalled) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Aplicația este instalată! 🎉
              </h2>
              <p className="text-green-700">
                Folosești deja C Market ca aplicație nativă. Bucură-te de experiența completă!
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
        <div className="text-center mb-12">
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Instalează C Market
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Obține experiența completă cu aplicația noastră mobilă pentru iOS și Android
          </p>
        </div>

        {/* Platform Badges */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge variant="outline" className={`px-4 py-2 ${isIOS ? 'border-primary bg-primary/10' : ''}`}>
            <Apple className="h-4 w-4 mr-2" />
            iOS
            {isIOS && <Check className="h-3 w-3 ml-2 text-primary" />}
          </Badge>
          <Badge variant="outline" className={`px-4 py-2 ${isAndroid ? 'border-primary bg-primary/10' : ''}`}>
            <Play className="h-4 w-4 mr-2" />
            Android
            {isAndroid && <Check className="h-3 w-3 ml-2 text-primary" />}
          </Badge>
        </div>

        {/* Install Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Instalează pe {instructions.platform}
            </CardTitle>
            <CardDescription>
              {isIOS 
                ? "Adaugă C Market pe ecranul principal pentru acces rapid"
                : "Instalează aplicația direct din browser"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Install Button (for supported browsers) */}
            {canPrompt && (
              <Button 
                size="lg" 
                className="w-full py-6 text-lg"
                onClick={handleInstall}
                disabled={installing}
              >
                <Download className="h-5 w-5 mr-2" />
                {installing ? "Se instalează..." : "Instalează Aplicația"}
              </Button>
            )}

            {/* Manual Instructions */}
            <div className="space-y-4">
              <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                {canPrompt ? "Sau urmează pașii manuali:" : "Urmează acești pași:"}
              </p>
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step}</p>
                  </div>
                  {index === 0 && (
                    <div className="flex-shrink-0">
                      {isIOS ? (
                        <Share className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Menu className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
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

        {/* Native Apps Section */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicații Native</CardTitle>
            <CardDescription>
              Pentru cea mai bună experiență, descarcă aplicația nativă
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://apps.apple.com/app/c-market/id000000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Download on the</p>
                  <p className="text-lg font-semibold">App Store</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
              
              <a 
                href="https://play.google.com/store/apps/details?id=app.lovable.e0bfe707146b4b72b4c4b072982fc18d" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Get it on</p>
                  <p className="text-lg font-semibold">Google Play</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              * Aplicațiile native vor fi disponibile în curând
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InstallApp;
