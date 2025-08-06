'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { userService } from '@/app/services/user';
import { User } from '@/app/types/user';
import { formatAddress } from '@/app/utils/helpers';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import {
  HiUser,
  HiPhone,
  HiMapPin,
  HiStar,
  HiCog,
  HiArrowLeft,
  HiShieldCheck,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { HiMail } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
          <span className="sr-only">Loading your profile information...</span>
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="flex items-center justify-center py-20">
        <div className="text-center" role="alert" aria-live="polite">
          <div className="text-destructive text-lg font-medium mb-2">
            {error || 'Failed to load profile'}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6"
          aria-label="Go back to previous page"
        >
          <HiArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>
      </nav>

      <main className="space-y-6" role="main">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your profile information
            </p>
          </div>
          <Link
            href="/settings/personal"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Edit your profile information"
          >
            <HiCog className="w-4 h-4" aria-hidden="true" />
            Edit Profile
          </Link>
        </header>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Cover Area */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-xl">
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
                        className="w-18 h-18 text-muted-foreground"
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
                User Information
              </h2>

              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-foreground">
                    {user.fullName}
                  </h3>

                  {/* Verification Badge */}
                  {user.role === 'craftsman' && (
                    <>
                      {user.verificationStatus === 'verified' ? (
                        <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                          <HiShieldCheck className="w-4 h-4" />
                          Verified
                        </div>
                      ) : (
                        <Link
                          href="/settings/verification"
                          className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                          <HiExclamationTriangle className="w-4 h-4" />
                          Not Verified
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-muted-foreground">
                  <span className="text-lg capitalize font-medium">
                    {user.role}
                  </span>
                  {user.service && (
                    <>
                      <span className="hidden md:inline" aria-hidden="true">
                        •
                      </span>
                      <span className="text-primary font-medium">
                        {user.service.name}
                      </span>
                    </>
                  )}
                </div>
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
                        <div className="text-2xl font-bold text-foreground">
                          {user.ratingCount}
                        </div>
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
                    Contact Information
                  </h3>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiMail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Email Address
                      </p>
                      <p className="text-foreground font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiPhone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="text-foreground font-medium">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Location & Rating
                  </h3>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiMapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground font-medium">
                        {formatAddress(user.address)}
                      </p>
                    </div>
                  </div>

                  {(user.rating > 0 || user.ratingCount > 0) && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <HiStar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Customer Rating
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
                          <span className="text-sm text-muted-foreground">
                            ({user.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Service Information for non-craftsman with service */}
        {user.role !== 'craftsman' && user.service && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Service Information
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{user.service.icon}</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  {user.service.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {user.service.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </Container>
  );
};

export default ProfilePage;
