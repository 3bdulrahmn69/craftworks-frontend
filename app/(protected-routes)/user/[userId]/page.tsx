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
  HiOutlineBadgeCheck,
  HiArrowLeft,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <HiArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold text-foreground">
              User Profile
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Cover Section */}
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
                <div className="relative">
                  {user.profilePicture ? (
                    <Image
                      width={128}
                      height={128}
                      src={user.profilePicture}
                      alt={`${user.fullName}&apos;s profile`}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-card shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-muted border-4 border-card shadow-lg flex items-center justify-center">
                      <span className="text-4xl font-semibold text-muted-foreground">
                        {user.fullName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  {user.role === 'craftsman' && (
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-xl shadow-lg">
                      <HiOutlineBadgeCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Name and Basic Info */}
                <div className="flex-1 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {user.fullName}
                      </h2>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        {user.role === 'craftsman' && (
                          <>
                            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            <span className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                              <HiOutlineBadgeCheck className="h-4 w-4" />
                              Verified Craftsman
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {user.rating && (
                      <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <HiOutlineStar
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(user.rating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold text-foreground">
                            {user.rating}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            ({user.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Contact Information
              </h3>

              <DetailCard
                icon={<HiOutlineMail className="h-5 w-5" />}
                title="Email"
                value={user.email}
              />

              <DetailCard
                icon={<HiOutlinePhone className="h-5 w-5" />}
                title="Phone"
                value={user.phone || 'Not provided'}
              />

              <DetailCard
                icon={<HiOutlineCalendar className="h-5 w-5" />}
                title="Member Since"
                value={formatDate(user.createdAt)}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Additional Information
              </h3>

              {user.address && (
                <DetailCard
                  icon={<HiOutlineLocationMarker className="h-5 w-5" />}
                  title="Address"
                  value={
                    <div className="space-y-1">
                      {user.address.street && <div>{user.address.street}</div>}
                      {user.address.city && (
                        <div>
                          {user.address.city}, {user.address.state}
                        </div>
                      )}
                      {user.address.country && (
                        <div>{user.address.country}</div>
                      )}
                    </div>
                  }
                />
              )}

              {user.role === 'craftsman' && user.service && (
                <div className="bg-muted/50 p-6 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HiOutlineUser className="h-5 w-5 text-primary" />
                    Craftsmanship Service
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Service
                      </h4>
                      <p className="text-foreground font-medium">
                        {user.service.name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Description
                      </h4>
                      <p className="text-foreground">
                        {user.service.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable detail card component
const DetailCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-4 bg-card p-4 rounded-xl border border-border hover:shadow-sm transition-shadow">
    <div className="bg-primary/10 p-3 rounded-lg text-primary flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      <div className="text-foreground break-words">{value}</div>
    </div>
  </div>
);

export default UserDetails;
