import HomeButton from '../ui/home-button';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  illustration: string;
  illustrationAlt: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  homeButtonLabel: string;
}

export default function AuthLayout({
  children,
  illustration,
  illustrationAlt,
  welcomeTitle,
  welcomeSubtitle,
  homeButtonLabel,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      <HomeButton label={homeButtonLabel} />

      <div className="w-full max-w-5xl bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row backdrop-blur-lg border border-border/50">
        {/* Illustration Section */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/15 p-8 lg:p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
            <div className="absolute bottom-20 right-15 w-16 h-16 bg-secondary rounded-full"></div>
            <div className="absolute top-1/2 right-10 w-12 h-12 bg-primary/50 rounded-full"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center mb-6">
              <Image
                width={320}
                height={320}
                src={illustration}
                alt={illustrationAlt}
                className="w-full h-full object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {welcomeTitle}
            </h1>
            <p className="text-muted-foreground text-lg">{welcomeSubtitle}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
