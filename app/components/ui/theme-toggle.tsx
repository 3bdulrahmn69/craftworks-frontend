'use client';

import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { useEffect, useState, memo, useCallback } from 'react';

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md hover:bg-accent/20 transition-colors"
        aria-label="Toggle theme"
        aria-pressed="false"
        suppressHydrationWarning
      >
        <FaMoon size={18} aria-hidden="true" />
      </button>
    );
  }

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDark}
      title={`Switch to ${nextTheme} mode`}
    >
      {isDark ? (
        <FaSun size={18} aria-hidden="true" />
      ) : (
        <FaMoon size={18} aria-hidden="true" />
      )}
    </button>
  );
});

export default ThemeToggle;
