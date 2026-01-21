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
  Play,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";

export const AppDownloadButton = () => {
  const { 
    isInstalled, 
    isStandalone,
    isIOS,
    isAndroid,
    canPrompt,
    promptInstall 
  } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [open, setOpen] = useState(false);

  // Don't show if already installed
  if (isStandalone || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
    setOpen(false);
  };

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
              <h3 className="font-bold text-base">Descarcă C Market</h3>
              <p className="text-sm text-muted-foreground">Aplicația oficială pe telefon</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 space-y-2">
          {/* PWA Install Button */}
          {canPrompt && (
            <Button 
              className="w-full justify-start gap-3 h-12 bg-primary hover:bg-primary/90"
              onClick={handleInstall}
              disabled={installing}
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">
                  {installing ? "Se instalează..." : "Instalează Acum"}
                </p>
                <p className="text-xs opacity-80">Direct din browser</p>
              </div>
              <Sparkles className="h-4 w-4" />
            </Button>
          )}

          {/* iOS Button */}
          <a 
            href="https://apps.apple.com/app/c-market/id000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Apple className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">App Store</p>
              <p className="text-xs text-muted-foreground">Pentru iPhone & iPad</p>
            </div>
            {isIOS && <Check className="h-4 w-4 text-green-500" />}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>

          {/* Android Button */}
          <a 
            href="https://play.google.com/store/apps/details?id=app.lovable.e0bfe707146b4b72b4c4b072982fc18d" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Google Play</p>
              <p className="text-xs text-muted-foreground">Pentru Android</p>
            </div>
            {isAndroid && <Check className="h-4 w-4 text-green-500" />}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t">
          <Link 
            to="/install" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
            onClick={() => setOpen(false)}
          >
            Mai multe instrucțiuni
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
