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
} from 'react-icons/fa';

// Server utility to fetch categories
async function fetchCategories(): Promise<Category[]> {
  try {
    const link = `${
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    }/services/`;
    const res = await fetch(link, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
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
    'broom-icon': <FaBroom className="w-12 h-12" />,
    'leaf-icon': <FaLeaf className="w-12 h-12" />,
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
          {categoriesData.length > 0 ? (
            categoriesData.map((category: Category, index: number) => (
              <div
                key={category.id}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${getColorClasses(
                      getCategoryColor(index)
                    )}`}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {category.subcategories?.length || 0}+
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>

                <p className="text-muted-foreground mb-4">
                  {category.description}
                </p>

                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('services')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories
                          .slice(0, 3)
                          .map((subcategory: string, subIndex: number) => (
                            <span
                              key={subIndex}
                              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                            >
                              {subcategory}
                            </span>
                          ))}
                        {category.subcategories.length > 3 && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            +{category.subcategories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex items-center text-sm text-primary font-medium">
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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t('noCategories')}
              </p>
            </div>
          )}
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
