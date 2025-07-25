'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { authAPI, tokenUtils } from '../../services/auth';
import { createSessionFromAuthData } from '../../services/session';
import PrimaryButton from '../../components/ui/primary-button';
import HomeButton from '../../components/ui/home-button';
import ErrorMessage from '../../components/ui/error-message';
import Input from '../../components/auth/input';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
} from '../../utils/validation';
import {
  FaArrowLeft,
  FaBriefcase,
  FaUser,
  FaCheckCircle,
} from 'react-icons/fa';
import Image from 'next/image';

export default function RegisterPage() {
  const t = useTranslations('auth-pages.register');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const roles = [
    {
      value: 'client',
      label: t('roles.client.label'),
      illustration: '/illustration/Team work-cuate.svg',
      desc: t('roles.client.description'),
    },
    {
      value: 'craftsman',
      label: t('roles.craftsman.label'),
      illustration: '/illustration/Construction worker-pana.svg',
      desc: t('roles.craftsman.description'),
    },
  ];

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'client' | 'craftsman' | ''>('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    country: 'Egypt',
    role: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for role parameter in URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'client' || roleParam === 'craftsman') {
      setRole(roleParam);
      setForm((prev) => ({
        ...prev,
        role: roleParam,
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        country: 'Egypt',
      }));
      setStep(2);
    }
  }, [searchParams]);

  const handleRoleSelect = (selectedRole: 'client' | 'craftsman') => {
    setRole(selectedRole);
    setError(null);
    setFieldErrors({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    });
    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      country: 'Egypt',
      role: selectedRole,
    });
    setStep(2);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const nameResult = validateName(form.fullName);
    const emailResult = validateEmail(form.email);
    const passwordResult = validatePassword(form.password);
    const confirmPasswordResult = validatePasswordMatch(
      form.password,
      form.confirm_password
    );
    const phoneResult = validatePhone(form.phone);
    const errors = {
      fullName: nameResult.isValid ? '' : nameResult.message,
      email: emailResult.isValid ? '' : emailResult.message,
      password: passwordResult.isValid ? '' : passwordResult.message,
      confirm_password: confirmPasswordResult.isValid
        ? ''
        : confirmPasswordResult.message,
      phone: phoneResult.isValid ? '' : phoneResult.message,
    };
    setFieldErrors(errors);
    return (
      nameResult.isValid &&
      emailResult.isValid &&
      passwordResult.isValid &&
      confirmPasswordResult.isValid &&
      phoneResult.isValid
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register');
      return;
    }
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Register with backend
      const response = await authAPI.register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      // Create NextAuth session directly with the register response data
      const sessionCreated = await createSessionFromAuthData(response);

      if (sessionCreated) {
        router.push('/');
      } else {
        setError(
          'Registration successful but failed to create session. Please try logging in.'
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
      tokenUtils.clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentIllustration = () => {
    if (step === 1) return roles[0].illustration;
    return role === 'client' ? roles[0].illustration : roles[1].illustration;
  };

  const getCurrentTitle = () => {
    if (step === 1) return t('chooseRole');
    return role === 'client' ? t('joinAsClient') : t('joinAsCraftsman');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      {/* Home Button */}
      <HomeButton label={t('goToHome')} />

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
                src={getCurrentIllustration()}
                alt={getCurrentTitle()}
                className="w-full h-full object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {getCurrentTitle()}
            </h1>
            {step === 1 && (
              <p className="text-muted-foreground text-lg">
                {t('selectRoleToStart')}
              </p>
            )}
            {step === 2 && (
              <p className="text-muted-foreground">
                {role === 'client' ? t('clientDesc') : t('craftsmanDesc')}
              </p>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center">
          {step === 1 ? (
            /* Step 1: Role Selection */
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {t('title')}
                </h2>
                <p className="text-muted-foreground">{t('subtitle')}</p>
              </div>

              <div className="space-y-4">
                {roles.map((r, index) => (
                  <button
                    key={r.value}
                    onClick={() =>
                      handleRoleSelect(r.value as 'client' | 'craftsman')
                    }
                    className={`group w-full flex items-center gap-4 p-6 h-24 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/20 transform hover:scale-[1.02] ${
                      role === r.value
                        ? 'border-primary bg-primary/10 shadow-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                      {r.value === 'client' ? (
                        <FaUser className="w-8 h-8 text-primary" />
                      ) : (
                        <FaBriefcase className="w-8 h-8 text-primary" />
                      )}
                    </div>

                    <div
                      className={`flex-1 ${
                        locale === 'ar' ? 'text-right' : 'text-left'
                      } min-h-0`}
                    >
                      <div className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {r.label}
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm line-clamp-2">
                        {r.desc}
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        role === r.value
                          ? 'border-primary bg-primary scale-110'
                          : 'border-border bg-card group-hover:border-primary/50'
                      }`}
                    >
                      {role === r.value && (
                        <FaCheckCircle className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  {t('alreadyHaveAccount')}{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {t('loginLink')}
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Step 2: Registration Form */
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label={t('goBack')}
                >
                  <FaArrowLeft
                    className={`w-6 h-6 text-muted-foreground ${
                      locale === 'ar' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('completeRegistration')}
                  </h2>
                  <p className="text-muted-foreground">{t('fillDetails')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <Input
                  name="fullName"
                  type="text"
                  label={t('fullName')}
                  placeholder={t('fullNamePlaceholder')}
                  value={form.fullName}
                  onChange={handleChange}
                  error={fieldErrors.fullName}
                  autoComplete="name"
                />

                {/* Email Field */}
                <Input
                  name="email"
                  type="email"
                  label={t('email')}
                  placeholder={t('emailPlaceholder')}
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  autoComplete="email"
                />

                {/* Phone Field */}
                <Input
                  name="phone"
                  type="text"
                  label={t('phone')}
                  placeholder={t('phonePlaceholder')}
                  value={form.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  autoComplete="tel"
                />

                {/* Password Field */}
                <Input
                  name="password"
                  type="password"
                  label={t('password')}
                  placeholder={t('passwordPlaceholder')}
                  value={form.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  showPasswordToggle
                  autoComplete="new-password"
                />

                {/* Confirm Password Field */}
                <Input
                  name="confirm_password"
                  type="password"
                  label={t('confirmPassword')}
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={form.confirm_password}
                  onChange={handleChange}
                  error={fieldErrors.confirm_password}
                  showPasswordToggle
                  autoComplete="new-password"
                />

                {/* Country Field */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {t('country')}
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted text-muted-foreground border-border cursor-not-allowed select-none relative">
                    <span className="font-semibold text-foreground">
                      {locale === 'ar' ? 'مصر' : 'Egypt'}
                    </span>
                    <span
                      className={`text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ${
                        locale === 'ar' ? 'mr-auto' : 'ml-auto'
                      }`}
                    >
                      {t('default')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('supportedCountry')}
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {t('termsAgreement')}{' '}
                    <Link
                      href="/terms"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {t('termsLink')}
                    </Link>
                  </label>
                </div>

                {/* Error Message */}
                <ErrorMessage message={error} />

                {/* Submit Button */}
                <PrimaryButton
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  loadingText={t('creatingAccount')}
                  disabled={isLoading}
                >
                  {t('createAccount')}
                </PrimaryButton>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('alreadyHaveAccount')}{' '}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {t('loginLink')}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
