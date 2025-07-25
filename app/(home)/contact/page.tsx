'use client';

import Container from '@/app/components/ui/container';
import Input from '@/app/components/auth/input';
import Button from '@/app/components/ui/button';
import { useState } from 'react';
import { sendEmail } from '@/app/services/email';
import { toast } from 'react-toastify';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function Contact() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendEmail(form.name, form.email, form.message);
      setForm({ name: '', email: '', message: '' });
      toast.success(t('success'));
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* Hero Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-foreground drop-shadow-lg tracking-tight">
          {t('title')}
        </h1>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
          {t('description')}
        </p>
        {/* Floating Form Card */}
        <div className="w-full max-w-xl mx-auto bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 mb-12 animate-fadeIn">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {t('formTitle')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('form.name')}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t('form.namePlaceholder')}
              required
            />
            <Input
              label={t('form.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('form.emailPlaceholder')}
              required
            />
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                {t('form.message')}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t('form.messagePlaceholder')}
                required
                rows={5}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/30 bg-background text-foreground transition-all duration-200 border-border focus:border-primary resize-none"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full transition-transform duration-200 hover:scale-[1.03] shadow-md"
              disabled={submitting}
            >
              {submitting ? t('form.sending') : t('form.send')}
            </Button>
          </form>
        </div>
        {/* Details Section */}
        <div className="w-full max-w-2xl mx-auto bg-background/80 rounded-2xl border border-border shadow p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 p-3 rounded-full">
              <FaEnvelope className="text-primary w-6 h-6" />
            </span>
            <div>
              <div className="text-sm text-muted-foreground">
                {t('details.emailLabel')}
              </div>
              <a
                href="mailto:craftworkssite@gmail.com"
                className="text-base text-primary underline hover:text-primary/80 transition-colors font-semibold"
              >
                craftworkssite@gmail.com
              </a>
            </div>
          </div>
          <div className="hidden md:block h-10 w-0.5 bg-border rounded-full" />
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 p-3 rounded-full">
              <FaMapMarkerAlt className="text-primary w-6 h-6" />
            </span>
            <div>
              <div className="text-sm text-muted-foreground">
                {t('details.locationLabel')}
              </div>
              <div className="text-base text-foreground font-semibold">
                {t('details.location')}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
