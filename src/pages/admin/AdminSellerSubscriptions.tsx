import { useState, useEffect } from 'react';
import { Search, Store, Lock, Unlock, Crown, CheckCircle2, XCircle, BanknoteIcon, Clock, CreditCard, Save, Pencil, AlertTriangle, ShieldCheck, Ban, Bell, Users, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ─── All users (not just sellers) ───
const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin-all-users-subs'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_seller, is_verified, is_suspended, seller_trial_started_at, is_listing_blocked, is_buying_blocked, blocked_reason, blocked_at, created_at, paypal_email, short_id, total_sales_count, average_rating')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (users || []).map(u => u.user_id);

      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'active')
        .neq('plan_type', 'bidder');

      const subMap = new Map<string, any>();
      (subscriptions || []).forEach(sub => {
        const existing = subMap.get(sub.user_id);
        if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
          subMap.set(sub.user_id, sub);
        }
      });

      return (users || []).map(user => ({
        ...user,
        activeSubscription: subMap.get(user.user_id) || null,
      }));
    },
  });
};

// ─── Top 10 sellers ───
const useTop10Sellers = () => {
  return useQuery({
    queryKey: ['admin-top10-sellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_verified, total_sales_count, average_rating, short_id')
        .eq('is_seller', true)
        .gt('total_sales_count', 0)
        .order('total_sales_count', { ascending: false })
        .order('average_rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });
};

const usePendingPayments = () => {
  return useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, short_id')
        .in('user_id', userIds);

      const profileMap = new Map<string, any>();
      (profiles || []).forEach(p => profileMap.set(p.user_id, p));

      return (data || []).map(payment => ({
        ...payment,
        profile: profileMap.get(payment.user_id) || null,
      }));
    },
  });
};

const useBankSettings = () => {
  return useQuery({
    queryKey: ['admin-bank-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['subscription_bank_name', 'subscription_bank_iban', 'subscription_bank_institution']);

      if (error) throw error;

      const map: Record<string, string> = {};
      (data || []).forEach(row => {
        const val = row.value;
        map[row.key] = typeof val === 'string' ? val : String(val ?? '');
      });

      return {
        name: map['subscription_bank_name'] || '',
        iban: map['subscription_bank_iban'] || '',
        bank: map['subscription_bank_institution'] || '',
      };
    },
  });
};

const PLANS_FOR_ADMIN = [
  { type: 'start', name: 'Plan START', price: 11, max: 10 },
  { type: 'silver', name: 'Plan SILVER', price: 50, max: 50 },
  { type: 'gold', name: 'Plan GOLD', price: 150, max: 150 },
  { type: 'platinum', name: 'Plan PLATINUM', price: 499, max: 500 },
  { type: 'vip', name: 'Plan VIP', price: 999, max: null as number | null },
];

