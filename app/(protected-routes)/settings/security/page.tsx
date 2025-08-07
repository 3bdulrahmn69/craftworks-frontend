'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { Button } from '@/app/components/ui/button';
import { userService, ChangePasswordData } from '@/app/services/user';
import { HiLockClosed } from 'react-icons/hi2';
import Input from '@/app/components/ui/input';

import SettingsPageHeader from '@/app/components/settings/settings-page-header';

const SecuritySettings = () => {
  const { data: session } = useSession();
  const t = useTranslations('settings.security');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t('validation.currentPasswordRequired');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('validation.newPasswordRequired');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('validation.passwordTooShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = t('validation.passwordWeak');
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = t('validation.passwordSame');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !validateForm()) return;

    setSaving(true);
    try {
      await userService.changePassword(session.accessToken, formData);

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
      });

      toast.success(t('messages.success'));
    } catch (error: any) {
      console.error('Failed to change password:', error);

      // Handle specific error messages
      if (error.response?.data?.message) {
        if (
          error.response.data.message.toLowerCase().includes('current password')
        ) {
          setErrors({
            currentPassword: t('messages.currentPasswordIncorrect'),
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(t('messages.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="max-w-2xl mx-auto space-y-6"
      role="main"
      aria-labelledby="security-page-title"
    >
      <SettingsPageHeader title={t('title')} description={t('subtitle')} />
      <div id="security-page-title" className="sr-only">
        {t('title')}
      </div>

      {/* Change Password Section */}
      <section
        className="bg-card rounded-xl shadow p-6"
        aria-labelledby="change-password-heading"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2 bg-primary/10 rounded-xl"
            role="img"
            aria-label="Security icon"
          >
            <HiLockClosed className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="change-password-heading"
              className="text-lg font-semibold text-foreground"
            >
              {t('sections.changePassword')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Change password form"
          noValidate
        >
          {/* Current Password */}
          <div>
            <Input
              id="current-password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              label={t('fields.currentPassword')}
              placeholder={t('placeholders.currentPassword')}
              required
              showPasswordToggle={true}
              error={errors.currentPassword}
              aria-describedby="current-password-help"
            />
            <p id="current-password-help" className="sr-only">
              {t('helpText.currentPasswordHelp')}
            </p>
          </div>

          {/* New Password */}
          <div>
            <Input
              id="new-password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              label={t('fields.newPassword')}
              placeholder={t('placeholders.newPassword')}
              required
              showPasswordToggle={true}
              error={errors.newPassword}
              aria-describedby="new-password-requirements"
            />
            <div
              id="new-password-requirements"
              className="mt-2 text-xs text-muted-foreground"
            >
              <p>{t('helpText.passwordRequirements')}</p>
              <ul className="list-disc list-inside ml-2 space-y-1" role="list">
                <li>{t('helpText.requirements.length')}</li>
                <li>{t('helpText.requirements.uppercase')}</li>
                <li>{t('helpText.requirements.lowercase')}</li>
                <li>{t('helpText.requirements.number')}</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              aria-describedby="submit-button-description"
            >
              {saving ? (
                <>
                  <span className="sr-only">
                    {t('buttons.changingPassword')}
                  </span>
                  <span aria-hidden="true">
                    {t('buttons.changingPassword')}
                  </span>
                </>
              ) : (
                t('buttons.changePassword')
              )}
            </Button>
            <span id="submit-button-description" className="sr-only">
              {saving
                ? 'Currently changing your password'
                : 'Submit form to change your password'}
            </span>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SecuritySettings;
