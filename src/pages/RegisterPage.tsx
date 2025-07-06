import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { FaArrowLeft, FaBriefcase, FaUser } from 'react-icons/fa6';
import { FaHome } from 'react-icons/fa';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
} from '../utils/validation';
import Input from '../components/ui/Input';
import { FaCheckCircle } from 'react-icons/fa';

const roles = [
  {
    value: 'client',
    label: 'Client',
    illustration: '/src/assets/Team work-cuate.svg',
    desc: 'I want to hire skilled craftsmen for my projects.',
  },
  {
    value: 'craftsman',
    label: 'Craftsman',
    illustration: '/src/assets/Construction worker-pana.svg',
    desc: 'I am a craftsman looking for new opportunities.',
  },
];

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'client' | 'craftsman' | ''>('');

  // Check for role parameter in URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'client' || roleParam === 'craftsman') {
      setRole(roleParam);
      setForm((prev) => ({
        ...prev,
        role: roleParam,
        full_name: '',
        email: '',
        phone: '',
        password: '',
        country: 'Egypt',
      }));
      setStep(2);
    }
  }, [searchParams]);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    country: 'Egypt',
    role: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRoleSelect = (selectedRole: 'client' | 'craftsman') => {
    setRole(selectedRole);
    setForm((prev) => ({ ...prev, role: selectedRole }));
    setError(null);
    setFieldErrors({
      full_name: '',
      email: '',
      phone: '',
      password: '',
    });
    setForm({
      ...form,
      full_name: '',
      email: '',
      phone: '',
      password: '',
      country: 'Egypt',
      role: selectedRole,
    });

    // Update URL with the selected role
    setSearchParams({ role: selectedRole });
    setStep(2);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const nameResult = validateName(form.full_name);
    const emailResult = validateEmail(form.email);
    const passwordResult = validatePassword(form.password);
    const phoneResult = validatePhone(form.phone);
    const errors: typeof fieldErrors = {
      full_name: nameResult.isValid ? '' : nameResult.message,
      email: emailResult.isValid ? '' : emailResult.message,
      password: passwordResult.isValid ? '' : passwordResult.message,
      phone: phoneResult.isValid ? '' : phoneResult.message,
    };
    setFieldErrors(errors);
    return (
      nameResult.isValid &&
      emailResult.isValid &&
      passwordResult.isValid &&
      phoneResult.isValid
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!termsAccepted) {
      setError(t('You must accept the Terms and Conditions to register'));
      return;
    }
    if (!validateForm()) return;
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        role: form.role as 'client' | 'craftsman',
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || t('Registration failed'));
    }
  };

  const getCurrentIllustration = () => {
    if (step === 1) return roles[0].illustration;
    return role === 'client' ? roles[0].illustration : roles[1].illustration;
  };

  const getCurrentTitle = () => {
    if (step === 1) return t('Choose your role');
    return role === 'client' ? t('Join as Client') : t('Join as Craftsman');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-border/50 group"
        aria-label={t('Go to home')}
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
              <img
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
                {t('Select your role to get started')}
              </p>
            )}
            {step === 2 && (
              <p className="text-muted-foreground">
                {role === 'client'
                  ? t('Connect with skilled craftsmen for your projects')
                  : t('Showcase your skills and find new opportunities')}
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
                  {t('Get Started')}
                </h2>
                <p className="text-muted-foreground">
                  {t('Choose how you want to use our platform')}
                </p>
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

                    <div className="flex-1 text-left min-h-0">
                      <div className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {t(r.label)}
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm line-clamp-2">
                        {t(r.desc)}
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
                  {t('Already have an account?')}{' '}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {t('nav.login')}
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
                  onClick={() => {
                    setStep(1);
                    setSearchParams({});
                  }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Go back"
                >
                  {lang === 'en' ? (
                    <FaArrowLeft className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <FaArrowLeft className="w-6 h-6 text-muted-foreground transform rotate-180" />
                  )}
                </button>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('Complete Registration')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('Fill in your details to create your account')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <Input
                  name="full_name"
                  type="text"
                  label={t('Full Name')}
                  placeholder={t('Enter your full name')}
                  value={form.full_name}
                  onChange={handleChange}
                  error={fieldErrors.full_name}
                  autoComplete="name"
                />

                {/* Email Field */}
                <Input
                  name="email"
                  type="email"
                  label={t('Email')}
                  placeholder={t('Enter your email address')}
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  autoComplete="email"
                />

                {/* Phone Field */}
                <Input
                  name="phone"
                  type="tel"
                  label={t('Phone')}
                  placeholder={t('Enter your phone number')}
                  value={form.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  autoComplete="tel"
                />

                {/* Password Field */}
                <Input
                  name="password"
                  type="password"
                  label={t('Password')}
                  placeholder={t('Create a strong password')}
                  value={form.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  showPasswordToggle
                  autoComplete="new-password"
                />

                {/* Country Field */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {t('Country')}
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted text-muted-foreground border-border cursor-not-allowed select-none relative">
                    <span className="font-semibold text-foreground">
                      {form.country}
                    </span>
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {t('Default')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'Currently supported country. More countries coming soon!'
                    )}
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
                    {t('I agree to the')}{' '}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {t('Terms and Conditions')}
                    </Link>
                  </label>
                </div>

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
                      {t('Creating Account...')}
                    </div>
                  ) : (
                    t('Create Account')
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('Already have an account?')}{' '}
                    <Link
                      to="/auth/login"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {t('nav.login')}
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
};

export default RegisterPage;
