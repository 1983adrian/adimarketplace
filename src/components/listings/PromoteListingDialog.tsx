import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, 
  Crown, 
  Facebook, 
  Instagram, 
  Twitter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCreateSocialPromotion, useListingPromotion } from '@/hooks/usePromotions';
import { toast } from 'sonner';

interface PromoteListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'bg-black hover:bg-gray-800' },
  { id: 'tiktok', name: 'TikTok', icon: Share2, color: 'bg-black hover:bg-gray-800' },
];

export const PromoteListingDialog: React.FC<PromoteListingDialogProps> = ({
  open,
  onOpenChange,
  listingId,
  listingTitle
}) => {
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);
  
  const { data: activePromotion } = useListingPromotion(listingId);
  const createSocialPromotion = useCreateSocialPromotion();

  const handleSocialShare = async (platform: string) => {
    setSharingPlatform(platform);
    
    try {
      const result = await createSocialPromotion.mutateAsync({ listingId, platform });
      
      const listingUrl = `${window.location.origin}/listing/${listingId}`;
      const shareText = encodeURIComponent(`Check out ${listingTitle} on our marketplace!`);
      
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(listingUrl)}`;
          break;
        case 'instagram':
          navigator.clipboard.writeText(listingUrl);
          toast.success('Link copiat! Distribuie pe Instagram');
          break;
        case 'tiktok':
          navigator.clipboard.writeText(listingUrl);
          toast.success('Link copiat! Distribuie pe TikTok');
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      
      toast.success(result.message || 'Promovare activată pentru 12 ore!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Eroare la activarea promovării');
    } finally {
      setSharingPlatform(null);
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}z ${hours % 24}h rămase`;
    return `${hours}h rămase`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Promovează Produsul
          </DialogTitle>
          <DialogDescription>
            Distribuie pe social media pentru vizibilitate gratuită
          </DialogDescription>
        </DialogHeader>

        {activePromotion && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Activ acum</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTimeRemaining(activePromotion.ends_at)}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Card className="border-2 border-dashed">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Distribuie & Promovează</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  GRATUIT
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Distribuie pe social media și primești <strong>12 ore</strong> de vizibilitate pe pagina principală
              </p>
              <div className="grid grid-cols-2 gap-2">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className={`${platform.color} text-white border-0`}
                    onClick={() => handleSocialShare(platform.id)}
                    disabled={sharingPlatform === platform.id || createSocialPromotion.isPending}
                  >
                    <platform.icon className="h-4 w-4 mr-2" />
                    {platform.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
