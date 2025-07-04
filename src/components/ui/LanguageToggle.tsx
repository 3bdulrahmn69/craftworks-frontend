import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-md hover:bg-accent/20 transition-colors"
      aria-label="Toggle language"
      title={`Switch to ${currentLang === 'en' ? 'Arabic' : 'English'}`}
    >
      <Languages size={18} />
    </button>
  );
};

export default LanguageToggle;
