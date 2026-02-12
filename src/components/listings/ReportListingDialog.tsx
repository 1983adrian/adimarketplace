import React, { useState } from 'react';
import { Flag, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ReportListingDialogProps {
  listingId: string;
  listingTitle: string;
  children?: React.ReactNode;
}

const REPORT_REASONS = [
  { value: 'fake_listing', label: 'Anunț fals sau înșelător' },
  { value: 'prohibited_item', label: 'Produs interzis' },
  { value: 'counterfeit', label: 'Produs contrafăcut' },
  { value: 'wrong_category', label: 'Categorie greșită' },
  { value: 'offensive_content', label: 'Conținut ofensator' },
  { value: 'scam', label: 'Tentativă de înșelătorie' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Alt motiv' },
];

export const ReportListingDialog: React.FC<ReportListingDialogProps> = ({
  listingId,
  listingTitle,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Autentificare necesară',
        description: 'Te rugăm să te autentifici pentru a raporta un anunț.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!reason) {
      toast({
        title: 'Selectează motivul',
        description: 'Te rugăm să selectezi un motiv pentru raportare.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reasonLabel = REPORT_REASONS.find(r => r.value === reason)?.label || reason;
      
      const { error } = await supabase
        .from('listing_reports')
        .insert({
          listing_id: listingId,
          reporter_id: user.id,
          reason: reasonLabel,
          description: description || null,
          status: 'pending',
        });

      if (error) throw error;

      // Notify all admins about the report
      const { data: adminEmails } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('is_active', true);

      if (adminEmails && adminEmails.length > 0) {
        // Get admin user IDs from user_roles
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles) {
          const adminNotifications = adminRoles.map(admin => ({
            user_id: admin.user_id,
            type: 'listing_report',
            title: '🚩 Anunț Raportat',
            message: `Anunțul "${listingTitle}" a fost raportat: ${reasonLabel}`,
            data: { listing_id: listingId, reason: reasonLabel },
          }));

          await supabase.from('notifications').insert(adminNotifications);
        }
      }

      toast({
        title: 'Raport trimis!',
        description: 'Îți mulțumim. Echipa noastră va analiza raportul tău.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu am putut trimite raportul. Încearcă din nou.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4" />
            Semnalează
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Raportează Anunțul
          </DialogTitle>
          <DialogDescription>
            Semnalează anunțul "{listingTitle}" dacă consideri că încalcă regulile platformei.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Motivul raportării *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează motivul" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descriere (opțional)</Label>
            <Textarea
              placeholder="Adaugă detalii suplimentare despre problema identificată..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Anulează
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se trimite...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Trimite Raportul
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingDialog;
