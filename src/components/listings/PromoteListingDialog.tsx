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
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCreateSocialPromotion, useCreatePaidPromotion, usePromotionFee, useListingPromotion } from '@/hooks/usePromotions';
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
  const { data: promotionFee } = usePromotionFee();
  const createSocialPromotion = useCreateSocialPromotion();
  const createPaidPromotion = useCreatePaidPromotion();

  const handleSocialShare = async (platform: string) => {
    setSharingPlatform(platform);
    
    try {
      const result = await createSocialPromotion.mutateAsync({ listingId, platform });
      
      // Generate share URL based on platform
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
          // Instagram doesn't have direct share URL, copy link instead
          navigator.clipboard.writeText(listingUrl);
          toast.success('Link copied! Share it on Instagram');
          break;
        case 'tiktok':
          navigator.clipboard.writeText(listingUrl);
          toast.success('Link copied! Share it on TikTok');
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      
      toast.success(result.message || 'Promotion activated for 12 hours!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate promotion');
    } finally {
      setSharingPlatform(null);
    }
  };

  const handlePaidPromotion = async () => {
    try {
      await createPaidPromotion.mutateAsync({ listingId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h remaining`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Promote Your Listing
          </DialogTitle>
          <DialogDescription>
            Get more visibility and sell faster
          </DialogDescription>
        </DialogHeader>

        {activePromotion && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Currently Promoted</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTimeRemaining(activePromotion.ends_at)} • {activePromotion.promotion_type === 'paid' ? 'Paid' : 'Social Share'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Free Social Share Option */}
          <Card className="border-2 border-dashed">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Share & Get Featured</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  FREE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Share on social media and get <strong>12 hours</strong> of homepage visibility
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

          {/* Paid Promotion Option */}
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Premium Boost</span>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  £{promotionFee?.amount || 3}/week
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Featured on homepage for <strong>7 full days</strong> with priority placement
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-primary" />
                  24/7 visibility for a full week
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Priority in search results
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={handlePaidPromotion}
                disabled={createPaidPromotion.isPending}
              >
                <Crown className="h-4 w-4 mr-2" />
                {createPaidPromotion.isPending ? 'Processing...' : 'Get Premium Boost'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
