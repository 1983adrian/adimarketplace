import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, Users, Gavel, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'listing' | 'sale' | 'bid' | 'user';
  message: string;
  timestamp: Date;
  icon: React.ReactNode;
}

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Fetch real platform statistics
  const { data: stats } = useQuery({
    queryKey: ['platform-live-stats'],
    queryFn: async () => {
      const [listingsResult, usersResult, ordersResult, bidsResult] = await Promise.all([
        supabase.from('listings').select('id, title, created_at', { count: 'exact' }).eq('is_active', true).order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, display_name, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(3),
        supabase.from('orders').select('id, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(3),
        supabase.from('bids').select('id, amount, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(3)
      ]);

      return {
        listings: listingsResult.data || [],
        listingsCount: listingsResult.count || 0,
        users: usersResult.data || [],
        usersCount: usersResult.count || 0,
        orders: ordersResult.data || [],
        ordersCount: ordersResult.count || 0,
        bids: bidsResult.data || [],
        bidsCount: bidsResult.count || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for freshness
    staleTime: 15000
  });

  useEffect(() => {
    if (!stats) return;

    const newActivities: ActivityItem[] = [];

    // Add recent listings
    stats.listings.forEach((listing: any) => {
      newActivities.push({
        id: `listing-${listing.id}`,
        type: 'listing',
        message: `Produs nou adăugat: "${listing.title?.substring(0, 30)}..."`,
        timestamp: new Date(listing.created_at),
        icon: <ShoppingBag className="h-4 w-4 text-primary" />
      });
    });

    // Add recent users (anonymized)
    stats.users.forEach((user: any, index: number) => {
      newActivities.push({
        id: `user-${user.id}`,
        type: 'user',
        message: `Un nou utilizator s-a alăturat comunității`,
        timestamp: new Date(user.created_at),
        icon: <Users className="h-4 w-4 text-green-500" />
      });
    });

    // Add recent bids
    stats.bids.forEach((bid: any) => {
      newActivities.push({
        id: `bid-${bid.id}`,
        type: 'bid',
        message: `Licitație nouă: ${bid.amount} RON`,
        timestamp: new Date(bid.created_at),
        icon: <Gavel className="h-4 w-4 text-amber-500" />
      });
    });

    // Sort by timestamp
    newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setActivities(newActivities.slice(0, 8));
  }, [stats]);

  if (!stats || activities.length === 0) return null;

  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Stats bar - SEO optimized with real numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-card border">
            <div className="text-2xl font-bold text-primary">{stats.listingsCount.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Produse Active</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border">
            <div className="text-2xl font-bold text-green-600">{stats.usersCount.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Utilizatori Înregistrați</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border">
            <div className="text-2xl font-bold text-amber-600">{stats.bidsCount.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Licitații Plasate</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border">
            <div className="text-2xl font-bold text-blue-600">{stats.ordersCount.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Comenzi Finalizate</div>
          </div>
        </div>

        {/* Live activity feed */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <h2 className="text-lg font-semibold">Activitate în Timp Real</h2>
          <TrendingUp className="h-4 w-4 text-primary ml-auto" />
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col gap-2">
            {activities.slice(0, 5).map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors"
              >
                {activity.icon}
                <span className="flex-1 text-sm">{activity.message}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ro })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Text - hidden visually but readable by Google */}
        <p className="sr-only">
          Marketplace România este cea mai activă platformă de cumpărături și vânzări online din România. 
          Cu peste {stats.listingsCount} produse active și {stats.usersCount} utilizatori înregistrați, 
          oferim o experiență de shopping sigură și accesibilă. Licitații online, produse noi și second-hand, 
          livrare rapidă în toată România.
        </p>
      </div>
    </section>
  );
};
