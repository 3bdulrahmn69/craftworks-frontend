import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'en' ? 'ar' : 'en');
    // Optionally, persist language selection
    localStorage.setItem('lang', currentLang === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 rounded transition-colors bg-secondary text-secondary-foreground ml-2"
      aria-label="Toggle language"
    >
      {currentLang === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
    </button>
  );
};

export default LanguageToggle;
