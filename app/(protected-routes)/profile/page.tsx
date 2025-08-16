'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { userService } from '@/app/services/user';
import { getServiceName } from '@/app/services/services';
import { User } from '@/app/types/user';
import { formatAddress } from '@/app/utils/helpers';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import {
  HiUser,
  HiPhone,
  HiMapPin,
  HiStar,
  HiShieldCheck,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { HiMail } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';
import BackButton from '@/app/components/ui/back-button';
import ImageModal from '@/app/components/ui/image-modal';
import { ReviewsModal } from '@/app/components/ui/reviews-modal';
import CompleteProfileBanner from '@/app/components/ui/complete-profile-banner';
import { FaRegEdit } from 'react-icons/fa';
import { ReviewsSection } from '@/app/components/ui/reviews-section';

const ProfilePage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const userData = await userService.getMe(session.accessToken);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken]);

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-20">
        <div role="status" aria-label="Loading profile data">
          <LoadingSpinner />
          <span className="sr-only">{t('loading')}</span>
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="flex items-center justify-center py-20">
        <div className="text-center" role="alert" aria-live="polite">
          <div className="text-destructive text-lg font-medium mb-2">
            {error || t('error')}
          </div>
          <p className="text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-8">
      <nav aria-label="Breadcrumb">
        <BackButton showLabel className="mb-4" />
      </nav>

      <main className="space-y-6" role="main">
        {/* Complete Profile Banner */}
        <CompleteProfileBanner />

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
          </div>
        </header>

        {/* Profile Card */}
        <div className="relative bg-card border border-border rounded-xl shadow-lg">
          <Link
            href="/settings/personal"
            className={`absolute -top-4 ${
              locale === 'ar' ? '-left-4' : '-right-4'
            } z-10 inline-flex items-center justify-center gap-2 w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            aria-label="Edit your profile information"
          >
            <FaRegEdit className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div
            className={`absolute rounded-xl inset-0 ${
              locale === 'ar' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'
            } from-primary/10 via-primary/5 to-secondary/10`}
          />
          {/* Cover Area */}
          <div
            className={`h-32 ${
              locale === 'ar' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'
            } from-primary/10 via-primary/5 to-secondary/10 relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 sm:px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-xl">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={`Profile picture of ${user.fullName}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
                      role="img"
                      aria-label="Default profile picture placeholder"
                    >
                      <HiUser
                        className="w-16 h-16 sm:w-18 sm:h-18 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <section className="space-y-6" aria-labelledby="user-info-heading">
              <h2 id="user-info-heading" className="sr-only">
                {t('sections.userInfo')}
              </h2>

              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {user.fullName}
                  </h3>

                  {/* Verification Badge */}
                  {user.role === 'craftsman' && (
                    <>
                      {user.verificationStatus === 'verified' ? (
                        <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                          <HiShieldCheck className="w-4 h-4" />
                          {t('status.verified')}
                        </div>
                      ) : (
                        <Link
                          href="/settings/verification"
                          className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                          <HiExclamationTriangle className="w-4 h-4" />
                          {t('status.none')}
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-muted-foreground">
                  <span className="text-lg capitalize font-medium">
                    {user.role === 'craftsman'
                      ? t('role.craftsman')
                      : t('role.client')}
                  </span>
                  {user.service && (
                    <>
                      <span className="hidden md:inline" aria-hidden="true">
                        •
                      </span>
                      <span className="text-primary font-medium">
                        {getServiceName(user.service, locale)}
                      </span>
                    </>
                  )}
                </div>

                {/* BIO SECTION */}
                {user.bio && (
                  <div className="mt-4 max-w-2xl">
                    <p
                      className={`text-foreground/90 leading-relaxed ${
                        locale === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {user.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {(user.rating > 0 ||
                user.ratingCount > 0 ||
                user.role === 'craftsman') && (
                <section
                  className="flex items-center justify-center md:justify-start gap-6 py-4 border-y border-border"
                  aria-labelledby="stats-heading"
                >
                  <h4 id="stats-heading" className="sr-only">
                    Profile Statistics
                  </h4>
                  {(user.rating > 0 || user.ratingCount > 0) && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-2xl font-bold text-foreground">
                            {user.rating.toFixed(1)}
                          </span>
                          <HiStar
                            className="w-5 h-5 text-warning fill-current"
                            aria-label="stars"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                      </div>
                      <div className="text-center">
                        <button
                          onClick={() => setShowReviewsModal(true)}
                          className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {user.ratingCount}
                        </button>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                      </div>
                    </>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {new Date(user.createdAt).getFullYear()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Member Since
                    </p>
                  </div>
                </section>
              )}

              {/* Contact Information Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('sections.contact')}
                  </h3>

                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiMail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t('fields.email')}
                      </p>
                      <p className="text-foreground font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiPhone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t('fields.phone')}
                      </p>
                      <p className="text-foreground font-medium">
                        {user.phone || t('status.notProvided')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('sections.address')}
                  </h3>

                  <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiMapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t('fields.address')}
                      </p>
                      <p className="text-foreground font-medium">
                        {formatAddress(user.address)}
                      </p>
                    </div>
                  </div>

                  {(user.rating > 0 || user.ratingCount > 0) && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <HiStar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {t('fields.rating')}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-foreground font-semibold">
                              {user.rating.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <HiStar
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(user.rating)
                                      ? 'text-warning fill-current'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowReviewsModal(true)}
                            className="text-sm text-primary hover:underline"
                          >
                            ({user.ratingCount} {t('fields.reviews')})
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Portfolio Images for craftsmen */}
        {user.role === 'craftsman' &&
          user.portfolioImageUrls &&
          user.portfolioImageUrls.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t('sections.portfolio')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.portfolioImageUrls.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden bg-muted border border-border hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => {
                      setSelectedImages(user.portfolioImageUrls || []);
                      setSelectedImageIndex(index);
                      setShowImageModal(true);
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Portfolio image ${index + 1} by ${user.fullName}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Reviews Section */}
        <ReviewsSection
          userId={user.id}
          userName={user.fullName}
          showTitle={true}
          maxReviews={20}
        />
      </main>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setShowImageModal(false)}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        userId={user.id}
        userName={user.fullName}
        userImage={user.profilePicture}
      />
    </Container>
  );
};

export default ProfilePage;
