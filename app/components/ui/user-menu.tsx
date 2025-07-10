import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Button from './button';
import { useAuth } from '../../hooks/useAuth';
import LogoutButton from '../auth/logout-button';
import { IoPerson, IoSettings } from 'react-icons/io5';
import Image from 'next/image';

const UserMenu = () => {
  const { isAuthenticated, getUserName, getUserRole, getUserProfileImage, isLoading } =
    useAuth();
  const t = useTranslations('userMenu');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Show loading state during hydration
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link href="/auth/login">
          <Button variant="secondary" size="sm">
            {t('nav.login')}
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button variant="primary" size="sm">
            {t('nav.register')}
          </Button>
        </Link>
      </div>
    );
  }

  const getUserInitials = () => {
    const name = getUserName();
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background active:scale-95 touch-manipulation overflow-hidden"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('userMenu')}
      >
        {getUserProfileImage() && getUserProfileImage().trim() !== '' ? (
          <Image
            src={getUserProfileImage()}
            alt={`${getUserName() || 'User'} profile picture`}
            className="w-full h-full object-cover"
            width={40}
            height={40}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = getUserInitials();
              }
            }}
          />
        ) : (
          getUserInitials()
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className={`absolute ${locale === 'ar' ? "left-0" : "right-0"} mt-3 w-64 sm:w-72 bg-card border border-border rounded-xl shadow-xl z-50 animate-fadeIn duration-200 max-w-[calc(100vw-2rem)]`}>
          {/* User Info Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                {getUserProfileImage() &&
                getUserProfileImage().trim() !== '' ? (
                  <Image
                    src={getUserProfileImage()}
                    alt={`${getUserName() || 'User'} profile picture`}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = getUserInitials();
                      }
                    }}
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {getUserName() || 'User'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full capitalize">
                  {getUserRole()}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg hover:bg-accent transition-colors text-foreground group touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <IoPerson className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              <span className="font-medium">{t('profile')}</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg hover:bg-accent transition-colors text-foreground group touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <IoSettings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              <span className="font-medium">{t('settings')}</span>
            </Link>

            <hr className="my-2 border-border" />

            <LogoutButton
              className="flex items-center gap-3 w-full px-3 py-3 sm:py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-foreground group touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <IoPerson className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors flex-shrink-0" />
              <span className="font-medium">{t('logout')}</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
