import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './StarRating';
import { format } from 'date-fns';
import { Review } from '@/hooks/useReviews';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const reviewerName = review.reviewer_profile?.display_name 
    || review.reviewer_profile?.username 
    || 'Anonymous';

  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.reviewer_profile?.avatar_url || undefined} />
          <AvatarFallback>
            {reviewerName[0]?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{reviewerName}</p>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          {review.comment && (
            <p className="mt-2 text-muted-foreground">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};
