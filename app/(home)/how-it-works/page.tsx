import Container from '@/app/components/ui/container';
import {
  FaClipboardList,
  FaSearch,
  FaHandshake,
  FaRegSmile,
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');
  const steps = [
    {
      icon: <FaClipboardList className="text-primary w-8 h-8" />,
      title: t('steps.0.title'),
      description: t('steps.0.description'),
    },
    {
      icon: <FaSearch className="text-primary w-8 h-8" />,
      title: t('steps.1.title'),
      description: t('steps.1.description'),
    },
    {
      icon: <FaHandshake className="text-primary w-8 h-8" />,
      title: t('steps.2.title'),
      description: t('steps.2.description'),
    },
    {
      icon: <FaRegSmile className="text-primary w-8 h-8" />,
      title: t('steps.3.title'),
      description: t('steps.3.description'),
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-2xl" />
      </div>
      <Container
        maxWidth="lg"
        className="relative z-10 flex flex-col items-center justify-center py-24"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-foreground drop-shadow-lg tracking-tight">
          {t('title')}
        </h1>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
          {t('description')}
        </p>
        <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn">
          <ol className="space-y-8">
            {steps.map((step, idx) => (
              <li key={step.title} className="flex items-start gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground">{step.description}</p>
                  <span className="block mt-2 text-xs text-muted-foreground">
                    {t('stepLabel', { number: idx + 1 })}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
