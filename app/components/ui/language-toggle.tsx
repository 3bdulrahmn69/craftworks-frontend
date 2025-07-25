'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, memo, useCallback } from 'react';
import { LuLanguages } from 'react-icons/lu';

const LanguageToggle = memo(function LanguageToggle() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('CRAFTWORKS_LOCALE='))
      ?.split('=')[1];

    if (cookies) {
      setCurrentLang(cookies as 'en' | 'ar');
    } else {
      const browserLang = navigator.language.slice(0, 2);
      setCurrentLang(browserLang as 'en' | 'ar');
      document.cookie = `CRAFTWORKS_LOCALE=${browserLang};`;
      router.refresh();
    }
  }, [router]);

  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setCurrentLang(newLang);
    document.cookie = `CRAFTWORKS_LOCALE=${newLang}; path=/;`;
    router.refresh();
  }, [currentLang, router]);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md hover:bg-accent/20 transition-colors"
        aria-label="Toggle language"
        aria-pressed="false"
        suppressHydrationWarning
      >
        <LuLanguages size={18} aria-hidden="true" />
      </button>
    );
  }

  const nextLang = currentLang === 'en' ? 'Arabic' : 'English';

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-md hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`Switch to ${nextLang}`}
      aria-pressed={currentLang === 'ar'}
      title={`Switch to ${nextLang}`}
    >
      <LuLanguages size={18} aria-hidden="true" />
    </button>
  );
});

export default LanguageToggle;
