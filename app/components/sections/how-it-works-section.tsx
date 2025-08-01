import { useTranslations } from 'next-intl';
import Button from '../ui/button';
import Container from '@/app/components/ui/container';
import {
  FaClipboardList,
  FaSearch,
  FaHandshake,
  FaRegSmile,
  FaHammer,
  FaRegCheckCircle,
  FaRegLightbulb,
  FaRegClock,
} from 'react-icons/fa';

const clientStepIcons = [
  <FaClipboardList key="1" size={24} />, // Step 1: List requirements
  <FaSearch key="2" size={24} />, // Step 2: Search
  <FaHandshake key="3" size={24} />, // Step 3: Connect
  <FaRegSmile key="4" size={24} />, // Step 4: Enjoy/Complete
];

const craftsmanStepIcons = [
  <FaHammer key="1" size={24} />, // Step 1: Get jobs
  <FaRegCheckCircle key="2" size={24} />, // Step 2: Accept
  <FaRegLightbulb key="3" size={24} />, // Step 3: Work
  <FaRegClock key="4" size={24} />, // Step 4: Finish/On time
];

const HowItWorksSection = () => {
  const t = useTranslations('homepage sections.how-it-works section');

  const clientStepKeys = ['step1', 'step2', 'step3', 'step4'];
  const craftsmanStepKeys = ['step1', 'step2', 'step3', 'step4'];

  return (
    <section className="py-20 bg-background">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* For Clients */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('forClients')}
              </h3>
              <p className="text-muted-foreground">{t('forClientsSubtitle')}</p>
            </div>

            <div className="space-y-6">
              {clientStepKeys.map((key, idx) => (
                <div key={key} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {clientStepIcons[idx]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t(`clientSteps.${key}.title`)}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(`clientSteps.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Craftsmen */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('forCraftsmen')}
              </h3>
              <p className="text-muted-foreground">
                {t('forCraftsmenSubtitle')}
              </p>
            </div>

            <div className="space-y-6">
              {craftsmanStepKeys.map((key, idx) => (
                <div key={key} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success">
                    {craftsmanStepIcons[idx]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t(`craftsmanSteps.${key}.title`)}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(`craftsmanSteps.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            {t('learnMore')}
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;
