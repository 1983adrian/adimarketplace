import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, Crown, Gavel, Loader2, ShieldCheck, Star, Camera, BanknoteIcon, CheckCircle2, User, Briefcase, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SELLER_PLANS,
  BIDDER_PLAN,
  useActiveSellerPlan,
  useActiveBidderPlan,
  SellerPlan,
} from '@/hooks/useUserSubscription';

const SellerPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: activePlan, isLoading: planLoading } = useActiveSellerPlan();
  const { data: bidderPlan, isLoading: bidderLoading } = useActiveBidderPlan();
  const [selectedPlan, setSelectedPlan] = useState<SellerPlan | typeof BIDDER_PLAN | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);


  const createPaymentRequest = useMutation({
    mutationFn: async (plan: SellerPlan | typeof BIDDER_PLAN) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // Create payment request in subscription_payments
      const { data, error } = await supabase
        .from('subscription_payments')
        .insert({
          user_id: user.id,
          plan_type: plan.plan_type,
          plan_name: plan.plan_name,
          amount_ron: plan.price_ron,
          max_listings: 'max_listings' in plan ? plan.max_listings : null,
          status: 'pending',
          payment_method: 'bank_transfer',
        })
        .select()
        .single();

      if (error) throw error;

      // Notify admins in-app
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const notifications = adminRoles.map(r => ({
          user_id: r.user_id,
          type: 'admin_payment',
          title: '💰 Cerere Plată Abonament',
          message: `${user.email} a solicitat activarea planului ${plan.plan_name} (${plan.price_ron} LEI). Verifică transferul bancar și confirmă.`,
          data: { payment_id: data.id, plan_type: plan.plan_type } as any,
        }));
        await supabase.from('notifications').insert(notifications);
      }

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'email',
            to: 'adrianchirita01@gmail.com',
            subject: `💰 Cerere Plată: ${plan.plan_name} - ${plan.price_ron} LEI`,
            message: `
              <h2>Cerere Nouă de Plată Abonament</h2>
              <p><strong>Utilizator:</strong> ${user.email}</p>
              <p><strong>Plan solicitat:</strong> ${plan.plan_name}</p>
              <p><strong>Suma:</strong> ${plan.price_ron} LEI</p>
              <p><strong>Metoda:</strong> Transfer Bancar</p>
              <p><strong>Data:</strong> ${new Date().toLocaleString('ro-RO')}</p>
              <hr/>
              <p>Verifică transferul bancar și confirmă activarea din panoul de administrare.</p>
            `,
          },
        });
      } catch (emailErr) {
        console.warn('Email notification failed:', emailErr);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-payments'] });
      toast({
        title: '✅ Cerere trimisă!',
        description: 'Transferă suma indicată. Abonamentul se activează după confirmarea plății de către admin.',
      });
      setShowPayDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });

  const handleSelectPlan = (plan: SellerPlan | typeof BIDDER_PLAN) => {
    setSelectedPlan(plan);
    setShowPayDialog(true);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Autentificare necesară</h1>
          <Button onClick={() => navigate('/login')}>Conectează-te</Button>
        </div>
      </Layout>
    );
  }

  if (planLoading || bidderLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'start': return 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20';
      case 'licitatii': return 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20';
      case 'silver': return 'border-gray-400/50 bg-gray-50/50 dark:bg-gray-950/20';
      case 'gold': return 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'platinum': return 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20';
      case 'vip': return 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30';
      default: return '';
    }
  };


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Planuri Vânzători</h1>
          <p className="text-muted-foreground">Alege planul potrivit pentru activitatea ta</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Maxim 3 poze per produs pentru toate planurile</span>
          </div>
        </div>

        {/* Info Tip Vânzător */}
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Tip de activitate</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            <div className="flex items-start gap-2 mt-1">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span><strong>Vânzător Ocazional</strong> (Plan START / LICITAȚII) — Vinzi obiecte personale ocazional. <strong>PayPal Personal</strong> este suficient.</span>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span><strong>Vânzător Comercial</strong> (SILVER, GOLD, PLATINUM, VIP) — Activitate comercială regulată. <strong>PayPal Business obligatoriu</strong> conform regulilor PayPal.</span>
            </div>
          </AlertDescription>
        </Alert>

        {activePlan && (
          <Alert className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Planul tău activ: <strong>{activePlan.plan_name}</strong> — 
              {activePlan.max_listings ? ` Max ${activePlan.max_listings} listări` : ' Listări NELIMITATE'}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Info */}
        <Alert className="mb-6 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
          <BanknoteIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Plata prin Wise</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            Alege planul dorit → Plătește prin link-ul Wise → Adminul confirmă plata → Abonamentul se activează automat.
          </AlertDescription>
        </Alert>

        {/* Trial Info */}
        <Alert className="mb-6 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Trial Gratuit 30 Zile</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
            Vânzătorii noi beneficiază de <strong>30 de zile gratuite</strong> cu max <strong>10 produse</strong>. 
            După expirarea perioadei de trial, alege un plan plătit pentru a continua.
          </AlertDescription>
        </Alert>

        {/* Seller Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SELLER_PLANS.map((plan) => {
            const isActive = activePlan?.plan_type === plan.plan_type;
            const isCommercial = !['start', 'licitatii'].includes(plan.plan_type);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all hover:shadow-lg ${getPlanColor(plan.plan_type)} ${
                  isActive ? 'ring-2 ring-primary' : ''
                } ${plan.plan_type === 'vip' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {isActive && (
                  <Badge className="absolute -top-2 right-4 bg-primary">Plan Activ</Badge>
                )}
                {plan.plan_type === 'vip' && (
                  <Badge className="absolute -top-2 left-4 bg-amber-500">
                    <Crown className="h-3 w-3 mr-1" /> Recomandat
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{plan.icon}</span>
                    <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{plan.price_ron}</span>
                    <span className="text-muted-foreground ml-1">LEI</span>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {plan.max_listings ? `Max ${plan.max_listings} listări/unități` : 'Listări NELIMITATE'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      Max 3 poze per listare
                    </li>
                    {plan.is_auction_plan && (
                      <li className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        Plan special pentru licitații
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isCommercial ? (
                        <><Briefcase className="h-3 w-3 flex-shrink-0" /> PayPal Business obligatoriu</>
                      ) : (
                        <><User className="h-3 w-3 flex-shrink-0" /> PayPal Personal suficient</>
                      )}
                    </li>
                  </ul>

                  <Button
                    className="w-full"
                    variant={isActive ? 'outline' : 'default'}
                    disabled={isActive}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isActive ? '✓ Plan Activ' : 'Plătește Acum'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-8" />

        {/* Bidder Plan */}
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <Gavel className="h-6 w-6" /> Plan Cumpărător
          </h2>
          <Card className={`border-2 ${bidderPlan ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'}`}>
            {bidderPlan && <Badge className="absolute -top-2 right-4 bg-green-500">Activ</Badge>}
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{BIDDER_PLAN.icon}</span>
                <CardTitle>{BIDDER_PLAN.plan_name}</CardTitle>
              </div>
              <CardDescription>{BIDDER_PLAN.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">{BIDDER_PLAN.price_ron}</span>
                <span className="text-muted-foreground ml-1">LEI</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" /> Licitează la orice produs listat
                </li>
              </ul>
              <Button
                className="w-full"
                variant={bidderPlan ? 'outline' : 'default'}
                disabled={!!bidderPlan}
                onClick={() => handleSelectPlan(BIDDER_PLAN)}
              >
                {bidderPlan ? '✓ Abonament Activ' : 'Plătește Acum'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Blue Checkmark Info */}
        <div className="mt-8 text-center">
          <Separator className="mb-6" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Bifa Albastră ✓</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Acordată automat doar pentru <strong>TOP 10 Cei Mai Mari Vânzători</strong>.
          </p>
        </div>
      </div>

      {/* Payment Dialog with Wise */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BanknoteIcon className="h-5 w-5 text-green-600" />
              Plătește prin Wise
            </DialogTitle>
            <DialogDescription>
              Plătește prin link-ul Wise de mai jos. Abonamentul se activează după confirmarea plății.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              {/* Plan Summary */}
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Plan selectat</p>
                <p className="text-lg font-bold">{selectedPlan.plan_name}</p>
                <p className="text-3xl font-bold text-primary mt-1">{selectedPlan.price_ron} LEI</p>
              </div>

              {/* Wise Payment Button */}
              <div className="rounded-lg border-2 border-green-500/40 bg-green-50/50 dark:bg-green-950/20 p-4 text-center space-y-2">
                <h4 className="font-semibold text-sm">⚡ Plată Rapidă prin Wise</h4>
                <p className="text-xs text-muted-foreground">Plătește instant prin link-ul Wise — cel mai rapid mod!</p>
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open(`https://wise.com/pay/me/adrianc1425`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Plătește {selectedPlan.price_ron} LEI prin Wise
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  La mesajul plății, scrie: <strong>{user?.email}</strong> + <strong>{selectedPlan.plan_name}</strong>
                </p>
              </div>

              <Alert className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/10">
                <AlertDescription className="text-xs">
                  ⚠️ După plată, apasă butonul de mai jos pentru a trimite cererea de activare.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              className="w-full gap-2"
              disabled={createPaymentRequest.isPending}
              onClick={() => selectedPlan && createPaymentRequest.mutate(selectedPlan)}
            >
              {createPaymentRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Am transferat — Trimite Cererea
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowPayDialog(false)}>
              Anulează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SellerPlans;
