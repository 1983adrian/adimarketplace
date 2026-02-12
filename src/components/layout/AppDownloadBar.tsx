import React from 'react';
import { Smartphone, Apple, Laptop, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';

export const AppDownloadBar: React.FC = () => {
  const { t } = useTranslation();
  const { isInstalled, isStandalone, canPrompt, promptInstall } = usePWAInstall();

  if (isStandalone || isInstalled) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-1.5 bg-background border-b border-border">
      <span className="text-xs text-muted-foreground mr-1">App:</span>

      {/* iOS */}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" className="h-8 w-8 p-0 bg-foreground hover:bg-foreground/90 text-background rounded-lg shadow-sm">
            <Apple className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Apple className="h-4 w-4" />
              {t('app.iosInstall')}
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>1. {t('app.iosStep1')}</p>
              <p>2. {t('app.iosStep2')}</p>
              <p>3. {t('app.iosStep3')}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Android */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            className="h-8 w-8 p-0 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white rounded-lg shadow-sm"
            onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        {!canPrompt && (
          <PopoverContent className="w-64 p-3" align="center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                {t('app.androidInstall')}
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>1. {t('app.androidStep1')}</p>
                <p>2. {t('app.androidStep2')}</p>
                <p>3. {t('app.androidStep3')}</p>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>

      {/* macOS */}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" className="h-8 w-8 p-0 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 text-white rounded-lg shadow-sm">
            <Laptop className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Laptop className="h-4 w-4" />
              {t('app.macInstall')}
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>1. {t('app.macStep1')}</p>
              <p>2. {t('app.macStep2')}</p>
              <p>3. {t('app.macStep3')}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* QR Code */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm">
            <QrCode className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center text-base">{t('app.scanForApp')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="p-3 bg-white rounded-xl border shadow">
              <QRCodeSVG value="https://www.marketplaceromania.com/install-app" size={150} level="H" includeMargin={true} />
            </div>
            <p className="text-xs text-muted-foreground text-center">{t('app.scanWithCamera')}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
