import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Gavel, Loader2, ShieldCheck, Star, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  SELLER_PLANS,
  BIDDER_PLAN,
  useActiveSellerPlan,
  useActiveBidderPlan,
  useSubscribeToPlan,
} from '@/hooks/useUserSubscription';

const SellerPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: activePlan, isLoading: planLoading } = useActiveSellerPlan();
  const { data: bidderPlan, isLoading: bidderLoading } = useActiveBidderPlan();
  const subscribeMutation = useSubscribeToPlan();

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
          <p className="text-muted-foreground">Alege planul potrivit pentru afacerea ta</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Maxim 3 poze per produs pentru toate planurile</span>
          </div>
        </div>

        {activePlan && (
          <Alert className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Planul tău activ: <strong>{activePlan.plan_name}</strong> — 
              {activePlan.max_listings ? ` Max ${activePlan.max_listings} listări` : ' Listări NELIMITATE'}
            </AlertDescription>
          </Alert>
        )}

        {/* Seller Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SELLER_PLANS.map((plan) => {
            const isActive = activePlan?.plan_type === plan.plan_type;
            const isUpgrade = activePlan && plan.price_ron > activePlan.price_ron;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all hover:shadow-lg ${getPlanColor(plan.plan_type)} ${
                  isActive ? 'ring-2 ring-primary' : ''
                } ${plan.plan_type === 'vip' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {isActive && (
                  <Badge className="absolute -top-2 right-4 bg-primary">
                    Plan Activ
                  </Badge>
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
                  </ul>

                  <Button
                    className="w-full"
                    variant={isActive ? 'outline' : 'default'}
                    disabled={isActive || subscribeMutation.isPending}
                    onClick={() => subscribeMutation.mutate(plan)}
                  >
                    {subscribeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isActive ? '✓ Plan Activ' : isUpgrade ? 'Upgrade' : 'Alege Planul'}
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
            <Gavel className="h-6 w-6" />
            Plan Cumpărător
          </h2>
          <Card className={`border-2 ${bidderPlan ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'}`}>
            {bidderPlan && (
              <Badge className="absolute -top-2 right-4 bg-green-500">
                Activ
              </Badge>
            )}
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
                  <Check className="h-4 w-4 text-green-600" />
                  Licitează la orice produs listat
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Acces la toate licitațiile active
                </li>
              </ul>
              <Button
                className="w-full"
                variant={bidderPlan ? 'outline' : 'default'}
                disabled={!!bidderPlan || subscribeMutation.isPending}
                onClick={() => subscribeMutation.mutate(BIDDER_PLAN)}
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {bidderPlan ? '✓ Abonament Activ' : 'Activează Abonamentul'}
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
            Acordată automat de sistem doar pentru <strong>TOP 10 Cei Mai Mari Vânzători</strong> 
            (după volumul de listări/vânzări). Nu poate fi cumpărată.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SellerPlans;
