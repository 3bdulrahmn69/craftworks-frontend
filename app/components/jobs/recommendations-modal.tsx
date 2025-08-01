'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Modal from '@/app/components/ui/modal';
import Button from '@/app/components/ui/button';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import { RecommendedCraftsman } from '@/app/types/user';
import { userService } from '@/app/services/user';
import { jobsService } from '@/app/services/jobs';
import { toast } from 'react-toastify';
import { FaUsers, FaStar, FaUserPlus, FaCheckCircle } from 'react-icons/fa';

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  accessToken: string;
}

const RecommendationsModal = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  accessToken,
}: RecommendationsModalProps) => {
  const locale = useLocale();
  const t = useTranslations('myJobs');
  const isRTL = locale === 'ar';

  const [recommendations, setRecommendations] = useState<
    RecommendedCraftsman[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitingCraftsman, setInvitingCraftsman] = useState<string | null>(
    null
  );
  const [invitedCraftsmen, setInvitedCraftsmen] = useState<Set<string>>(
    new Set()
  );

  const fetchRecommendations = useCallback(async () => {
    if (!accessToken || !jobId) return;

    try {
      setLoading(true);
      setError(null);
      const recommendedCraftsmen = await userService.getRecommendations(
        accessToken,
        jobId
      );
      setRecommendations(recommendedCraftsmen);
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      setError(err.message || t('recommendations.error'));
      toast.error(t('recommendations.error'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, jobId, t]);

  const handleInviteCraftsman = async (craftsmanId: string) => {
    if (!accessToken || !jobId) return;

    try {
      setInvitingCraftsman(craftsmanId);
      const response = await jobsService.inviteCraftsman(
        jobId,
        craftsmanId,
        accessToken
      );

      if (response.success) {
        toast.success(
          t('recommendations.inviteSuccess') ||
            'Craftsman invited successfully!'
        );
        setInvitedCraftsmen((prev) => new Set(prev).add(craftsmanId));
      } else {
        throw new Error(response.message || 'Failed to invite craftsman');
      }
    } catch (err: any) {
      console.error('Failed to invite craftsman:', err);
      toast.error(err.message || 'Failed to invite craftsman');
    } finally {
      setInvitingCraftsman(null);
    }
  };

  const handleClose = () => {
    setRecommendations([]);
    setError(null);
    setInvitedCraftsmen(new Set());
    onClose();
  };

  // Trigger fetch when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      fetchRecommendations();
    }
  }, [isOpen, jobId, fetchRecommendations]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('recommendations.title')}
      className="max-w-4xl"
    >
      <div className={`py-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {jobTitle}
          </h3>
          <p className="text-muted-foreground">
            {t('recommendations.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">
              {t('recommendations.loading')}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchRecommendations}>
              {t('buttons.retry')}
            </Button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('recommendations.noRecommendations')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recommendations.map((craftsman) => (
              <div
                key={craftsman._id}
                className={`bg-muted/30 rounded-xl p-6 hover:bg-muted/50 transition-colors border border-border ${
                  isRTL ? 'rtl' : 'ltr'
                }`}
              >
                <div
                  className={`flex items-start gap-4 ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 overflow-hidden shrink-0">
                    {craftsman.profilePicture ? (
                      <Image
                        src={craftsman.profilePicture}
                        alt={craftsman.fullName}
                        width={64}
                        height={64}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaUsers className="text-primary w-8 h-8" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-start justify-between mb-3 ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex items-center gap-2 mb-2 ${
                            isRTL ? 'flex-row-reverse justify-end' : ''
                          }`}
                        >
                          <h4
                            className={`text-lg font-bold text-foreground truncate ${
                              isRTL ? 'text-right' : 'text-left'
                            }`}
                          >
                            {craftsman.fullName}
                          </h4>
                          {craftsman.craftsmanInfo.verificationStatus ===
                            'verified' && (
                            <FaCheckCircle className="text-success w-5 h-5 shrink-0" />
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-2 mb-3 ${
                            isRTL ? 'flex-row-reverse justify-end' : ''
                          }`}
                        >
                          <FaStar className="text-warning w-4 h-4" />
                          <span className="text-sm font-medium text-foreground">
                            {craftsman.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({craftsman.ratingCount}{' '}
                            {t('recommendations.rating')})
                          </span>
                        </div>

                        <div
                          className={`mb-3 ${
                            isRTL ? 'text-right' : 'text-left'
                          }`}
                        >
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {t('recommendations.skills')}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {craftsman.craftsmanInfo.skills
                              .slice(0, 3)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            {craftsman.craftsmanInfo.skills.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{craftsman.craftsmanInfo.skills.length - 3}{' '}
                                more
                              </span>
                            )}
                          </div>
                        </div>

                        {craftsman.craftsmanInfo.bio && (
                          <p
                            className={`text-sm text-muted-foreground line-clamp-2 ${
                              isRTL ? 'text-right' : 'text-left'
                            }`}
                          >
                            {craftsman.craftsmanInfo.bio}
                          </p>
                        )}
                      </div>

                      <div
                        className={`${isRTL ? 'mr-4' : 'ml-4'} flex-shrink-0`}
                      >
                        {invitedCraftsmen.has(craftsman._id) ? (
                          <Button
                            size="sm"
                            disabled
                            className="bg-success hover:bg-success cursor-default"
                          >
                            <FaCheckCircle
                              className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                            />
                            {t('recommendations.invited')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleInviteCraftsman(craftsman._id)}
                            disabled={invitingCraftsman === craftsman._id}
                            className="transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            {invitingCraftsman === craftsman._id ? (
                              <>
                                <LoadingSpinner
                                  size="sm"
                                  className={`${isRTL ? 'ml-2' : 'mr-2'}`}
                                />
                                {t('recommendations.inviting')}
                              </>
                            ) : (
                              <>
                                <FaUserPlus
                                  className={`w-4 h-4 ${
                                    isRTL ? 'ml-2' : 'mr-2'
                                  }`}
                                />
                                {t('recommendations.invite')}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className={`flex justify-end mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Button variant="outline" onClick={handleClose}>
            {t('recommendations.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecommendationsModal;
