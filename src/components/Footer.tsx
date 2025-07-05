import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import {
  FaApple,
  FaArrowRight,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa6';
import { IoLogoAndroid } from 'react-icons/io';
import { Link } from 'react-router';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const forClients = [
    { name: t('footer.howToHire', 'How to Hire'), href: '/how-to-hire' },
    {
      name: t('footer.talentMarketplace', 'Talent Marketplace'),
      href: '/talent',
    },
    { name: t('footer.projectCatalog', 'Project Catalog'), href: '/projects' },
    { name: t('footer.hiringGuide', 'Hiring Guide'), href: '/hiring-guide' },
    {
      name: t('footer.enterprise', 'Enterprise Solutions'),
      href: '/enterprise',
    },
    { name: t('footer.payroll', 'Payroll Services'), href: '/payroll' },
  ];

  const forCraftsmen = [
    {
      name: t('footer.howToFindWork', 'How to Find Work'),
      href: '/how-to-find-work',
    },
    {
      name: t('footer.createProfile', 'Create Profile'),
      href: '/create-profile',
    },
    { name: t('footer.portfolio', 'Portfolio'), href: '/portfolio' },
    { name: t('footer.earnings', 'Earnings'), href: '/earnings' },
    {
      name: t('footer.certifications', 'Certifications'),
      href: '/certifications',
    },
    { name: t('footer.learning', 'Learning & Development'), href: '/learning' },
  ];

  const resources = [
    { name: t('footer.helpCenter', 'Help & Support'), href: '/help' },
    {
      name: t('footer.successStories', 'Success Stories'),
      href: '/success-stories',
    },
    { name: t('footer.reviews', 'Reviews'), href: '/reviews' },
    { name: t('footer.resources', 'Resources'), href: '/resources' },
    {
      name: t('footer.payrollGuides', 'Payroll Guides'),
      href: '/payroll-guides',
    },
    { name: t('footer.freeTools', 'Free Tools'), href: '/tools' },
  ];

  const company = [
    { name: t('footer.aboutUs', 'About Us'), href: '/about' },
    { name: t('footer.leadership', 'Leadership'), href: '/leadership' },
    {
      name: t('footer.investorRelations', 'Investor Relations'),
      href: '/investors',
    },
    { name: t('footer.careers', 'Careers'), href: '/careers' },
    { name: t('footer.press', 'Press & Media'), href: '/press' },
    { name: t('footer.contactUs', 'Contact Us'), href: '/contact' },
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
              {t('footer.forClients', 'For Clients')}
            </h3>
            <ul className="space-y-3">
              {forClients.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Craftsmen */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('footer.forCraftsmen', 'For Craftsmen')}
            </h3>
            <ul className="space-y-3">
              {forCraftsmen.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('footer.resources', 'Resources')}
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
              {t('footer.company', 'Company')}
            </h3>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
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
            <span className="text-muted-foreground">
              {t('footer.followUs', 'Follow Us')}
            </span>
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
            <span className="text-muted-foreground">
              {t('footer.mobileApp', 'Mobile App')}
            </span>
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
                  to="/terms"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {t('footer.terms', 'Terms of Service')}
                </Link>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {t('footer.privacy', 'Privacy Policy')}
                </Link>
                <Link
                  to="/cookies"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {t('footer.cookies', 'Cookie Policy')}
                </Link>
                <Link
                  to="/accessibility"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {t('footer.accessibility', 'Accessibility')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
