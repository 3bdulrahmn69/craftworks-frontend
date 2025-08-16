'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { userService } from '@/app/services/user';
import { User } from '@/app/types/user';
import Button from '@/app/components/ui/button';
import { HiExclamationTriangle, HiArrowRight } from 'react-icons/hi2';
import Link from 'next/link';

interface CompleteProfileBannerProps {
  className?: string;
}

const CompleteProfileBanner = ({
  className = '',
}: CompleteProfileBannerProps) => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('completeProfile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await userService.getMe(session.accessToken);
        console.log(userData);
        setUser(userData);

        // Check profile completion based on role
        const missing: string[] = [];
        const hasAddress = !!(
          userData.address?.state &&
          userData.address?.city &&
          userData.address?.street
        );

        if (userData.role === 'client') {
          if (!userData.profilePicture) missing.push('profilePicture');
          if (!hasAddress) missing.push('address');
        } else if (userData.role === 'craftsman') {
          if (!userData.profilePicture) missing.push('profilePicture');
          if (!hasAddress) missing.push('address');
          if (!userData.phone) missing.push('phone');
          if (!userData.bio) missing.push('bio');
          if (
            !userData.portfolioImageUrls ||
            userData.portfolioImageUrls.length === 0
          )
            missing.push('portfolio');
        }

        setMissingFields(missing);
        setIsProfileComplete(missing.length === 0);
      } catch (error) {
        console.error('Failed to check profile completion:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [session?.accessToken]);

  if (loading || isProfileComplete || !user) {
    return null;
  }

  // Progress calculation
  const totalRequired = user.role === 'craftsman' ? 5 : 2;
  const completedCount = Math.max(totalRequired - missingFields.length, 0);
  const completedPercent = Math.round((completedCount / totalRequired) * 100);

  const getMissingFieldsText = () => {
    const fieldNames = missingFields.map((field) => {
      switch (field) {
        case 'profilePicture':
          return t('fields.profilePicture');
        case 'phone':
          return t('fields.phone');
        case 'address':
          return t('fields.address');
        case 'bio':
          return t('fields.bio');
        case 'portfolio':
          return t('fields.portfolio');
        default:
          return field;
      }
    });

    if (fieldNames.length === 1) {
      return fieldNames[0];
    } else if (fieldNames.length === 2) {
      return `${fieldNames[0]} ${t('and')} ${fieldNames[1]}`;
    } else {
      const lastField = fieldNames.pop();
      return `${fieldNames.join(', ')} ${t('and')} ${lastField}`;
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-warning/10 via-warning/5 to-warning/10 border border-warning/20 rounded-xl p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <HiExclamationTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t('title')}
            </h3>
            {/* Progress */}
            <div className="my-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{completedPercent}%</span>
              </div>
              <div className="h-2 bg-warning/20 rounded-md overflow-hidden">
                <div
                  className="h-full bg-warning"
                  style={{ width: `${completedPercent}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('message', { fields: getMissingFieldsText() })}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning border border-warning/30"
                >
                  {field === 'profilePicture' && t('fields.profilePicture')}
                  {field === 'phone' && t('fields.phone')}
                  {field === 'address' && t('fields.address')}
                  {field === 'bio' && t('fields.bio')}
                  {field === 'portfolio' && t('fields.portfolio')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link href="/settings/personal">
            <Button className="bg-warning text-warning-foreground hover:bg-warning/90 transition-colors duration-200">
              <span className="flex items-center gap-2">
                {t('button.complete')}
                <HiArrowRight
                  className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`}
                />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileBanner;
