'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import servicesAPI from '@/app/services/services';
import { Service } from '@/app/types/jobs';
import { toast } from 'react-toastify';
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

const getCategoryIcon = (iconName: string, color: string) => {
  const getIconColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600',
      amber: 'text-amber-600',
      cyan: 'text-cyan-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      red: 'text-red-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600',
    };
    return colorMap[color] || colorMap['blue'];
  };

  const iconColorClass = getIconColorClass(color);

  const iconMap: { [key: string]: React.JSX.Element } = {
    'hammer-icon': <FaHammer className={`w-8 h-8 ${iconColorClass}`} />,
    'faucet-icon': <FaHome className={`w-8 h-8 ${iconColorClass}`} />,
    'lightbulb-icon': <FaLightbulb className={`w-8 h-8 ${iconColorClass}`} />,
    'paintbrush-icon': <FaPaintBrush className={`w-8 h-8 ${iconColorClass}`} />,
    'paint-icon': <FaPaintBrush className={`w-8 h-8 ${iconColorClass}`} />,
    'broom-icon': <FaBroom className={`w-8 h-8 ${iconColorClass}`} />,
    'leaf-icon': <FaLeaf className={`w-8 h-8 ${iconColorClass}`} />,
    'bolt-icon': <FaBolt className={`w-8 h-8 ${iconColorClass}`} />,
    'thermometer-icon': (
      <FaThermometerHalf className={`w-8 h-8 ${iconColorClass}`} />
    ),
    'brick-icon': <FaBuilding className={`w-8 h-8 ${iconColorClass}`} />,
  };
  return iconMap[iconName] || iconMap['hammer-icon'];
};

const getCategoryColor = (index: number) => {
  const colors = [
    'blue',
    'amber',
    'cyan',
    'purple',
    'green',
    'red',
    'orange',
    'teal',
  ];
  return colors[index % colors.length];
};

const getColorClasses = () => {
  return 'bg-card border-border hover:bg-accent hover:text-accent-foreground transition-colors';
};

const ServicesPage = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await servicesAPI.getAllServices();

        console.log('Services response:', response);

        if (response.success) {
          console.log('Fetched services:', response.data);
          setServices(response.data);
        } else {
          setError('Failed to load services');
        }
      } catch (err: any) {
        console.error('Failed to fetch services:', err);
        setError(err.message || 'Failed to load services');
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceSelect = (service: Service) => {
    // Navigate to create job page with selected service
    router.push(
      `/sc/create-job?serviceId=${service._id}&serviceName=${encodeURIComponent(
        service.name
      )}`
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Loading Services
            </h3>
            <p className="text-muted-foreground">
              Please wait while we fetch available services...
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Services
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-7xl">
      <main role="main">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <FaHammer className="inline-block mr-3 text-primary" />
            Select a Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Choose the service you want to create a job for. Select from our
            wide range of professional services.
          </p>
        </header>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <FaBroom className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Services Available
            </h3>
            <p className="text-muted-foreground">
              No services are currently available. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const color = getCategoryColor(index);
              const colorClasses = getColorClasses();

              return (
                <div
                  key={service._id}
                  className={`p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 transform h-full ${colorClasses}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    <div className="flex items-center justify-center mb-2">
                      {getCategoryIcon(service.icon, color)}
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="text-xl font-semibold mb-3">
                        {service.name}
                      </h3>
                      <p className="text-sm opacity-80 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Container>
  );
};

export default ServicesPage;