export default function AdminSellerSubscriptions() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { data: users, isLoading } = useAllUsers();
  const { data: top10 } = useTop10Sellers();
  const { data: payments, isLoading: paymentsLoading } = usePendingPayments();
  const { data: bankSettings } = useBankSettings();
  const [bankName, setBankName] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [bankInstitution, setBankInstitution] = useState('');
  const [bankLoaded, setBankLoaded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const top10Ids = new Set((top10 || []).map(s => s.user_id));

  useEffect(() => {
    if (bankSettings && !bankLoaded) {
      setBankName(bankSettings.name);
      setBankIban(bankSettings.iban);
      setBankInstitution(bankSettings.bank);
      setBankLoaded(true);
    }
  }, [bankSettings, bankLoaded]);

  // ─── Mutations ───

  const saveBankSettingsMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { key: 'subscription_bank_name', value: JSON.stringify(bankName), category: 'payments' },
        { key: 'subscription_bank_iban', value: JSON.stringify(bankIban), category: 'payments' },
        { key: 'subscription_bank_institution', value: JSON.stringify(bankInstitution), category: 'payments' },
      ];
      for (const u of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert({ key: u.key, value: u.value as any, category: u.category }, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bank-settings'] });
      queryClient.invalidateQueries({ queryKey: ['bank-details'] });
      toast({ title: '✅ Date bancare salvate!' });
    },
    onError: () => {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, field, value }: { userId: string; field: 'is_listing_blocked' | 'is_buying_blocked'; value: boolean }) => {
      const updateData: any = { [field]: value };
      if (value) {
        updateData.blocked_at = new Date().toISOString();
        updateData.blocked_reason = 'Blocat de admin';
      } else {
        updateData.blocked_reason = null;
        updateData.blocked_at = null;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: value ? '🔒 Vânzare Blocată' : '🔓 Vânzare Deblocată',
        message: value
          ? `Butonul de ${field === 'is_listing_blocked' ? 'listare produse' : 'cumpărare'} a fost blocat. Contactează suportul.`
          : `Butonul de ${field === 'is_listing_blocked' ? 'listare produse' : 'cumpărare'} a fost deblocat.`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-subs'] });
      toast({ title: 'Status actualizat!' });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const { error } = await supabase.rpc('admin_suspend_user', { p_user_id: userId, p_suspend: suspend });
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: suspend ? '⛔ Cont Suspendat' : '✅ Cont Reactivat',
        message: suspend
          ? 'Contul tău a fost suspendat de un administrator. Contactează suportul pentru detalii.'
          : 'Contul tău a fost reactivat. Bine ai revenit!',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-subs'] });
      toast({ title: 'Status cont actualizat!' });
    },
  });

  const warnMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: '⚠️ Avertisment de la Administrator',
        message: 'Ai primit un avertisment. Încălcarea repetată a regulilor poate duce la suspendarea contului. Verifică regulile platformei.',
      });
    },
    onSuccess: () => {
      toast({ title: '⚠️ Avertisment trimis!' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: verified })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-subs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-top10-sellers'] });
      toast({ title: '✅ Verificare actualizată!' });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, planType, planName, priceRon, maxListings }: {
      userId: string; planType: string; planName: string; priceRon: number; maxListings: number | null;
    }) => {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .neq('plan_type', 'bidder');

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          plan_name: planName,
          price_ron: priceRon,
          max_listings: maxListings,
          is_auction_plan: false,
          status: 'active',
          trial_plan: false,
        });

      if (error) throw error;

      const profileUpdate: any = {
        is_listing_blocked: false,
        blocked_reason: null,
        blocked_at: null,
        max_listings: maxListings,
      };

      // VIP plan = auto-verify
      if (planType === 'vip') {
        profileUpdate.is_verified = true;
      }

      await supabase.from('profiles').update(profileUpdate).eq('user_id', userId);

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: '✅ Abonament Activat',
        message: `Planul ${planName} a fost activat. Poți lista produse!${planType === 'vip' ? ' ✔️ Contul tău a fost verificat automat.' : ''}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-subs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-top10-sellers'] });
      toast({ title: 'Abonament activat!' });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, userId, planType, planName, priceRon, maxListings }: {
      paymentId: string; userId: string; planType: string; planName: string; priceRon: number; maxListings: number | null;
    }) => {
      const { error: payError } = await supabase
        .from('subscription_payments')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', paymentId);
      if (payError) throw payError;

      await activateSubscriptionMutation.mutateAsync({ userId, planType, planName, priceRon, maxListings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      toast({ title: '✅ Plată confirmată și abonament activat!' });
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, userId }: { paymentId: string; userId: string }) => {
      const { error } = await supabase
        .from('subscription_payments')
        .update({ status: 'rejected', rejected_at: new Date().toISOString() })
        .eq('id', paymentId);
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: '❌ Plată Respinsă',
        message: 'Transferul tău bancar nu a fost confirmat. Verifică suma și încearcă din nou.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      toast({ title: 'Plată respinsă.' });
    },
  });

  // ─── Filters ───
  const getTrialStatus = (user: any) => {
    if (!user.seller_trial_started_at) return { label: 'N/A', color: 'secondary' as const };
    const trialEnd = addDays(new Date(user.seller_trial_started_at), 30);
    const daysLeft = differenceInDays(trialEnd, new Date());
    if (daysLeft > 3) return { label: `${daysLeft}z`, color: 'default' as const };
    if (daysLeft > 0) return { label: `${daysLeft}z ⚠️`, color: 'destructive' as const };
    return { label: 'Expirat', color: 'destructive' as const };
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch =
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      user.store_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.short_id?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'sellers') return matchesSearch && user.is_seller;
    if (filter === 'buyers') return matchesSearch && !user.is_seller;
    if (filter === 'blocked') return matchesSearch && user.is_listing_blocked;
    if (filter === 'suspended') return matchesSearch && user.is_suspended;
    if (filter === 'verified') return matchesSearch && user.is_verified;
    if (filter === 'active') return matchesSearch && !!user.activeSubscription && !user.is_listing_blocked;
    if (filter === 'no_plan') return matchesSearch && user.is_seller && !user.activeSubscription;
    return matchesSearch;
  });

  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const allPayments = payments || [];

  return (
    <AdminLayout>
      <div className="space-y-4 w-full max-w-full overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestionare Utilizatori & Abonamente
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Utilizatori</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {users?.filter(u => u.is_seller).length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Vânzători</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users?.filter(u => u.activeSubscription && !u.activeSubscription.trial_plan).length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Plătiți</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {users?.filter(u => u.is_listing_blocked || u.is_suspended).length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Blocați / Suspendați</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {pendingPayments.length}
            </div>
            <div className="text-xs text-muted-foreground">Plăți în Așteptare</div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" /> Utilizatori
            </TabsTrigger>
            <TabsTrigger value="top10" className="gap-1">
              <Trophy className="h-4 w-4" /> Top 10
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1 relative">
              <BanknoteIcon className="h-4 w-4" /> Plăți
              {pendingPayments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingPayments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bank-settings" className="gap-1">
              <CreditCard className="h-4 w-4" /> Cont Bancar
            </TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Caută după nume, ID, short_id..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrează" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toți</SelectItem>
                      <SelectItem value="sellers">Vânzători</SelectItem>
                      <SelectItem value="buyers">Cumpărători</SelectItem>
                      <SelectItem value="active">Cu Abonament</SelectItem>
                      <SelectItem value="no_plan">Fără Plan</SelectItem>
                      <SelectItem value="verified">Verificați ✔️</SelectItem>
                      <SelectItem value="blocked">Blocați</SelectItem>
                      <SelectItem value="suspended">Suspendați</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Utilizator</TableHead>
                          <TableHead className="text-xs">ID</TableHead>
                          <TableHead className="text-xs">Tip</TableHead>
                          <TableHead className="text-xs">Abonament</TableHead>
                          <TableHead className="text-xs">Verificat</TableHead>
                          <TableHead className="text-xs">Blocare</TableHead>
                          <TableHead className="text-xs">Acțiuni</TableHead>
                          <TableHead className="text-xs">Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => {
                          const sub = user.activeSubscription;
                          const isTop10 = top10Ids.has(user.user_id);
                          return (
                            <TableRow key={user.user_id} className={user.is_suspended ? 'opacity-50 bg-destructive/5' : ''}>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">{user.display_name?.[0] || '?'}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium truncate max-w-[100px]">{user.display_name || 'Anonim'}</span>
                                      {user.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                                      {isTop10 && <Trophy className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                                    </div>
                                    {user.store_name && (
                                      <span className="text-[10px] text-muted-foreground truncate block">{user.store_name}</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <code className="text-[10px] bg-muted px-1 py-0.5 rounded">#{user.short_id || user.user_id?.slice(0, 6)}</code>
                              </TableCell>
                              <TableCell className="py-2">
                                {user.is_seller ? (
                                  <Badge variant="default" className="text-[10px]">Vânzător</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px]">Cumpărător</Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                {sub ? (
                                  <Badge variant={sub.trial_plan ? 'outline' : 'default'} className="text-[10px]">
                                    {sub.plan_name}
                                  </Badge>
                                ) : user.is_seller ? (
                                  <Badge variant="destructive" className="text-[10px]">Fără Plan</Badge>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <Switch
                                  checked={!!user.is_verified}
                                  onCheckedChange={(checked) => verifyMutation.mutate({ userId: user.user_id, verified: checked })}
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                {user.is_seller && (
                                  <Switch
                                    checked={!user.is_listing_blocked}
                                    onCheckedChange={(checked) => toggleBlockMutation.mutate({
                                      userId: user.user_id, field: 'is_listing_blocked', value: !checked,
                                    })}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Trimite Avertisment"
                                    onClick={() => warnMutation.mutate({ userId: user.user_id })}
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant={user.is_suspended ? 'default' : 'ghost'}
                                    className="h-7 w-7"
                                    title={user.is_suspended ? 'Reactivează Cont' : 'Suspendă Cont'}
                                    onClick={() => suspendMutation.mutate({ userId: user.user_id, suspend: !user.is_suspended })}
                                  >
                                    {user.is_suspended ? (
                                      <Unlock className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <Ban className="h-3.5 w-3.5 text-destructive" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                {user.is_seller && (
                                  <Select
                                    onValueChange={(val) => {
                                      const plan = PLANS_FOR_ADMIN.find(p => p.type === val);
                                      if (plan) {
                                        activateSubscriptionMutation.mutate({
                                          userId: user.user_id,
                                          planType: plan.type,
                                          planName: plan.name,
                                          priceRon: plan.price,
                                          maxListings: plan.max,
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[120px] h-7 text-[10px]">
                                      <SelectValue placeholder="Activează" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PLANS_FOR_ADMIN.map(plan => (
                                        <SelectItem key={plan.type} value={plan.type} className="text-xs">
                                          {plan.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredUsers?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              Niciun utilizator găsit
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOP 10 TAB */}
          <TabsContent value="top10" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top 10 Vânzători — Bifă Automată
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cei mai buni vânzători primesc automat bifa de verificare. Poți activa/dezactiva manual.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Vânzător</TableHead>
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">Vânzări</TableHead>
                        <TableHead className="text-xs">Rating</TableHead>
                        <TableHead className="text-xs">Verificat</TableHead>
                        <TableHead className="text-xs">Acțiune</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(top10 || []).map((seller, idx) => (
                        <TableRow key={seller.user_id}>
                          <TableCell className="py-2 font-bold text-amber-600">#{idx + 1}</TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={seller.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">{seller.display_name?.[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium">{seller.display_name || seller.username || 'Anonim'}</span>
                                  {seller.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                                </div>
                                {seller.store_name && <span className="text-[10px] text-muted-foreground">{seller.store_name}</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <code className="text-[10px] bg-muted px-1 py-0.5 rounded">#{seller.short_id || seller.user_id?.slice(0, 6)}</code>
                          </TableCell>
                          <TableCell className="py-2 font-semibold">{seller.total_sales_count || 0}</TableCell>
                          <TableCell className="py-2">⭐ {(seller.average_rating || 0).toFixed(1)}</TableCell>
                          <TableCell className="py-2">
                            <Switch
                              checked={!!seller.is_verified}
                              onCheckedChange={(checked) => verifyMutation.mutate({ userId: seller.user_id, verified: checked })}
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            {!seller.is_verified && (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => verifyMutation.mutate({ userId: seller.user_id, verified: true })}
                              >
                                <ShieldCheck className="h-3 w-3" /> Acordă Bifă
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!top10 || top10.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Niciun vânzător cu vânzări încă
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {paymentsLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : allPayments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <BanknoteIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Nicio cerere de plată încă</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Vânzător</TableHead>
                          <TableHead className="text-xs">Plan</TableHead>
                          <TableHead className="text-xs">Sumă</TableHead>
                          <TableHead className="text-xs">Data</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPayments.map((payment) => (
                          <TableRow key={payment.id} className={payment.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={payment.profile?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">{payment.profile?.display_name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{payment.profile?.display_name || 'Anonim'}</p>
                                  <code className="text-[9px] text-muted-foreground">#{payment.profile?.short_id || payment.user_id?.slice(0, 8)}</code>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="outline" className="text-[10px]">{payment.plan_name}</Badge>
                            </TableCell>
                            <TableCell className="py-2 font-semibold text-sm">
                              {payment.amount_ron} LEI
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm', { locale: ro })}
                            </TableCell>
                            <TableCell className="py-2">
                              {payment.status === 'pending' && (
                                <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700">
                                  <Clock className="h-3 w-3 mr-1" /> În așteptare
                                </Badge>
                              )}
                              {payment.status === 'confirmed' && (
                                <Badge variant="default" className="text-[10px] bg-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmat
                                </Badge>
                              )}
                              {payment.status === 'rejected' && (
                                <Badge variant="destructive" className="text-[10px]">
                                  <XCircle className="h-3 w-3 mr-1" /> Respins
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              {payment.status === 'pending' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-xs gap-1"
                                    disabled={confirmPaymentMutation.isPending}
                                    onClick={() => {
                                      const plan = PLANS_FOR_ADMIN.find(p => p.type === payment.plan_type);
                                      confirmPaymentMutation.mutate({
                                        paymentId: payment.id,
                                        userId: payment.user_id,
                                        planType: payment.plan_type,
                                        planName: payment.plan_name,
                                        priceRon: payment.amount_ron,
                                        maxListings: plan?.max ?? null,
                                      });
                                    }}
                                  >
                                    <CheckCircle2 className="h-3 w-3" /> Confirmă
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs gap-1"
                                    disabled={rejectPaymentMutation.isPending}
                                    onClick={() => rejectPaymentMutation.mutate({
                                      paymentId: payment.id,
                                      userId: payment.user_id,
                                    })}
                                  >
                                    <XCircle className="h-3 w-3" /> Respinge
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BANK SETTINGS TAB */}
          <TabsContent value="bank-settings" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Date Bancare pentru Abonamente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aceste date sunt afișate vânzătorilor când aleg să plătească un abonament prin transfer bancar.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Numele Beneficiarului</label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="ex: John Smith" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">IBAN</label>
                    <Input value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="ex: GB29 NWBK 6016 1331 9268 19" className="font-mono" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bancă</label>
                    <Input value={bankInstitution} onChange={(e) => setBankInstitution(e.target.value)} placeholder="ex: NatWest / Barclays / Monzo" />
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  disabled={saveBankSettingsMutation.isPending}
                  onClick={() => saveBankSettingsMutation.mutate()}
                >
                  <Save className="h-4 w-4" />
                  {saveBankSettingsMutation.isPending ? 'Se salvează...' : 'Salvează Datele Bancare'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
