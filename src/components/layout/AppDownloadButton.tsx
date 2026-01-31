import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { 
  Download, 
  Smartphone, 
  Apple, 
  ChevronRight,
  Sparkles,
  Share,
  Menu,
  Plus
} from "lucide-react";

export const AppDownloadButton = () => {
  const { 
    isInstalled, 
    isStandalone,
    isIOS,
    isAndroid,
    canPrompt,
    promptInstall,
    getInstallInstructions
  } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [open, setOpen] = useState(false);

  // Don't show if already installed
  if (isStandalone || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    const result = await promptInstall();
    setInstalling(false);
    if (result.success) {
      setOpen(false);
    }
  };

  const instructions = getInstallInstructions();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary hover:bg-primary/20 text-primary font-medium shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Descarcă App</span>
          <span className="sm:hidden">App</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Marketplace România</h3>
              <p className="text-sm text-muted-foreground">Aplicație gratuită pentru mobil</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 space-y-3">
          {/* Direct Install Button - Chrome, Edge, etc. */}
          {canPrompt && (
            <Button 
              className="w-full justify-start gap-3 h-14 bg-primary hover:bg-primary/90"
              onClick={handleInstall}
              disabled={installing}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">
                  {installing ? "Se instalează..." : "Instalează Acum"}
                </p>
                <p className="text-xs opacity-80">Un click și gata!</p>
              </div>
              <Sparkles className="h-5 w-5" />
            </Button>
          )}

          {/* iOS Instructions */}
          {isIOS && !canPrompt && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Apple className="h-4 w-4" />
                Instalare pe iPhone/iPad
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                  <span className="flex-1">Apasă pe <Share className="h-4 w-4 inline mx-1" /> Share</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                  <span className="flex-1">Selectează <Plus className="h-4 w-4 inline mx-1" /> "Add to Home Screen"</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                  <span className="flex-1">Apasă "Add" pentru confirmare</span>
                </div>
              </div>
            </div>
          )}

          {/* Android Instructions (when browser doesn't support prompt) */}
          {isAndroid && !canPrompt && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Smartphone className="h-4 w-4" />
                Instalare pe Android
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                  <span className="flex-1">Apasă pe <Menu className="h-4 w-4 inline mx-1" /> meniul browserului</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                  <span className="flex-1">Selectează "Install app" sau "Add to Home screen"</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                  <span className="flex-1">Confirmă instalarea</span>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Instructions */}
          {!isIOS && !isAndroid && !canPrompt && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Smartphone className="h-4 w-4" />
                Instalare pe Desktop
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                  <span className="flex-1">Caută iconița <Download className="h-4 w-4 inline mx-1" /> în bara de adrese</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                  <span className="flex-1">Click pe ea și confirmă instalarea</span>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Funcționează offline
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Notificări push
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              100% gratuit
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Fără magazin
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t">
          <Link 
            to="/install" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
            onClick={() => setOpen(false)}
          >
            Instrucțiuni detaliate
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
