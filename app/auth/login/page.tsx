'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { authAPI, tokenUtils } from '../../services/auth';
import Button from '../../components/ui/button';
import Input from '../../components/auth/input';
import { validateEmail } from '../../utils/validation';
import { FaHome } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const t = useTranslations('auth-pages.login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Only validate email
    const emailResult = validateEmail(email);
    setFieldErrors({ email: emailResult.isValid ? '' : emailResult.message });
    if (!emailResult.isValid) return;
    setIsLoading(true);
    try {
      // Authenticate with backend
      const response = await authAPI.login({ email, password });
      tokenUtils.setToken(response.token);
      tokenUtils.setUserData(response.user);
      // Authenticate with NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError('Authentication failed. Please try again.');
        tokenUtils.clearAll();
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
      tokenUtils.clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      {/* Home Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-50 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-border/50 group"
        aria-label={t('goToHome')}
      >
        <FaHome className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </button>

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
                src="/illustration/Team work-cuate.svg"
                alt="Login illustration"
                className="w-full h-full object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {t('welcomeBack')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('signInToContinue')}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h2>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <Input
                name="email"
                type="email"
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={fieldErrors.email}
                autoComplete="email"
                required
              />

              {/* Password Field */}
              <Input
                name="password"
                type="password"
                label={t('password')}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                showPasswordToggle
              />

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary-600 text-primary-foreground py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary/20 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    {t('signingIn')}
                  </div>
                ) : (
                  t('loginButton')
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  {t('noAccount')}{' '}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {t('registerLink')}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
