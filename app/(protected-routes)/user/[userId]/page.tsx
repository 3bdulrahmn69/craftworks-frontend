'use client';

import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/app/services/user';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineStar,
  HiOutlineCalendar,
  HiArrowLeft,
  HiOutlineGlobe,
  HiOutlineBriefcase,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';
import Image from 'next/image';

const UserDetails = () => {
  const { data: session } = useSession();
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="text-muted-foreground">Loading user details...</p>
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
            User not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The user you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="fixed z-20 top-6 left-6 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-full border border-border shadow-lg hover:bg-card transition-all group"
        >
          <HiArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          <span className="text-muted-foreground group-hover:text-foreground">
            Back
          </span>
        </button>

        <div className="pt-20 pb-12">
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
                  {user.role === 'craftsman' && user.isVerified && (
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
                    {user.location && (
                      <span className="inline-flex items-center gap-1.5 text-sm bg-muted px-3 py-1.5 rounded-full">
                        <HiOutlineLocationMarker className="h-4 w-4" />
                        {user.location}
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
                      ({user.ratingCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            {/* Contact Info */}
            <DetailSection icon={<HiOutlineUser />} title="Contact Information">
              <DetailCard
                icon={<HiOutlineMail />}
                title="Email"
                value={user.email}
              />
              <DetailCard
                icon={<HiOutlinePhone />}
                title="Phone"
                value={user.phone || 'Not provided'}
              />
              <DetailCard
                icon={<HiOutlineCalendar />}
                title="Member Since"
                value={formatDate(user.createdAt)}
              />
            </DetailSection>

            {/* Additional Info */}
            <DetailSection
              icon={<HiOutlineBriefcase />}
              title="Additional Information"
            >
              {user.address && (
                <DetailCard
                  icon={<HiOutlineLocationMarker />}
                  title="Address"
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
                    Craftsmanship Service
                  </h3>

                  <div className="border-l-2 border-primary pl-4 py-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Service
                    </h4>
                    <p className="text-foreground font-bold text-lg">
                      {user.service.name}
                    </p>
                  </div>
                </div>
              )}
            </DetailSection>
          </div>
        </div>
      </div>
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
