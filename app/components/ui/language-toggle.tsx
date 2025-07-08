'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuLanguages } from 'react-icons/lu';

const LanguageToggle = () => {
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
  const router = useRouter();

  useEffect(() => {
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

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setCurrentLang(newLang);
    document.cookie = `CRAFTWORKS_LOCALE=${newLang}; path=/;`;
    router.refresh();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-md hover:bg-accent/20 transition-colors"
      aria-label="Toggle language"
      title={`Switch to ${currentLang === 'en' ? 'Arabic' : 'English'}`}
    >
      <LuLanguages size={18} />
    </button>
  );
};

export default LanguageToggle;
