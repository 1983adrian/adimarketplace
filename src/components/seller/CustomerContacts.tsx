import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Heart, ShoppingBag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation } from '@/hooks/useConversations';
import { toast } from 'sonner';

interface CustomerContact {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  listing_id: string;
  listing_title: string;
  type: 'favorite' | 'buyer';
  created_at: string;
}

export const CustomerContacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  // Fetch users who favorited seller's listings
  const { data: favoriters, isLoading: favoritersLoading } = useQuery({
    queryKey: ['seller-favoriters', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get seller's listings
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title')
        .eq('seller_id', user.id)
        .eq('is_active', true);
      
      if (!listings || listings.length === 0) return [];
      
      const listingIds = listings.map(l => l.id);
      
      // Get favorites for these listings
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          user_id,
          listing_id,
          created_at,
          profiles:user_id (display_name, username, avatar_url)
        `)
        .in('listing_id', listingIds)
        .neq('user_id', user.id);
      
      if (error) throw error;
      
      return favorites?.map(f => ({
        user_id: f.user_id,
        display_name: (f.profiles as any)?.display_name,
        username: (f.profiles as any)?.username,
        avatar_url: (f.profiles as any)?.avatar_url,
        listing_id: f.listing_id,
        listing_title: listings.find(l => l.id === f.listing_id)?.title || 'Produs',
        type: 'favorite' as const,
        created_at: f.created_at
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch buyers from orders
  const { data: buyers, isLoading: buyersLoading } = useQuery({
    queryKey: ['seller-buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          buyer_id,
          listing_id,
          created_at,
          listings (title),
          profiles:buyer_id (display_name, username, avatar_url)
        `)
        .eq('seller_id', user.id)
        .in('status', ['paid', 'shipped', 'delivered']);
      
      if (error) throw error;
      
      return orders?.map(o => ({
        user_id: o.buyer_id,
        display_name: (o.profiles as any)?.display_name,
        username: (o.profiles as any)?.username,
        avatar_url: (o.profiles as any)?.avatar_url,
        listing_id: o.listing_id || '',
        listing_title: (o.listings as any)?.title || 'Produs',
        type: 'buyer' as const,
        created_at: o.created_at
      })) || [];
    },
    enabled: !!user?.id,
  });

  const handleStartChat = async (contact: CustomerContact) => {
    if (!user?.id || !contact.listing_id) return;
    
    try {
      const result = await createConversation.mutateAsync({
        listingId: contact.listing_id,
        buyerId: contact.user_id,
        sellerId: user.id
      });
      
      navigate(`/messages?conversation=${result.id}`);
    } catch (error) {
      toast.error('Nu s-a putut iniția conversația');
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderContactList = (contacts: CustomerContact[] | undefined, isLoading: boolean, emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!contacts || contacts.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    // Group by user to avoid duplicates
    const uniqueContacts = contacts.reduce((acc, contact) => {
      if (!acc.find(c => c.user_id === contact.user_id)) {
        acc.push(contact);
      }
      return acc;
    }, [] as CustomerContact[]);

    return (
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {uniqueContacts.map((contact, index) => (
            <div
              key={`${contact.user_id}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={contact.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(contact.display_name || contact.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {contact.display_name || contact.username || 'Utilizator'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {contact.listing_title}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartChat(contact)}
                disabled={createConversation.isPending}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Scrie
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contacte Clienți
        </CardTitle>
        <CardDescription>
          Utilizatorii care au salvat sau cumpărat produsele tale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="favoriters">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favoriters" className="gap-2">
              <Heart className="h-4 w-4" />
              Au Salvat ({favoriters?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="buyers" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Au Cumpărat ({buyers?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favoriters" className="mt-4">
            {renderContactList(
              favoriters,
              favoritersLoading,
              'Nimeni nu a salvat produsele tale încă'
            )}
          </TabsContent>
          
          <TabsContent value="buyers" className="mt-4">
            {renderContactList(
              buyers,
              buyersLoading,
              'Nu ai vânzări încă'
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
