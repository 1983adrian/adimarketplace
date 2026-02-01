import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingBag, MessageCircle, ExternalLink } from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { TopSellerBadge } from '@/components/TopSellerBadge';
import { cn } from '@/lib/utils';

interface SellerCardProProps {
  seller: {
    user_id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    store_name: string | null;
    bio: string | null;
    location: string | null;
    is_verified: boolean | null;
    total_sales?: number;
    average_rating?: number;
    products_count?: number;
  };
  variant?: 'compact' | 'full';
  className?: string;
}

export const SellerCardPro: React.FC<SellerCardProProps> = ({
  seller,
  variant = 'full',
  className,
}) => {
  const displayName = seller.store_name || seller.display_name || seller.username || 'Vânzător';
  
  if (variant === 'compact') {
    return (
      <Link to={`/seller/${seller.user_id}`}>
        <Card className={cn(
          'group overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
          className
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={seller.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{displayName}</span>
                  <VerifiedBadge userId={seller.user_id} size="sm" />
                  <TopSellerBadge userId={seller.user_id} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {seller.average_rating && seller.average_rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {seller.average_rating.toFixed(1)}
                    </span>
                  )}
                  {seller.total_sales !== undefined && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {seller.total_sales} vânzări
                    </span>
                  )}
                </div>
              </div>
              
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn(
      'group overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl hover:shadow-primary/20 transition-all duration-500',
      className
    )}>
      {/* Header Banner */}
      <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute -bottom-10 left-4">
          <Avatar className="h-20 w-20 ring-4 ring-slate-900 shadow-xl">
            <AvatarImage src={seller.avatar_url || undefined} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl font-bold">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-12 pb-6 px-6">
        {/* Name & Badges */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-bold">{displayName}</h3>
              <VerifiedBadge userId={seller.user_id} size="md" />
            </div>
            <TopSellerBadge userId={seller.user_id} size="md" showLabel />
          </div>
        </div>

        {/* Bio */}
        {seller.bio && (
          <p className="text-sm text-white/70 mb-4 line-clamp-2">{seller.bio}</p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-amber-400">
                {seller.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-xs text-white/60">Rating</span>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-lg font-bold text-emerald-400 mb-1">
              {seller.total_sales || 0}
            </div>
            <span className="text-xs text-white/60">Vânzări</span>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-lg font-bold text-blue-400 mb-1">
              {seller.products_count || 0}
            </div>
            <span className="text-xs text-white/60">Produse</span>
          </div>
        </div>


        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            asChild 
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/30"
          >
            <Link to={`/seller/${seller.user_id}`}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Vezi Magazin
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="border-white/20 hover:bg-white/10 text-white"
            asChild
          >
            <Link to={`/messages?seller=${seller.user_id}`}>
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerCardPro;
