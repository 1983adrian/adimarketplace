import { useState } from 'react';
import { Search, Store, Lock, Unlock, Clock, AlertTriangle, CheckCircle2, XCircle, Crown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, addDays, format } from 'date-fns';
import { ro } from 'date-fns/locale';

// Fetch all sellers with their subscription info
const useAllSellers = () => {
  return useQuery({
    queryKey: ['admin-all-sellers'],
    queryFn: async () => {
      const { data: sellers, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_seller, seller_trial_started_at, is_listing_blocked, is_buying_blocked, blocked_reason, blocked_at, created_at')
        .eq('is_seller', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get subscriptions for all sellers
      const sellerIds = (sellers || []).map(s => s.user_id);
      
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .in('user_id', sellerIds)
        .eq('status', 'active')
        .neq('plan_type', 'bidder');

      // Map subscriptions to sellers
      const subMap = new Map<string, any>();
      (subscriptions || []).forEach(sub => {
        const existing = subMap.get(sub.user_id);
        if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
          subMap.set(sub.user_id, sub);
        }
      });

      return (sellers || []).map(seller => ({
        ...seller,
        activeSubscription: subMap.get(seller.user_id) || null,
      }));
    },
  });
};

export default function AdminSellerSubscriptions() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { data: sellers, isLoading } = useAllSellers();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, field, value }: { userId: string; field: 'is_listing_blocked' | 'is_buying_blocked'; value: boolean }) => {
      const updateData: any = { [field]: value };
      if (value) {
        updateData.blocked_at = new Date().toISOString();
        updateData.blocked_reason = field === 'is_listing_blocked' 
          ? 'Blocat de admin - abonament expirat' 
          : 'Blocat de admin - abonament cumpărător expirat';
      } else {
        if (field === 'is_listing_blocked') {
          // Check if buying is also unblocked
          updateData.blocked_reason = null;
          updateData.blocked_at = null;
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      // Notify the user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: value ? '🔒 Buton Blocat' : '🔓 Buton Deblocat',
        message: value
          ? `Butonul de ${field === 'is_listing_blocked' ? 'listare produse' : 'cumpărare'} a fost blocat de admin. Contactează suportul sau alege un abonament.`
          : `Butonul de ${field === 'is_listing_blocked' ? 'listare produse' : 'cumpărare'} a fost deblocat de admin.`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-sellers'] });
      toast({ title: 'Status actualizat cu succes!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, planType, planName, priceRon, maxListings }: {
      userId: string; planType: string; planName: string; priceRon: number; maxListings: number | null;
    }) => {
      // Cancel existing active plans
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .neq('plan_type', 'bidder');

      // Create new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          plan_name: planName,
          price_ron: priceRon,
          max_listings: maxListings,
          is_auction_plan: planType === 'licitatii',
          status: 'active',
          trial_plan: false,
        });

      if (error) throw error;

      // Unblock the user
      await supabase.from('profiles').update({
        is_listing_blocked: false,
        is_buying_blocked: false,
        blocked_reason: null,
        blocked_at: null,
        max_listings: maxListings,
      }).eq('user_id', userId);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: '✅ Abonament Activat',
        message: `Planul ${planName} a fost activat de admin. Poți lista produse din nou!`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-sellers'] });
      toast({ title: 'Abonament activat cu succes!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const getTrialStatus = (seller: any) => {
    if (!seller.seller_trial_started_at) return { label: 'Fără Trial', color: 'secondary' as const };
    const trialEnd = addDays(new Date(seller.seller_trial_started_at), 30);
    const now = new Date();
    const daysLeft = differenceInDays(trialEnd, now);
    
    if (daysLeft > 3) return { label: `${daysLeft} zile rămase`, color: 'default' as const };
    if (daysLeft > 0) return { label: `${daysLeft} zile rămase ⚠️`, color: 'destructive' as const };
    return { label: 'Expirat', color: 'destructive' as const };
  };

  const filteredSellers = sellers?.filter(seller => {
    const matchesSearch = 
      seller.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      seller.username?.toLowerCase().includes(search.toLowerCase()) ||
      seller.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      seller.store_name?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'blocked') return matchesSearch && (seller.is_listing_blocked || seller.is_buying_blocked);
    if (filter === 'no_plan') return matchesSearch && !seller.activeSubscription;
    if (filter === 'active') return matchesSearch && !!seller.activeSubscription && !seller.is_listing_blocked;
    if (filter === 'trial') return matchesSearch && seller.activeSubscription?.trial_plan;
    if (filter === 'expired') {
      if (!seller.seller_trial_started_at) return false;
      const trialEnd = addDays(new Date(seller.seller_trial_started_at), 30);
      return matchesSearch && new Date() > trialEnd && !seller.activeSubscription?.trial_plan === false;
    }
    return matchesSearch;
  });

  const PLANS_FOR_ADMIN = [
    { type: 'start', name: 'Plan START', price: 11, max: 10 },
    { type: 'licitatii', name: 'Plan LICITAȚII', price: 11, max: 10 },
    { type: 'silver', name: 'Plan SILVER', price: 50, max: 50 },
    { type: 'gold', name: 'Plan GOLD', price: 150, max: 150 },
    { type: 'platinum', name: 'Plan PLATINUM', price: 499, max: 500 },
    { type: 'vip', name: 'Plan VIP', price: 999, max: null },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 w-full max-w-full overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-amber-500" />
            Gestionare Abonamente Vânzători
          </h1>
          <p className="text-sm text-muted-foreground">
            Vezi toți vânzătorii, abonamentele lor, blochează/deblochează butoane
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{sellers?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Total Vânzători</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {sellers?.filter(s => s.activeSubscription && !s.activeSubscription.trial_plan).length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Cu Abonament Plătit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sellers?.filter(s => s.activeSubscription?.trial_plan).length || 0}
              </div>
              <div className="text-xs text-muted-foreground">În Trial Gratuit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {sellers?.filter(s => s.is_listing_blocked).length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Blocați</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume, username, ID, magazin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrează" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți Vânzătorii</SelectItem>
                  <SelectItem value="active">Cu Abonament Activ</SelectItem>
                  <SelectItem value="trial">În Trial Gratuit</SelectItem>
                  <SelectItem value="no_plan">Fără Plan Activ</SelectItem>
                  <SelectItem value="blocked">Blocați</SelectItem>
                  <SelectItem value="expired">Trial Expirat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Vânzător</TableHead>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Plan Activ</TableHead>
                      <TableHead className="text-xs">Trial</TableHead>
                      <TableHead className="text-xs">Listare</TableHead>
                      <TableHead className="text-xs">Cumpărare</TableHead>
                      <TableHead className="text-xs">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers?.map((seller) => {
                      const trialStatus = getTrialStatus(seller);
                      const sub = seller.activeSubscription;
                      
                      return (
                        <TableRow key={seller.user_id}>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={seller.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {seller.display_name?.[0] || 'V'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{seller.display_name || 'Fără nume'}</p>
                                {seller.store_name && (
                                  <p className="text-xs text-muted-foreground">{seller.store_name}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <code className="text-[10px] bg-muted px-1 py-0.5 rounded">
                              #{seller.user_id?.slice(0, 8)}
                            </code>
                          </TableCell>
                          <TableCell className="py-2">
                            {sub ? (
                              <div>
                                <Badge variant={sub.trial_plan ? 'outline' : 'default'} className="text-[10px]">
                                  {sub.plan_name}
                                </Badge>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {sub.max_listings ? `Max ${sub.max_listings}` : '∞'} listări
                                </p>
                              </div>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">Fără Plan</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant={trialStatus.color} className="text-[10px]">
                              {trialStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              {seller.is_listing_blocked ? (
                                <Lock className="h-4 w-4 text-red-500" />
                              ) : (
                                <Unlock className="h-4 w-4 text-green-500" />
                              )}
                              <Switch
                                checked={!seller.is_listing_blocked}
                                onCheckedChange={(checked) => 
                                  toggleBlockMutation.mutate({
                                    userId: seller.user_id,
                                    field: 'is_listing_blocked',
                                    value: !checked,
                                  })
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              {seller.is_buying_blocked ? (
                                <Lock className="h-4 w-4 text-red-500" />
                              ) : (
                                <Unlock className="h-4 w-4 text-green-500" />
                              )}
                              <Switch
                                checked={!seller.is_buying_blocked}
                                onCheckedChange={(checked) =>
                                  toggleBlockMutation.mutate({
                                    userId: seller.user_id,
                                    field: 'is_buying_blocked',
                                    value: !checked,
                                  })
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Select
                              onValueChange={(val) => {
                                const plan = PLANS_FOR_ADMIN.find(p => p.type === val);
                                if (plan) {
                                  activateSubscriptionMutation.mutate({
                                    userId: seller.user_id,
                                    planType: plan.type,
                                    planName: plan.name,
                                    priceRon: plan.price,
                                    maxListings: plan.max,
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Activează Plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {PLANS_FOR_ADMIN.map(plan => (
                                  <SelectItem key={plan.type} value={plan.type} className="text-xs">
                                    {plan.name} ({plan.price} LEI)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredSellers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Niciun vânzător găsit
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
