import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import useAuth from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { IoChevronDown } from 'react-icons/io5';

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
        <Link to="/auth/login">
          <Button variant="secondary" size="sm">
            {t('nav.login')}
          </Button>
        </Link>
        <Link to="/auth/register">
          <Button variant="primary" size="sm">
            {t('nav.register')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition-colors flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{user?.full_name || user?.email || 'User'}</span>
        <IoChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded shadow-lg z-50">
          <Link
            to="/profile"
            className="block px-4 py-2 hover:bg-accent transition-colors text-foreground"
          >
            {t('Profile') || 'Profile'}
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-accent transition-colors text-foreground"
          >
            {t('Logout') || 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
