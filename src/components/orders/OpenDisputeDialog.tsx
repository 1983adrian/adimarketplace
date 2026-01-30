import React, { useState } from 'react';
import { AlertTriangle, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const DISPUTE_REASONS = [
  { value: 'not_received', label: 'Produs neprimit' },
  { value: 'not_as_described', label: 'Produs diferit de descriere' },
  { value: 'damaged', label: 'Produs deteriorat' },
  { value: 'counterfeit', label: 'Produs contrafăcut' },
  { value: 'wrong_item', label: 'Produs greșit' },
  { value: 'seller_unresponsive', label: 'Vânzător inactiv' },
  { value: 'other', label: 'Alt motiv' },
];

interface OpenDisputeDialogProps {
  orderId: string;
  sellerId: string;
  buyerId: string;
  children: React.ReactNode;
}

export const OpenDisputeDialog = ({ orderId, sellerId, buyerId, children }: OpenDisputeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setEvidence(files);
    }
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast({ title: 'Selectează motivul', variant: 'destructive' });
      return;
    }
    if (!description || description.length < 20) {
      toast({ title: 'Descriere prea scurtă', description: 'Minim 20 caractere', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload evidence files if any
      let evidenceUrls: string[] = [];
      if (evidence.length > 0) {
        for (const file of evidence) {
          const fileName = `${orderId}/${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from('listings')
            .upload(`disputes/${fileName}`, file);
          
          if (!error && data) {
            const { data: urlData } = supabase.storage
              .from('listings')
              .getPublicUrl(`disputes/${fileName}`);
            evidenceUrls.push(urlData.publicUrl);
          }
        }
      }

      // Create dispute
      const { error } = await supabase
        .from('disputes')
        .insert({
          order_id: orderId,
          reporter_id: buyerId,
          reported_user_id: sellerId,
          reason: DISPUTE_REASONS.find(r => r.value === reason)?.label || reason,
          description,
          status: 'pending',
          admin_notes: evidenceUrls.length > 0 ? `Dovezi: ${evidenceUrls.join(', ')}` : null,
        });

      if (error) throw error;

      // Update order with dispute info
      await supabase
        .from('orders')
        .update({
          dispute_opened_at: new Date().toISOString(),
          dispute_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Create notification for seller
      await supabase.from('notifications').insert({
        user_id: sellerId,
        type: 'dispute_opened',
        title: '⚠️ Dispută Deschisă',
        message: `Un cumpărător a deschis o dispută pentru comanda ta: ${DISPUTE_REASONS.find(r => r.value === reason)?.label}`,
        data: { order_id: orderId },
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });

      toast({ 
        title: 'Dispută deschisă', 
        description: 'Vom analiza cazul tău în 24-48 ore. Vei primi o notificare cu decizia.' 
      });
      setOpen(false);
      setReason('');
      setDescription('');
      setEvidence([]);
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Deschide Dispută
          </DialogTitle>
          <DialogDescription>
            Raportează o problemă cu această comandă. Vom investiga și vom lua o decizie în 24-48 ore.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Protecție Cumpărător:</strong> Banii tăi sunt în siguranță. 
              Nu eliberăm plata către vânzător până la rezolvarea disputei.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Motivul disputei *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează motivul" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrierea problemei * (minim 20 caractere)</Label>
            <Textarea
              placeholder="Descrie în detaliu problema întâmpinată..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/20 caractere
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Dovezi (opțional, max 5 fișiere)
            </Label>
            <Input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {evidence.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {evidence.length} fișier(e) selectat(e)
              </p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
            <p className="font-medium">⏱️ Termene:</p>
            <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
              <li>Analiză inițială: 24-48 ore</li>
              <li>Răspuns vânzător: 3 zile lucrătoare</li>
              <li>Decizie finală: maxim 7 zile</li>
              <li>Rambursare (dacă e cazul): 3-5 zile lucrătoare</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reason || description.length < 20}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se trimite...
              </>
            ) : (
              'Deschide Dispută'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
