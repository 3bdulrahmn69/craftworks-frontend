import { getTranslations, getLocale } from 'next-intl/server';
import type { Service } from '@/app/types/jobs';
import { getServiceName, getServiceDescription } from '@/app/services/services';
import Image from 'next/image';

/* components */
import Container from '../ui/container';

import {
  FaHammer,
  FaHome,
  FaLightbulb,
  FaPaintBrush,
  FaBroom,
  FaLeaf,
  FaBolt,
  FaThermometerHalf,
  FaBuilding,
} from 'react-icons/fa';

// Server utility to fetch services
async function fetchServices(locale?: string): Promise<Service[]> {
  try {
    const queryParams = locale ? `?lang=${locale}` : '';
    const link = `${
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    }/services${queryParams}`;
    const res = await fetch(link, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('Failed to fetch services:', error);
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
  return iconMap[iconName] || iconMap['hammer-icon'];
};

const getCategoryColor = (index: number) => {
  const colors = ['blue', 'amber', 'cyan', 'purple', 'green', 'red'];
  return colors[index % colors.length];
};

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-primary/10 text-primary',
    amber: 'bg-warning/10 text-warning',
    cyan: 'bg-info/10 text-info',
    purple: 'bg-info/10 text-info',
    red: 'bg-destructive/10 text-destructive',
    green: 'bg-success/10 text-success',
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const ServicesSection = async () => {
  const locale = await getLocale();
  const t = await getTranslations('homepage sections.services');
  const servicesData = await fetchServices(locale);

  if (!servicesData) return null;

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
          {servicesData &&
            servicesData.map((service: Service, index: number) => (
              <div
                key={service._id}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group border border-border"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div
                    className={`p-4 rounded-lg mb-4 ${getColorClasses(
                      getCategoryColor(index)
                    )}`}
                  >
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={getServiceName(service, locale)}
                        width={48}
                        height={48}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      getCategoryIcon('hammer-icon')
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {getServiceName(service, locale)}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {getServiceDescription(service, locale)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Container>
    </section>
  );
};

export default ServicesSection;
