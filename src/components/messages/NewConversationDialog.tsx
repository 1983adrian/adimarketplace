import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Store, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewConversationDialogProps {
  onSelectSeller: (sellerId: string, listingId?: string) => void;
  currentUserId: string;
}

export const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  onSelectSeller,
  currentUserId
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sellers with active listings
  const { data: sellers, isLoading } = useQuery({
    queryKey: ['active-sellers', searchQuery],
    queryFn: async () => {
      // Use secure public view that only exposes safe columns
      let query = supabase
        .from('public_seller_profiles')
        .select(`
          user_id,
          display_name,
          username,
          avatar_url,
          store_name,
          is_verified
        `)
        .neq('user_id', currentUserId)
        .limit(20);

      if (searchQuery) {
        query = query.or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,store_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get a listing for each seller to use for conversation
      const sellersWithListings = await Promise.all(
        (data || []).map(async (seller) => {
          const { data: listing } = await supabase
            .from('listings')
            .select('id, title')
            .eq('seller_id', seller.user_id)
            .eq('is_active', true)
            .limit(1)
            .single();
          
          return {
            ...seller,
            listing_id: listing?.id,
            listing_title: listing?.title
          };
        })
      );

      return sellersWithListings.filter(s => s.listing_id);
    },
    enabled: open,
  });

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSelect = (seller: any) => {
    onSelectSeller(seller.user_id, seller.listing_id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Conversație Nouă
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactează un Vânzător</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau magazin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sellers && sellers.length > 0 ? (
              <div className="space-y-2">
                {sellers.map((seller) => (
                  <div
                    key={seller.user_id}
                    onClick={() => handleSelect(seller)}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={seller.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(seller.display_name || seller.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {seller.display_name || seller.username || 'Vânzător'}
                        </p>
                        {seller.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verificat</Badge>
                        )}
                      </div>
                      {seller.store_name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          {seller.store_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nu s-au găsit vânzători</p>
                <p className="text-sm">Încearcă altă căutare</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
