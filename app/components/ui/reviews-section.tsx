'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { reviewsService } from '@/app/services/reviews';
import { Review } from '@/app/types/reviews';
import { HiStar, HiUser, HiCalendar } from 'react-icons/hi2';
import Image from 'next/image';
import { formatRelativeTime } from '@/app/utils/helpers';

interface ReviewsSectionProps {
  userId: string;
  userName: string;
  showTitle?: boolean;
  maxReviews?: number;
}

export const ReviewsSection = ({
  userId,
  userName,
  showTitle = true,
  maxReviews = 20,
}: ReviewsSectionProps) => {
  const { data: session } = useSession();
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await reviewsService.getLastUserReviews(
          userId,
          session?.accessToken
        );

        if (response.success && response.data.reviews) {
          setReviews(response.data.reviews.slice(0, maxReviews));
        } else {
          setError(t('errors.loadFailed'));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(t('errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId, session?.accessToken, maxReviews, t]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-destructive text-sm mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline text-sm"
          >
            {t('actions.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center py-8">
          <HiStar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('empty.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('empty.message', { userName })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <HiStar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {t('title')} ({reviews.length})
          </h3>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length >= maxReviews && (
        <div className="mt-6 pt-4 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            {t('showing', { count: maxReviews })}
          </p>
        </div>
      )}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="bg-gradient-to-br from-muted/20 to-muted/10 border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4">
        {/* Reviewer Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors">
            {review.reviewer.profilePicture ? (
              <Image
                src={review.reviewer.profilePicture}
                alt={`${review.reviewer.fullName}'s profile`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
                <HiUser className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="font-semibold text-foreground text-lg">
              {review.reviewer.fullName}
            </h4>
          </div>

          {/* Rating - Stars Only */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <HiStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="bg-background/50 border border-border/30 rounded-xl p-4 mb-4">
              <p className="text-foreground/90 text-sm leading-relaxed italic">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="bg-muted/50 p-2 rounded-lg">
              <HiCalendar className="w-3 h-3" />
            </div>
            <span className="font-medium">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
