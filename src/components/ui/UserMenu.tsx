import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import useAuth from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link to="/auth/login" className="px-3 py-2 rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors">
          {t('nav.login')}
        </Link>
        <Link to="/auth/register" className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-accent transition-colors">
          {t('nav.register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{user?.name || user?.email || 'User'}</span>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card border border-border rounded shadow-lg z-50">
          <Link to="/profile" className="block px-4 py-2 hover:bg-accent transition-colors">{t('Profile') || 'Profile'}</Link>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="block w-full text-left px-4 py-2 hover:bg-accent transition-colors"
          >
            {t('Logout') || 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 