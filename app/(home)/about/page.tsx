import Container from '@/app/components/ui/container';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function About() {
  const t = useTranslations('about');
  const team = [
    {
      name: t('team.0.name'),
      role: t('team.0.role'),
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: t('team.1.name'),
      role: t('team.1.role'),
      img: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: t('team.2.name'),
      role: t('team.2.role'),
      img: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: t('team.3.name'),
      role: t('team.3.role'),
      img: 'https://randomuser.me/api/portraits/men/76.jpg',
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
        {/* Mission/Vision Card */}
        <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 mb-12 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t('missionTitle')}
              </h2>
              <p className="text-muted-foreground">{t('mission')}</p>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t('visionTitle')}
              </h2>
              <p className="text-muted-foreground">{t('vision')}</p>
            </div>
          </div>
        </div>
        {/* Team Card */}
        <div className="w-full max-w-4xl mx-auto bg-background/80 rounded-2xl border border-border shadow p-6 md:p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
            {t('teamTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-card border border-border rounded-xl p-6 flex flex-col items-center shadow-sm"
              >
                <Image
                  width={80}
                  height={80}
                  src={member.img}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-primary/20"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
