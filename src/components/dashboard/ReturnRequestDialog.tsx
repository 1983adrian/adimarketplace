import React, { useState } from 'react';
import { RotateCcw, MapPin, Loader2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateReturn, useSellerReturnAddress } from '@/hooks/useReturns';

interface ReturnRequestDialogProps {
  orderId: string;
  buyerId: string;
  sellerId: string;
  productTitle: string;
  children?: React.ReactNode;
}

const RETURN_REASONS = [
  { value: 'defect', label: 'Produs defect' },
  { value: 'wrong_item', label: 'Produs greșit primit' },
  { value: 'not_as_described', label: 'Nu corespunde descrierii' },
  { value: 'damaged', label: 'Deteriorat în transport' },
  { value: 'changed_mind', label: 'M-am răzgândit' },
  { value: 'other', label: 'Alt motiv' },
];

export const ReturnRequestDialog: React.FC<ReturnRequestDialogProps> = ({
  orderId,
  buyerId,
  sellerId,
  productTitle,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const createReturn = useCreateReturn();
  
  // Get seller's return address
  const { data: sellerAddress, isLoading: addressLoading } = useSellerReturnAddress(
    open ? sellerId : undefined
  );

  const handleSubmit = async () => {
    if (!reason) return;
    
    await createReturn.mutateAsync({
      orderId,
      buyerId,
      sellerId,
      reason: RETURN_REASONS.find(r => r.value === reason)?.label || reason,
      description: description || undefined,
    });
    
    setOpen(false);
    setReason('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Solicită Retur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cerere de Retur</DialogTitle>
          <DialogDescription>
            Solicită returnarea produsului: {productTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Seller's return address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresa de retur a vânzătorului
            </Label>
            {addressLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Se încarcă adresa...
              </div>
            ) : sellerAddress ? (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>{sellerAddress.first_name} {sellerAddress.last_name}</strong><br />
                  {sellerAddress.address}
                  {sellerAddress.apartment && `, ${sellerAddress.apartment}`}<br />
                  {sellerAddress.city}, {sellerAddress.postal_code}<br />
                  {sellerAddress.country}
                  {sellerAddress.phone && (
                    <>
                      <br />
                      <span className="text-muted-foreground">Tel: {sellerAddress.phone}</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  Vânzătorul nu are o adresă de retur configurată. 
                  Te rugăm să-l contactezi direct prin mesaje.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label>Motivul returului</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează motivul" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
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
              placeholder="Descrie problema în detaliu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Alert>
            <AlertDescription className="text-sm text-muted-foreground">
              După aprobarea returului, vei primi instrucțiuni să adaugi numărul AWB 
              al coletului trimis înapoi către vânzător.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || createReturn.isPending}
          >
            {createReturn.isPending ? 'Se trimite...' : 'Trimite Cererea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestDialog;
