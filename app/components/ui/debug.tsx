import LanguageToggle from './language-toggle';
import ThemeToggle from './theme-toggle';

const Debug = () => {
  return (
    <div className="fixed bottom-0 right-0 p-4 bg-gray-800 text-white z-50 flex flex-col items-end space-y-2">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
};

export default Debug;
