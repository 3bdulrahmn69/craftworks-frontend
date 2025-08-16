'use client';

import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/app/services/user';
import { getServiceName } from '@/app/services/services';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineGlobe,
  HiOutlineBriefcase,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';
import Image from 'next/image';
import BackButton from '@/app/components/ui/back-button';
import ImageModal from '@/app/components/ui/image-modal';
import { User } from '@/app/types/user';
import Container from '@/app/components/ui/container';
import { ReviewsSection } from '@/app/components/ui/reviews-section';

const UserDetails = () => {
  const { data: session } = useSession();
  const { userId } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('userProfile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !session?.accessToken) return;
      setLoading(true);
      try {
        const userDetails = await userService.getPublicUser(
          userId as string,
          session.accessToken
        );
        setUser(userDetails);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, session?.accessToken]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineUser className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t('notFound.title')}
          </h3>
          <p className="text-muted-foreground mb-4">{t('notFound.message')}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('notFound.button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <Container className="px-4 sm:px-6">
        {/* Back Button */}
        <BackButton showLabel className="mb-8" />

        <div className="">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
            {/* Header */}
            <div className="h-28 bg-gradient-to-r from-primary/10 via-background/20 to-background relative">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:120px_120px] opacity-10" />
            </div>

            {/* Profile Info */}
            <div className="relative px-6 py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-card shadow-xl group-hover:shadow-2xl transition-all">
                    {user.profilePicture ? (
                      <Image
                        width={144}
                        height={144}
                        src={user.profilePicture}
                        alt={`${user.fullName}'s profile`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center text-5xl font-bold text-muted-foreground">
                        {user.fullName?.[0] || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Verification Badge */}
                  {user.role === 'craftsman' &&
                    user.verificationStatus === 'verified' && (
                      <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg z-10">
                        <HiOutlineBadgeCheck className="h-6 w-6" />
                      </div>
                    )}
                </div>

                {/* Name and Meta Info */}
                <div className="flex-1 sm:mb-6">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
                    {user.fullName}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    {user.address && (
                      <span className="inline-flex items-center gap-1.5 text-sm bg-muted px-3 py-1.5 rounded-full">
                        <HiOutlineLocationMarker className="h-4 w-4" />
                        {user.address.city}, {user.address.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {user.rating && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-5 py-3 rounded-xl border border-primary/20">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(user.rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-base font-bold text-foreground">
                      {user.rating}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({user.ratingCount} {t('fields.reviews')})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            {/* Contact Info */}
            <DetailSection
              icon={<HiOutlineUser />}
              title={t('sections.contact')}
            >
              <DetailCard
                icon={<HiOutlineMail />}
                title={t('fields.email')}
                value={user.email}
              />
              <DetailCard
                icon={<HiOutlinePhone />}
                title={t('fields.phone')}
                value={user.phone || t('status.notProvided')}
              />
              <DetailCard
                icon={<HiOutlineCalendar />}
                title={t('fields.memberSince')}
                value={formatDate(user.createdAt)}
              />
            </DetailSection>

            {/* Additional Info */}
            <DetailSection
              icon={<HiOutlineBriefcase />}
              title={t('sections.additional')}
            >
              {user.bio && (
                <DetailCard
                  icon={<HiOutlineUser />}
                  title={t('fields.about')}
                  value={user.bio}
                />
              )}

              {user.address && (
                <DetailCard
                  icon={<HiOutlineLocationMarker />}
                  title={t('fields.address')}
                  value={
                    <div className="space-y-1.5">
                      {user.address.street && <div>{user.address.street}</div>}
                      {user.address.city && (
                        <div>
                          {user.address.city}, {user.address.state}
                        </div>
                      )}
                      {user.address.country && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-border/20 mt-2">
                          <HiOutlineGlobe className="h-4 w-4 text-muted-foreground" />
                          <span>{user.address.country}</span>
                        </div>
                      )}
                    </div>
                  }
                />
              )}

              {user.role === 'craftsman' && user.service && (
                <div className="bg-gradient-to-br from-card to-card/80 p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-3 text-lg">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <HiOutlineBadgeCheck className="h-5 w-5 text-primary" />
                    </div>
                    {t('craftsman.service')}
                  </h3>

                  <div className="border-l-2 border-primary pl-4 py-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t('fields.service')}
                    </h4>
                    <p className="text-foreground font-bold text-lg">
                      {getServiceName(user.service, locale)}
                    </p>
                  </div>
                </div>
              )}
            </DetailSection>
          </div>

          {/* Portfolio Images for craftsmen */}
          {user.role === 'craftsman' &&
            user.portfolioImageUrls &&
            user.portfolioImageUrls.length > 0 && (
              <div className="mt-10 bg-card border border-border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="px-6 sm:px-8 py-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <HiOutlineBriefcase className="h-6 w-6 text-primary" />
                    </div>
                    {t('craftsman.portfolio')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {user.portfolioImageUrls.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden bg-muted border border-border hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        onClick={() => {
                          setSelectedImages(user.portfolioImageUrls || []);
                          setSelectedImageIndex(index);
                          setShowImageModal(true);
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Portfolio work ${index + 1} by ${
                            user.fullName
                          }`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                            <p className="text-xs font-medium text-gray-800">
                              {t('craftsman.workLabel')}
                              {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Reviews Section */}
          <div className="mt-10">
            <ReviewsSection
              userId={user.id}
              userName={user.fullName}
              showTitle={true}
              maxReviews={20}
            />
          </div>
        </div>
      </Container>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setShowImageModal(false)}
      />
    </div>
  );
};

// Detail Card
const DetailCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-4 bg-card p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
    <div className="bg-primary/10 p-3 rounded-lg text-primary mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="text-foreground font-medium text-base">{value}</div>
    </div>
  </div>
);

// Detail Section Wrapper
const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-1 border-b border-border/50">
      {icon}
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

export default UserDetails;
