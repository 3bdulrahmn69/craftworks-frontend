'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Button } from '@/app/components/ui/button';
import { userService, ChangePasswordData } from '@/app/services/user';
import { HiLockClosed } from 'react-icons/hi2';
import Input from '@/app/components/ui/input';

import SettingsPageHeader from '@/app/components/settings/settings-page-header';

const SecuritySettings = () => {
  const { data: session } = useSession();
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
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        'New password must be different from current password';
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

      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Failed to change password:', error);

      // Handle specific error messages
      if (error.response?.data?.message) {
        if (
          error.response.data.message.toLowerCase().includes('current password')
        ) {
          setErrors({ currentPassword: 'Current password is incorrect' });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to change password. Please try again.');
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
      <SettingsPageHeader
        title="Security Settings"
        description="Manage your password and security preferences"
      />
      <div id="security-page-title" className="sr-only">
        Security Settings
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
              Change Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
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
              label="Current Password"
              placeholder="Enter your current password"
              required
              showPasswordToggle={true}
              error={errors.currentPassword}
              aria-describedby="current-password-help"
            />
            <p id="current-password-help" className="sr-only">
              Enter your current password to verify your identity
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
              label="New Password"
              placeholder="Enter your new password"
              required
              showPasswordToggle={true}
              error={errors.newPassword}
              aria-describedby="new-password-requirements"
            />
            <div
              id="new-password-requirements"
              className="mt-2 text-xs text-muted-foreground"
            >
              <p>Password requirements:</p>
              <ul className="list-disc list-inside ml-2 space-y-1" role="list">
                <li>At least 8 characters long</li>
                <li>Contains at least one uppercase letter</li>
                <li>Contains at least one lowercase letter</li>
                <li>Contains at least one number</li>
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
                  <span className="sr-only">Changing password...</span>
                  <span aria-hidden="true">Changing Password...</span>
                </>
              ) : (
                'Change Password'
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
