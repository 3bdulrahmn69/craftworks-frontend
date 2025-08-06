'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  HiIdentification,
  HiCloudArrowUp,
  HiCheckCircle,
  HiExclamationTriangle,
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStep, setSelectedStep] = useState<
    'select' | 'upload' | 'submitted'
  >('select');
  const [frontImage, setFrontImage] = useState<FileWithPreview | null>(null);
  const [backImage, setBackImage] = useState<FileWithPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const userData = await userService.getMe(session.accessToken);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastService.error('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toastService.error('File size must be less than 10MB');
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
    [frontImage, backImage]
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
      toastService.error(
        'Please upload both front and back images of your ID card'
      );
      return;
    }

    if (!token) {
      toastService.error('Please log in to submit verification');
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
      toastService.success('Verification documents submitted successfully');
    } catch (error: any) {
      console.error('Verification submission error:', error);
      toastService.error(
        error.response?.data?.message ||
          'Failed to submit verification documents'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = frontImage && backImage && !isSubmitting;

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto space-y-6">
        <SettingsPageHeader
          title="Account Verification"
          description="Loading your account information..."
        />
        <div className="text-center">Loading...</div>
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
        <SettingsPageHeader
          title="Account Verification"
          description="Verify your identity to unlock all craftsman features and build trust with clients"
        />
        <div id="page-title" className="sr-only">
          Account Verification Settings
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <HiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Account Verified
            </h2>
            <p className="text-muted-foreground">
              Your account has been successfully verified. You now have access
              to all craftsman features.
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
        <SettingsPageHeader
          title="Account Verification"
          description="Verify your identity to unlock all craftsman features and build trust with clients"
        />
        <div id="page-title" className="sr-only">
          Account Verification Settings
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <HiExclamationTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Verification Pending
            </h2>
            <p className="text-muted-foreground">
              Your verification documents have been submitted and are currently
              under review. You will be notified once the verification process
              is complete.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (user?.verificationStatus === 'rejected') {
    return (
      <main
        className="max-w-2xl mx-auto space-y-6"
        role="main"
        aria-labelledby="page-title"
      >
        <SettingsPageHeader
          title="Account Verification"
          description="Verify your identity to unlock all craftsman features and build trust with clients"
        />
        <div id="page-title" className="sr-only">
          Account Verification Settings
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HiExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Verification Rejected
              </h2>
              <p className="text-muted-foreground mb-4">
                Unfortunately, your verification documents were rejected. Please
                review your documents and submit new ones that meet our
                requirements.
              </p>
            </div>
            <Button
              onClick={() => setSelectedStep('select')}
              className="mx-auto"
            >
              Submit New Documents
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
      <SettingsPageHeader
        title="Account Verification"
        description="Verify your identity to unlock all craftsman features and build trust with clients"
      />
      <div id="page-title" className="sr-only">
        Account Verification Settings
      </div>

      {selectedStep === 'select' && (
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Choose Verification Method
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
                  ID Card Verification
                </h3>
                <p className="text-muted-foreground mt-1">
                  Upload front and back images of your government-issued ID card
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
              className="p-2"
            >
              ←
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              ID Card Upload
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please upload clear, high-quality images of both sides of your ID
              card. Make sure all text is readable and the images are well-lit.
            </p>

            {/* Front Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Front Side of ID Card *
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                {frontImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={frontImage.preview || ''}
                        alt="ID Front"
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
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <HiCloudArrowUp className="mx-auto w-12 h-12 text-muted-foreground" />
                    <div>
                      <label htmlFor="front-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">
                          Click to upload
                        </span>
                        <span className="text-muted-foreground">
                          {' '}
                          or drag and drop
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, JPEG up to 10MB
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
                Back Side of ID Card *
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                {backImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={backImage.preview || ''}
                        alt="ID Back"
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
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <HiCloudArrowUp className="mx-auto w-12 h-12 text-muted-foreground" />
                    <div>
                      <label htmlFor="back-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">
                          Click to upload
                        </span>
                        <span className="text-muted-foreground">
                          {' '}
                          or drag and drop
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, JPEG up to 10MB
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
                    Tips for better verification:
                  </p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Ensure all text on the ID is clearly readable</li>
                    <li>• Use good lighting and avoid shadows</li>
                    <li>• Make sure the entire ID is visible in the frame</li>
                    <li>• Use a flat surface for the best image quality</li>
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
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              className="flex-1"
            >
              Submit Verification
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
                Verification Submitted!
              </h2>
              <p className="text-muted-foreground">
                Your ID card verification has been submitted successfully. Our
                team will review your documents and notify you of the result
                within 1-3 business days.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Done
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default VerificationSettings;
