import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Facebook, Instagram, Twitter, Copy, Check, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ShareListingDialogProps {
  listingId: string;
  listingTitle: string;
  listingPrice?: number;
  listingImage?: string;
  children?: React.ReactNode;
}

// TikTok SVG Icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const socialPlatforms = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'bg-[#1877F2] hover:bg-[#166FE5]',
    description: 'Marketplace & Feed'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90',
    description: 'Story sau Reels'
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: Twitter, 
    color: 'bg-black hover:bg-gray-800',
    description: 'Tweet rapid'
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: WhatsAppIcon, 
    color: 'bg-[#25D366] hover:bg-[#20BD5A]',
    description: 'Grupuri & Contacte'
  },
];

export const ShareListingDialog: React.FC<ShareListingDialogProps> = ({
  listingId,
  listingTitle,
  listingPrice,
  listingImage,
  children
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const listingUrl = `${window.location.origin}/listing/${listingId}`;
  const platformName = 'C Market România';
  
  const priceText = listingPrice ? ` 💰 ${listingPrice} RON` : '';
  const shareText = `🛒 ${listingTitle}${priceText}\n\n✨ Disponibil pe ${platformName}!\n🛡️ Plată securizată & Livrare rapidă`;
  const shareTextEncoded = encodeURIComponent(shareText);
  const listingUrlEncoded = encodeURIComponent(listingUrl);

  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${listingUrlEncoded}&quote=${shareTextEncoded}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${shareTextEncoded}&url=${listingUrlEncoded}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${shareTextEncoded}%20${listingUrlEncoded}`;
        window.open(shareUrl, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${shareText}\n\n${listingUrl}`);
        toast.success('Link copiat! Lipește-l în Story sau Bio Instagram');
        break;
      case 'tiktok':
        navigator.clipboard.writeText(`${shareText}\n\n${listingUrl}`);
        toast.success('Link copiat! Lipește-l în descrierea TikTok sau Bio');
        break;
    }

    if (platform !== 'instagram' && platform !== 'tiktok') {
      toast.success(`Se deschide ${platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      setCopied(true);
      toast.success('Link copiat în clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nu s-a putut copia link-ul');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Promovează
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Promovează Produsul
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Organic Growth Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">Creștere Organică Gratuită</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Distribuie pe rețelele sociale pentru a ajunge la mai mulți cumpărători. Link-ul include imagine, preț și descriere optimizate!
                </p>
              </div>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-start gap-3">
              {listingImage && (
                <img 
                  src={listingImage} 
                  alt={listingTitle}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-2">{listingTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{platformName}</p>
                {listingPrice && (
                  <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {listingPrice} RON
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              const isCustomIcon = typeof IconComponent === 'function' && !('render' in IconComponent);
              return (
                <Button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  className={`${platform.color} text-white h-auto py-3 flex flex-col items-center gap-1`}
                >
                  {isCustomIcon ? <IconComponent /> : <IconComponent className="h-5 w-5" />}
                  <span className="text-xs font-medium">{platform.name}</span>
                  <span className="text-[10px] opacity-80">{platform.description}</span>
                </Button>
              );
            })}
          </div>
          
          {/* TikTok - Full Width */}
          <Button
            onClick={() => handleShare('tiktok')}
            className="w-full bg-black hover:bg-gray-800 text-white h-auto py-3 flex items-center justify-center gap-3"
          >
            <TikTokIcon />
            <div className="text-left">
              <span className="text-sm font-medium block">TikTok</span>
              <span className="text-[10px] opacity-80">Video viral sau Bio link</span>
            </div>
          </Button>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Link direct:</p>
            <div className="flex gap-2">
              <Input 
                value={listingUrl} 
                readOnly 
                className="text-xs bg-muted"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyLink}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Preview Link */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full gap-2 text-muted-foreground"
            onClick={() => window.open(listingUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Vezi cum apare pentru cumpărători
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
