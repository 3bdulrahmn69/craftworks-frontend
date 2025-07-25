import { useTranslations } from 'next-intl';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { FaApple, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { IoLogoAndroid } from 'react-icons/io';
import Link from 'next/link';
import { memo, useMemo } from 'react';

const Footer = memo(function Footer() {
  const t = useTranslations('footer');

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const forClients = useMemo(
    () => [
      { name: t('howToHire'), href: '/how-to-hire' },
      {
        name: t('talentMarketplace'),
        href: '/talent',
      },
      { name: t('projectCatalog'), href: '/projects' },
      { name: t('hiringGuide'), href: '/hiring-guide' },
      {
        name: t('enterprise'),
        href: '/enterprise',
      },
      { name: t('payroll'), href: '/payroll' },
    ],
    [t]
  );

  const forCraftsmen = useMemo(
    () => [
      {
        name: t('howToFindWork'),
        href: '/how-to-find-work',
      },
      {
        name: t('createProfile'),
        href: '/create-profile',
      },
      { name: t('portfolio'), href: '/portfolio' },
      { name: t('earnings'), href: '/earnings' },
      {
        name: t('certifications'),
        href: '/certifications',
      },
      { name: t('learning'), href: '/learning' },
    ],
    [t]
  );

  const resources = [
    { name: t('helpCenter'), href: '/help' },
    {
      name: t('successStories'),
      href: '/success-stories',
    },
    { name: t('reviews'), href: '/reviews' },
    { name: t('resources'), href: '/resources' },
    {
      name: t('payrollGuides'),
      href: '/payroll-guides',
    },
    { name: t('freeTools'), href: '/tools' },
  ];

  const company = [
    { name: t('aboutUs'), href: '/about' },
    { name: t('leadership'), href: '/leadership' },
    {
      name: t('investorRelations'),
      href: '/investors',
    },
    { name: t('careers'), href: '/careers' },
    { name: t('press'), href: '/press' },
    { name: t('contactUs'), href: '/contact' },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: FaFacebook,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: FaTwitter,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: FaInstagram,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: FaLinkedin,
    },
  ];

  return (
    <footer className="bg-background text-foreground">
      <div className="rounded-lg m-8 p-8 md:p-16 bg-muted">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* For Clients */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('forClients')}
            </h3>
            <ul className="space-y-3">
              {forClients.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-sm text-muted-foreground hover:text-primary transition-all duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Craftsmen */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('forCraftsmen')}
            </h3>
            <ul className="space-y-3">
              {forCraftsmen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-sm text-muted-foreground hover:text-primary transition-all duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('resources')}
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-sm text-muted-foreground hover:text-primary transition-all duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('company')}
            </h3>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-sm text-muted-foreground hover:text-primary transition-all duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & App Download */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          {/* Social Media */}
          <div className="flex flex-col md:flex-row md:items-center space-x-3">
            <span className="text-muted-foreground">{t('followUs')}</span>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-muted-foreground/10 transition-colors duration-200 flex items-center p-2 rounded-full"
                  aria-label={social.name}
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {/* App Download */}
          <div className="flex flex-col md:flex-row md:items-center space-x-3">
            <span className="text-muted-foreground">{t('mobileApp')}</span>
            <div className="flex space-x-3">
              <button className="hover:bg-muted-foreground/10 transition-colors duration-200 flex items-center p-2 rounded-full">
                <FaApple size={24} />
              </button>
              <button className="hover:bg-muted-foreground/10 transition-colors duration-200 flex items-center p-2 rounded-full">
                <IoLogoAndroid size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">© {currentYear} CraftWorks</span>
              <div className="flex items-center gap-4">
                <Link
                  href="/terms"
                  className="relative inline-block hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                >
                  {t('terms')}
                </Link>
                <Link
                  href="/privacy"
                  className="relative inline-block hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                >
                  {t('privacy')}
                </Link>
                <Link
                  href="/cookies"
                  className="relative inline-block hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                >
                  {t('cookies')}
                </Link>
                <Link
                  href="/accessibility"
                  className="relative inline-block hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300"
                >
                  {t('accessibility')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
