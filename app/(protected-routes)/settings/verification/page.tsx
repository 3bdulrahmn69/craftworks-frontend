'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  HiIdentification,
  HiCloudArrowUp,
  HiCheckCircle,
  HiExclamationTriangle,
  HiArrowLeft,
} from 'react-icons/hi2';
import { Button } from '@/app/components/ui/button';
import SettingsPageHeader from '@/app/components/settings/settings-page-header';
import { userService } from '@/app/services/user';
import { toastService } from '@/app/utils/toast';
import { useSession } from 'next-auth/react';
import { User } from '@/app/types/user';
import { useAuth } from '@/app/hooks/useAuth';

interface FileWithPreview extends File {
  preview?: string;
}

const VerificationSettings = () => {
  const { token } = useAuth();
  const { data: session } = useSession();
  const t = useTranslations('settings.verification');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStep, setSelectedStep] = useState<
    'select' | 'upload' | 'submitted'
  >('select');
  const [frontImage, setFrontImage] = useState<FileWithPreview | null>(null);
  const [backImage, setBackImage] = useState<FileWithPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState<{ front: boolean; back: boolean }>({
    front: false,
    back: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const userData = await userService.getMe(session.accessToken);
        setUser(userData);

        // Set initial step based on verification status
        if (userData.verificationStatus === 'rejected') {
          setSelectedStep('submitted'); // Show rejected message first
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken]);

  const processFile = useCallback(
    (file: File, type: 'front' | 'back') => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastService.error(t('messages.invalidFileType'));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toastService.error(t('messages.fileTooLarge'));
        return;
      }

      // Create preview URL
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (type === 'front') {
        // Clean up previous preview
        if (frontImage?.preview) {
          URL.revokeObjectURL(frontImage.preview);
        }
        setFrontImage(fileWithPreview);
      } else {
        // Clean up previous preview
        if (backImage?.preview) {
          URL.revokeObjectURL(backImage.preview);
        }
        setBackImage(fileWithPreview);
      }
    },
    [frontImage, backImage, t]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
      const file = event.target.files?.[0];
      if (!file) return;

      processFile(file, type);
    },
    [processFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, type: 'front' | 'back') => {
      e.preventDefault();
      setDragOver((prev) => ({ ...prev, [type]: true }));
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent, type: 'front' | 'back') => {
      e.preventDefault();
      setDragOver((prev) => ({ ...prev, [type]: false }));
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'front' | 'back') => {
      e.preventDefault();
      setDragOver((prev) => ({ ...prev, [type]: false }));

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0], type);
      }
    },
    [processFile]
  );

  const removeImage = useCallback(
    (type: 'front' | 'back') => {
      if (type === 'front' && frontImage?.preview) {
        URL.revokeObjectURL(frontImage.preview);
        setFrontImage(null);
      } else if (type === 'back' && backImage?.preview) {
        URL.revokeObjectURL(backImage.preview);
        setBackImage(null);
      }
    },
    [frontImage, backImage]
  );

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      toastService.error(t('messages.bothImagesRequired'));
      return;
    }

    if (!token) {
      toastService.error(t('messages.loginRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      await userService.submitVerification(token, [frontImage, backImage], {
        docNames: ['ID Card Front', 'ID Card Back'],
        docTypes: ['ID-Card', 'ID-Card'],
      });

      // Clean up file previews
      if (frontImage?.preview) URL.revokeObjectURL(frontImage.preview);
      if (backImage?.preview) URL.revokeObjectURL(backImage.preview);

      setFrontImage(null);
      setBackImage(null);
      setSelectedStep('submitted');
      setJustSubmitted(true);

      // Update user status to pending after successful submission
      setUser((prev) =>
        prev ? { ...prev, verificationStatus: 'pending' } : null
      );

      toastService.success(t('messages.success'));
    } catch (error: any) {
      console.error('Verification submission error:', error);
      toastService.error(error.response?.data?.message || t('messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = frontImage && backImage && !isSubmitting;

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto space-y-6">
        <SettingsPageHeader title={t('title')} description={t('subtitle')} />
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  // Only allow craftsmen to access verification
  if (user?.role !== 'craftsman') {
    return (
      <main
        className="max-w-2xl mx-auto space-y-6"
        role="main"
        aria-labelledby="page-title"
      >
        <SettingsPageHeader title={t('title')} description={t('subtitle')} />
        <div id="page-title" className="sr-only">
          {t('title')}
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <HiExclamationTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('craftsmanOnly')}
            </h2>
            <p className="text-muted-foreground">{t('craftsmanOnly')}</p>
          </div>
        </div>
      </main>
    );
  }

  // Show status if already verified or pending
  if (user?.verificationStatus === 'verified') {
    return (
      <main
        className="max-w-2xl mx-auto space-y-6"
        role="main"
        aria-labelledby="page-title"
      >
        <SettingsPageHeader title={t('title')} description={t('subtitle')} />
        <div id="page-title" className="sr-only">
          {t('title')}
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <HiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('status.verified.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('status.verified.message')}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (user?.verificationStatus === 'pending') {
    return (
      <main
        className="max-w-2xl mx-auto space-y-6"
        role="main"
        aria-labelledby="page-title"
      >
        <SettingsPageHeader title={t('title')} description={t('subtitle')} />
        <div id="page-title" className="sr-only">
          {t('title')}
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <HiExclamationTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('status.pending.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('status.pending.message')}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show rejected status only if user hasn't started resubmission process
  if (user?.verificationStatus === 'rejected' && selectedStep === 'submitted') {
    return (
      <main
        className="max-w-2xl mx-auto space-y-6"
        role="main"
        aria-labelledby="page-title"
      >
        <SettingsPageHeader title={t('title')} description={t('subtitle')} />
        <div id="page-title" className="sr-only">
          {t('title')}
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HiExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t('status.rejected.title')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t('status.rejected.message')}
              </p>
            </div>
            <Button
              onClick={() => setSelectedStep('select')}
              className="mx-auto"
            >
              {t('buttons.submitNew')}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="max-w-2xl mx-auto space-y-6"
      role="main"
      aria-labelledby="page-title"
    >
      <SettingsPageHeader title={t('title')} description={t('subtitle')} />
      <div id="page-title" className="sr-only">
        {t('title')}
      </div>

      {selectedStep === 'select' && (
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t('sections.chooseMethod')}
          </h2>

          <div
            className="border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedStep('upload')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <HiIdentification className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t('methods.idCard.title')}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {t('methods.idCard.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStep === 'upload' && (
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStep('select')}
              className="p-2 hover:bg-muted/50 transition-colors"
              aria-label="Go back to verification method selection"
            >
              <HiArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {t('sections.upload')}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('instructions.description')}
            </p>

            {/* Front Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('fields.frontSide')} *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragOver.front
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary'
                }`}
                onDragOver={(e) => handleDragOver(e, 'front')}
                onDragLeave={(e) => handleDragLeave(e, 'front')}
                onDrop={(e) => handleDrop(e, 'front')}
              >
                {frontImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={frontImage.preview || ''}
                        alt={t('upload.frontAlt')}
                        width={300}
                        height={200}
                        className="max-w-full max-h-48 rounded-lg object-contain"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: '12rem',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm text-foreground">
                        {frontImage.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('front')}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('upload.remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <HiCloudArrowUp className="mx-auto w-12 h-12 text-muted-foreground" />
                    <div>
                      <label htmlFor="front-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">
                          {t('upload.clickToUpload')}
                        </span>
                        <span className="text-muted-foreground">
                          {' '}
                          {t('upload.dragAndDrop')}
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('upload.fileTypes')}
                      </p>
                    </div>
                    <input
                      id="front-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Back Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('fields.backSide')} *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragOver.back
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary'
                }`}
                onDragOver={(e) => handleDragOver(e, 'back')}
                onDragLeave={(e) => handleDragLeave(e, 'back')}
                onDrop={(e) => handleDrop(e, 'back')}
              >
                {backImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={backImage.preview || ''}
                        alt={t('upload.backAlt')}
                        width={300}
                        height={200}
                        className="max-w-full max-h-48 rounded-lg object-contain"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: '12rem',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm text-foreground">
                        {backImage.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('back')}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('upload.remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <HiCloudArrowUp className="mx-auto w-12 h-12 text-muted-foreground" />
                    <div>
                      <label htmlFor="back-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">
                          {t('upload.clickToUpload')}
                        </span>
                        <span className="text-muted-foreground">
                          {' '}
                          {t('upload.dragAndDrop')}
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('upload.fileTypes')}
                      </p>
                    </div>
                    <input
                      id="back-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    {t('tips.title')}
                  </p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• {t('tips.readable')}</li>
                    <li>• {t('tips.lighting')}</li>
                    <li>• {t('tips.fullFrame')}</li>
                    <li>• {t('tips.flatSurface')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedStep('select')}
              disabled={isSubmitting}
            >
              {t('buttons.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
              loadingText={t('buttons.submitting')}
              className="flex-1"
            >
              {t('buttons.submit')}
            </Button>
          </div>
        </div>
      )}

      {selectedStep === 'submitted' && (
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <HiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {justSubmitted
                  ? t('status.submitted.title')
                  : t('status.submitted.title')}
              </h2>
              <p className="text-muted-foreground">
                {justSubmitted
                  ? t('status.submitted.message')
                  : t('status.submitted.message')}
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              {t('buttons.done')}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default VerificationSettings;
