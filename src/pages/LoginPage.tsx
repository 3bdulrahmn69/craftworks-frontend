import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || t('Login failed'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-card rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('nav.login')}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder={t('Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded"
          required
        />
        {error && <div className="text-destructive text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? t('Loading...') : t('nav.login')}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        {t("Don't have an account?")}{' '}
        <Link to="/auth/register" className="text-primary underline">
          {t('nav.register')}
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
