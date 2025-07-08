import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { useQuery } from '@tanstack/react-query';
import servicesService from '../../services/services';
import type { Category } from '../../types';

const CategoriesSection = () => {
  const { t } = useTranslation();
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: servicesService.getAllCategories,
  });

  // Icon mapping for different category icons
  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.JSX.Element } = {
      'hammer-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      'faucet-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
          />
        </svg>
      ),
      'lightbulb-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      'paintbrush-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      'broom-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
      'leaf-icon': (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    };
    return iconMap[iconName] || iconMap['hammer-icon']; // Default fallback
  };

  // Color mapping for different categories
  const getCategoryColor = (index: number) => {
    const colors = ['blue', 'amber', 'cyan', 'purple', 'green', 'red'];
    return colors[index % colors.length];
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      amber:
        'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
      cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
      purple:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
      red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
      green:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('categories.title', 'Popular Categories')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(
                'categories.subtitle',
                'Browse craftsmen by category. Find the perfect professional for your specific needs.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg border border-border animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="w-16 h-6 bg-muted rounded-full"></div>
                </div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className="py-20 bg-muted">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('categories.title', 'Popular Categories')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t(
              'categories.subtitle',
              'Browse craftsmen by category. Find the perfect professional for your specific needs.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categoriesData?.map((category: Category, index: number) => (
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

              {category.subcategories && category.subcategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('categories.services', 'Services:')}
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
                {t('categories.browse', 'Browse craftsmen')}
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            {t('categories.viewAll', 'View All Categories')}
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default CategoriesSection;
