import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { useCreateReview } from '@/hooks/useReviews';

interface ReviewFormProps {
  orderId: string;
  sellerId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ orderId, sellerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    createReview.mutate(
      {
        orderId,
        reviewedUserId: sellerId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRating(0);
          setComment('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Rating</Label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>
      <div>
        <Label htmlFor="comment">Your Review (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this seller..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={rating === 0 || createReview.isPending}>
        {createReview.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
