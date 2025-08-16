'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  HiXMark,
  HiStar,
  HiOutlineStar,
  HiUser,
  HiCalendar,
  HiChatBubbleBottomCenter,
} from 'react-icons/hi2';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { reviewsService } from '@/app/services/reviews';
import { Review } from '@/app/types/reviews';
import { toastService } from '@/app/utils/toast';
import { formatDate } from '@/app/utils/helpers';
import Textarea from '@/app/components/ui/textarea';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userImage?: string;
}

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

// Review display component
export const ReviewsModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  userImage,
}: ReviewsModalProps) => {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const response = await reviewsService.getUserReviews(
        userId,
        { page: currentPage, limit: 10 },
        session.accessToken
      );

      if (response.success && response.data) {
        setReviews(response.data.reviews);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error: any) {
      toastService.error(error.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, userId, currentPage, t]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, fetchReviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <HiStar key={star} className="w-5 h-5 text-yellow-500" />
          ) : (
            <HiOutlineStar key={star} className="w-5 h-5 text-gray-300" />
          )
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <HiUser className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t('modal.title', { name: userName })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('modal.subtitle')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <HiXMark className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <HiChatBubbleBottomCenter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-muted/30 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {review.reviewer.profilePicture ? (
                        <Image
                          src={review.reviewer.profilePicture}
                          alt={review.reviewer.fullName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiUser className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {review.reviewer.fullName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HiCalendar className="w-4 h-4" />
                            {formatDate(review.createdAt, locale)}
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>

                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">
                          {t('job')}: {review.job}
                        </p>
                      </div>

                      <p className="text-foreground">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('pagination.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('pagination.pageInfo', {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              {t('pagination.next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Create review modal component
export const CreateReviewModal = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}: CreateReviewModalProps) => {
  const t = useTranslations('reviews');
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.accessToken || rating === 0 || !comment.trim()) {
      toastService.error(t('errors.validation'));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reviewsService.createReview(
        {
          jobId,
          rating,
          comment: comment.trim(),
        },
        session.accessToken
      );

      if (response.success) {
        toastService.success(t('success.created'));
        onClose();
        setRating(0);
        setComment('');
      } else {
        toastService.error(response.message || t('errors.createFailed'));
      }
    } catch (error: any) {
      toastService.error(error.message || t('errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {t('create.title')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <HiXMark className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('create.job')}:
              </p>
              <p className="font-medium text-foreground">{jobTitle}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('create.rating')}
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    {star <= (hoveredStar || rating) ? (
                      <HiStar className="w-8 h-8 text-yellow-500" />
                    ) : (
                      <HiOutlineStar className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('create.comment')}
              </label>
              <Textarea
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setComment(e.target.value)
                }
                placeholder={t('create.commentPlaceholder')}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/1000
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              {t('create.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || !comment.trim() || isSubmitting}
              isLoading={isSubmitting}
              loadingText={t('create.submitting')}
            >
              {t('create.submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
