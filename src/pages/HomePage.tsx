import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Header />
      <h1 className="text-2xl font-bold mt-8 text-center">{t('greeting')}</h1>
    </div>
  );
};

export default HomePage;
