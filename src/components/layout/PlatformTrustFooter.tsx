import React from 'react';
import { Shield, Lock, CreditCard, CheckCircle, Users, Package, Award } from 'lucide-react';
import { usePlatformStats } from '@/hooks/usePlatformHealth';

export const PlatformTrustFooter: React.FC = () => {
  const { data: stats } = usePlatformStats();

  const trustBadges = [
    {
      icon: Shield,
      title: 'Protecție Cumpărător',
      description: 'Garanție 14 zile',
      color: 'text-green-500',
    },
    {
      icon: Lock,
      title: 'Plăți Securizate',
      description: 'Criptare SSL',
      color: 'text-blue-500',
    },
    {
      icon: CreditCard,
      title: 'Plăți Verificate',
      description: 'Procesare sigură',
      color: 'text-purple-500',
    },
    {
      icon: CheckCircle,
      title: 'Vânzători Verificați',
      description: 'KYC obligatoriu',
      color: 'text-emerald-500',
    },
  ];

  const platformStats = [
    {
      icon: Users,
      value: stats?.totalUsers ? `${(stats.totalUsers / 1000).toFixed(1)}K+` : '1K+',
      label: 'Utilizatori',
    },
    {
      icon: Package,
      value: stats?.activeListings ? `${stats.activeListings}+` : '100+',
      label: 'Produse Active',
    },
    {
      icon: Award,
      value: stats?.completedOrders ? `${stats.completedOrders}+` : '50+',
      label: 'Tranzacții Reușite',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-muted/30 to-muted/50 border-t">
      {/* Trust Badges */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Platformă 100% Sigură
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cumpără și vinde în siguranță pe MarketPlace România
          </p>
        </div>

        {/* Trust badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center p-4 rounded-xl bg-background/80 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-full bg-muted mb-2`}>
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <p className="font-medium text-sm text-center">{badge.title}</p>
                <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
              </div>
            );
          })}
        </div>

        {/* Platform Statistics */}
        <div className="flex justify-center gap-8 py-4 border-t border-b">
          {platformStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xl text-foreground">{stat.value}</span>
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Securitate Avansată</p>
              <p className="text-xs text-muted-foreground mt-1">
                Toate datele sunt criptate. Folosim cele mai recente standarde de securitate 
                pentru a proteja informațiile tale personale și financiare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
