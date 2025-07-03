import { Link } from 'react-router';
import Logo from './ui/Logo';
import ThemeToggle from './ui/ThemeToggle';
import LanguageToggle from './ui/LanguageToggle';
import UserMenu from './ui/UserMenu';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.howitworks'), href: '/how-it-works' },
    { label: t('nav.contact'), href: '/contact' },
    { label: t('nav.faq'), href: '/faq' },
  ];

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-primary text-primary-foreground shadow-md border-b border-border transition-colors">
      <div className="flex items-center flex-shrink-0">
        <Logo />
      </div>

      {/* Center: Navigation */}
      <nav className="flex-1 flex justify-center">
        <ul className="flex gap-6">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className="px-3 py-2 rounded-md transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
