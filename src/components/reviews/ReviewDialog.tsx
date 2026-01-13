import React, { useState } from 'react';
import { Star } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReview, useCanReview } from '@/hooks/useReviews';

interface ReviewDialogProps {
  orderId: string;
  sellerId: string;
  sellerName?: string;
  children: React.ReactNode;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  orderId,
  sellerId,
  sellerName,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: canReview } = useCanReview(orderId, sellerId);
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    await createReview.mutateAsync({
      orderId,
      reviewedUserId: sellerId,
      rating,
      comment: comment.trim() || undefined,
    });
    setOpen(false);
    setRating(5);
    setComment('');
  };

  if (!canReview) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lasă o recenzie</DialogTitle>
          <DialogDescription>
            Spune-ne cum a fost experiența ta cu {sellerName || 'acest vânzător'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && 'Foarte slab'}
              {rating === 2 && 'Slab'}
              {rating === 3 && 'Acceptabil'}
              {rating === 4 && 'Bun'}
              {rating === 5 && 'Excelent'}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentariu (opțional)</Label>
            <Textarea
              id="comment"
              placeholder="Descrie experiența ta cu acest vânzător..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createReview.isPending}
          >
            {createReview.isPending ? 'Se trimite...' : 'Trimite recenzia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
