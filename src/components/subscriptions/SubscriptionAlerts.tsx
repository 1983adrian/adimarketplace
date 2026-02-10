import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Lock, CreditCard } from 'lucide-react';
import { useSellerTrial } from '@/hooks/useSellerTrial';
import { useActiveSellerPlan } from '@/hooks/useUserSubscription';
import { useListingLimit } from '@/hooks/useListingLimit';
import { useAuth } from '@/contexts/AuthContext';

export const SubscriptionAlerts: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: trialStatus } = useSellerTrial();
  const { data: activePlan } = useActiveSellerPlan();
  const { data: listingLimit } = useListingLimit();

  if (!user || !profile?.is_seller) return null;

  const alerts: React.ReactNode[] = [];

  // 1. Blocked - daily alarm
  if (trialStatus?.isListingBlocked) {
    alerts.push(
      <Alert key="blocked" className="border-destructive bg-destructive/10">
        <Lock className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive font-bold">🔒 Cont Blocat</AlertTitle>
        <AlertDescription className="text-destructive/90">
          Butoanele de listare și cumpărare sunt blocate. Alege un abonament pentru a continua.
          <Button asChild size="sm" className="mt-2 w-full" variant="destructive">
            <Link to="/seller-plans">Alege Abonament</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 2. Trial expired, within 72h grace period
  if (trialStatus?.trialExpired && !activePlan && !trialStatus?.isListingBlocked && trialStatus?.hoursUntilBlock !== null && trialStatus.hoursUntilBlock > 0) {
    alerts.push(
      <Alert key="grace" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800 dark:text-orange-200 font-bold">⚠️ Perioada de grație</AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300">
          Trial-ul a expirat! Mai ai <strong>{Math.ceil(trialStatus.hoursUntilBlock)} ore</strong> să alegi un abonament înainte de blocarea automată.
          <Button asChild size="sm" className="mt-2 w-full bg-orange-600 hover:bg-orange-700">
            <Link to="/seller-plans">Plătește Abonament Acum</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 3. 3 days before expiry warning
  if (trialStatus?.shouldWarnExpiry && trialStatus.trialDaysRemaining <= 3) {
    alerts.push(
      <Alert key="expiry-warn" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">⏰ Abonament expiră curând</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Trial-ul tău expiră în <strong>{trialStatus.trialDaysRemaining} zile</strong>. Alege un plan plătit pentru a continua să vinzi.
          <Button asChild size="sm" variant="outline" className="mt-2 w-full border-amber-500 text-amber-700">
            <Link to="/seller-plans">Vezi Planuri</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 4. Low listings remaining (3 or fewer)
  if (listingLimit && !listingLimit.isUnlimited && listingLimit.canCreateMore && listingLimit.remaining !== undefined && listingLimit.remaining <= 3 && listingLimit.remaining > 0) {
    alerts.push(
      <Alert key="low-listings" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CreditCard className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">📦 Aproape de limită</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          Mai poți adăuga doar <strong>{listingLimit.remaining} produse</strong>. Fă upgrade la un plan superior.
          <Button asChild size="sm" variant="outline" className="mt-2 w-full border-yellow-500 text-yellow-700">
            <Link to="/seller-plans">Upgrade Plan</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.length === 0) return null;

  return <div className="space-y-3">{alerts}</div>;
};
