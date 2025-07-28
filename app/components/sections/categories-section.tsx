import { getLocale, getTranslations } from 'next-intl/server';
import type { Category } from '@/app/types/services';

/* components */
import Container from '../ui/container';
import Button from '../ui/button';

import {
  FaHammer,
  FaHome,
  FaLightbulb,
  FaPaintBrush,
  FaBroom,
  FaLeaf,
  FaChevronRight,
  FaBolt,
  FaThermometerHalf,
  FaBuilding,
} from 'react-icons/fa';

// Server utility to fetch categories
async function fetchCategories(): Promise<Category[]> {
  try {
    const link = `${
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    }/services`;
    const res = await fetch(link, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('Failed to fetch categories:', error);
    return [];
  }
}

const getCategoryIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.JSX.Element } = {
    'hammer-icon': <FaHammer className="w-12 h-12" />,
    'faucet-icon': <FaHome className="w-12 h-12" />,
    'lightbulb-icon': <FaLightbulb className="w-12 h-12" />,
    'paintbrush-icon': <FaPaintBrush className="w-12 h-12" />,
    'paint-icon': <FaPaintBrush className="w-12 h-12" />,
    'broom-icon': <FaBroom className="w-12 h-12" />,
    'leaf-icon': <FaLeaf className="w-12 h-12" />,
    'bolt-icon': <FaBolt className="w-12 h-12" />,
    'thermometer-icon': <FaThermometerHalf className="w-12 h-12" />,
    'brick-icon': <FaBuilding className="w-12 h-12" />,
  };
  return iconMap[iconName] || iconMap['hammer-icon']; // Default fallback
};

const getCategoryColor = (index: number) => {
  const colors = ['blue', 'amber', 'cyan', 'purple', 'green', 'red'];
  return colors[index % colors.length];
};

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
    purple:
      'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const CategoriesSection = async () => {
  const t = await getTranslations('homepage sections.categories');
  const locale = await getLocale();
  const categoriesData = await fetchCategories();
  console.log('Fetched categories:', categoriesData);

  if (!categoriesData) return null;

  return (
    <section className="py-20 bg-muted">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categoriesData &&
            categoriesData.map((category: Category, index: number) => (
              <div
                key={category._id}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-border"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div
                    className={`p-4 rounded-lg mb-4 ${getColorClasses(
                      getCategoryColor(index)
                    )}`}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>

                  <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-center text-sm text-primary font-medium">
                  {t('browse')}
                  <FaChevronRight
                    className={`w-4 h-4 transition-transform ${
                      locale === 'ar'
                        ? 'rotate-180 mr-1 group-hover:-translate-x-1 '
                        : 'ml-1 group-hover:translate-x-1 '
                    }`}
                  />
                </div>
              </div>
            ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            {t('viewAll')}
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default CategoriesSection;
