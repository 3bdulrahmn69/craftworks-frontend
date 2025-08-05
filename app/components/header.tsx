'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

/* * Components */
import LanguageToggle from './ui/language-toggle';
import Logo from './ui/logo';
import ThemeToggle from './ui/theme-toggle';
import UserMenu from './ui/user-menu';
import Button from './ui/button';
import { IoIosClose, IoMdMenu } from 'react-icons/io';

interface NavLink {
  key: string;
  href: string;
}

interface HeaderDesktopProps {
  navLinks: NavLink[];
  t: any;
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

function HeaderDesktop({
  navLinks,
  t,
  mobileMenuOpen,
  toggleMobileMenu,
}: HeaderDesktopProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50 text-foreground hover:scale-105 relative group"
            >
              {t(`nav.${link.key}`)}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Right side actions */}
      <div className="hidden lg:flex items-center gap-3">
        <ThemeToggle />
        <LanguageToggle />

        <hr className="border-border/20 h-6 w-0.5 bg-accent mx-2" />

        {/* User menu or auth buttons */}
        <UserMenu />
      </div>

      {/* Mobile header actions */}
      <div className="lg:hidden flex items-center gap-2">
        {isAuthenticated && <UserMenu />}
        <button
          className="p-2 rounded-lg hover:bg-accent/50 text-foreground transition-all duration-200 hover:scale-105"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <IoIosClose size={24} /> : <IoMdMenu size={24} />}
        </button>
      </div>
    </div>
  );
}

interface HeaderMobileProps {
  navLinks: NavLink[];
  t: any;
  mobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

function HeaderMobile({
  navLinks,
  t,
  mobileMenuOpen,
  closeMobileMenu,
}: HeaderMobileProps) {
  const { isAuthenticated } = useAuth();
  const local = useLocale();

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 h-screen w-full bg-black/40 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {mobileMenuOpen && (
        <div
          className={`fixed inset-y-0 ${
            local === 'en' ? 'right-0' : 'left-0'
          } lg:hidden bg-card/95 backdrop-blur-lg border-l border-border shadow-2xl w-80 max-w-[85vw] h-screen transform transition-transform duration-300 ease-out z-50 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                {t('menu')}
              </h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-105"
              >
                <IoIosClose />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Navigation links */}
              <nav className="p-6">
                <ul className="space-y-2">
                  {navLinks.map((link, index) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className="block px-4 py-3 rounded-xl hover:bg-accent/50 text-foreground transition-all duration-200 hover:translate-x-1 group"
                        onClick={closeMobileMenu}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="flex items-center justify-between">
                          {t(`nav.${link.key}`)}
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                            →
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Auth buttons for mobile */}
              {!isAuthenticated && (
                <div className="p-6 border-t border-border">
                  <div className="flex flex-col gap-4">
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      <Button
                        variant="secondary"
                        className="w-full h-12 text-base hover:scale-105 transition-transform duration-200"
                      >
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={closeMobileMenu}>
                      <Button
                        variant="primary"
                        className="w-full h-12 text-base hover:scale-105 transition-transform duration-200"
                      >
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {/* Settings Footer */}
            <div className="p-6 border-t border-border bg-gradient-to-r from-muted/30 to-muted/10">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                {t('settings')}
              </h3>
              <div className="space-y-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const Header = ({
  navLinks,
}: {
  navLinks: { key: string; href: string }[];
}) => {
  const t = useTranslations('header');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border transition-all duration-300 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
      <HeaderDesktop
        navLinks={navLinks}
        t={t}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      <HeaderMobile
        navLinks={navLinks}
        t={t}
        mobileMenuOpen={mobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
      />
    </header>
  );
};

export default Header;
