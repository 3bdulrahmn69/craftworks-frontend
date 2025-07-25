'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { loginWithNextAuth } from '../../services/session';
import PrimaryButton from '../../components/ui/primary-button';
import AuthLayout from '../../components/auth/auth-layout';
import ErrorMessage from '../../components/ui/error-message';
import Input from '../../components/auth/input';
import PhoneInput from '../../components/auth/phone-input';
import { validateEmail, validatePhone } from '../../utils/validation';

export default function LoginPage() {
  const t = useTranslations('auth-pages.login');
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate based on login type
    let isValid = true;
    const newFieldErrors = { email: '', phone: '' };

    if (loginType === 'email') {
      const emailResult = validateEmail(email);
      newFieldErrors.email = emailResult.isValid ? '' : emailResult.message;
      isValid = emailResult.isValid;
    } else {
      const phoneResult = validatePhone(phone);
      newFieldErrors.phone = phoneResult.isValid ? '' : phoneResult.message;
      isValid = phoneResult.isValid;
    }

    setFieldErrors(newFieldErrors);
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Use email or phone for login
      const identifier = loginType === 'email' ? email : phone;
      const result = await loginWithNextAuth(identifier, password, loginType);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      illustration="/illustration/Team work-cuate.svg"
      illustrationAlt="Login illustration"
      welcomeTitle={t('welcomeBack')}
      welcomeSubtitle={t('signInToContinue')}
      homeButtonLabel={t('goToHome')}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Login Type Toggle */}
          <div className="flex items-center justify-center space-x-1 bg-muted rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginType === 'email'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('email')}
            </button>
            <button
              type="button"
              onClick={() => setLoginType('phone')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginType === 'phone'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('phone')}
            </button>
          </div>

          {/* Email or Phone Field */}
          {loginType === 'email' ? (
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
          ) : (
            <PhoneInput
              name="phone"
              label={t('phone')}
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={fieldErrors.phone}
              countryCode="+20"
              required
            />
          )}

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
          <ErrorMessage message={error} />

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            size="lg"
            isLoading={isLoading}
            loadingText={t('signingIn')}
            disabled={isLoading}
          >
            {t('loginButton')}
          </PrimaryButton>

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
    </AuthLayout>
  );
}
