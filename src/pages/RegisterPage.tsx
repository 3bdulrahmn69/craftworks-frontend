import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    role: 'client',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role as 'client' | 'craftsman',
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || t('Registration failed'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-card rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t('nav.register')}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="full_name"
          type="text"
          placeholder={t('Full Name')}
          value={form.full_name}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          required
        />
        <input
          name="email"
          type="email"
          placeholder={t('Email')}
          value={form.email}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder={t('Password')}
          value={form.password}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
        >
          <option value="client">{t('Client')}</option>
          <option value="craftsman">{t('Craftsman')}</option>
        </select>
        {error && <div className="text-destructive text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? t('Loading...') : t('nav.register')}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        {t('Already have an account?')}{' '}
        <Link to="/auth/login" className="text-primary underline">
          {t('nav.login')}
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
