'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { Button } from '@/app/components/ui/button';
import SettingsPageHeader from '@/app/components/settings/settings-page-header';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import { userService, UpdateUserData } from '@/app/services/user';
import servicesAPI, {
  getServiceName,
  getServiceDescription,
} from '@/app/services/services';
import { User } from '@/app/types/user';
import { Service } from '@/app/types/jobs';

import { HiCamera, HiTrash, HiUser } from 'react-icons/hi2';
import Input from '@/app/components/ui/input';
import DropdownSelector from '@/app/components/ui/dropdown-selector';

const PersonalSettings = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('settings.personal');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [deletingPortfolio, setDeletingPortfolio] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: {
      state: '',
      city: '',
      street: '',
    },
    serviceId: '',
    bio: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        const [userData, servicesData] = await Promise.all([
          userService.getMe(session.accessToken),
          servicesAPI.getAllServices(locale),
        ]);

        setUser(userData);
        setServices(servicesData.data || []);
        setFormData({
          fullName: userData.fullName,
          phone: userData.phone,
          address: {
            state: userData.address.state,
            city: userData.address.city,
            street: userData.address.street,
          },
          serviceId: userData.service?._id || '',
          bio: userData.bio || '',
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken, locale]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      // Skip country changes as it's not editable
      if (addressField === 'country') return;

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setHasChanges(true);
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceId,
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !user) return;

    setSaving(true);
    try {
      const updateData: UpdateUserData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: {
          country: user.address.country,
          state: formData.address.state,
          city: formData.address.city,
          street: formData.address.street,
        },
        serviceId: formData.serviceId || undefined,
        bio: formData.bio || undefined,
      };

      const updatedUser = await userService.updateProfile(
        session.accessToken,
        updateData
      );
      setUser(updatedUser);
      setHasChanges(false);
      toast.success(t('messages.saveSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.accessToken) return;

    setUploadingImage(true);
    try {
      const updatedUser = await userService.uploadProfilePicture(
        session.accessToken,
        file
      );
      setUser(updatedUser);
      toast.success(t('messages.imageUploadSuccess'));
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(t('messages.imageUploadError'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!session?.accessToken || !user?.profilePicture) return;

    setDeletingImage(true);
    try {
      const updatedUser = await userService.deleteProfilePicture(
        session.accessToken
      );
      setUser(updatedUser);
      toast.success(t('messages.imageDeleteSuccess'));
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error(t('messages.imageDeleteError'));
    } finally {
      setDeletingImage(false);
    }
  };

  const handlePortfolioUpload = async (files: FileList) => {
    if (!session?.accessToken || !files.length) return;

    const maxFiles = 5;
    const currentCount = user?.portfolioImageUrls?.length || 0;

    if (currentCount + files.length > maxFiles) {
      toast.error(t('messages.portfolioMaxLimit'));
      return;
    }

    setUploadingPortfolio(true);
    try {
      const fileArray = Array.from(files);
      const updatedUser = await userService.uploadPortfolioImages(
        session.accessToken,
        fileArray
      );
      setUser(updatedUser);
      toast.success(t('messages.portfolioUploadSuccess'));
    } catch (error) {
      console.error('Failed to upload portfolio images:', error);
      toast.error(t('messages.portfolioUploadError'));
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handlePortfolioDelete = async (imageUrl: string) => {
    if (!session?.accessToken) return;

    setDeletingPortfolio(true);
    try {
      const updatedUser = await userService.deletePortfolioImage(
        session.accessToken,
        imageUrl
      );
      setUser(updatedUser);
      toast.success(t('messages.portfolioDeleteSuccess'));
    } catch (error) {
      console.error('Failed to delete portfolio image:', error);
      toast.error(t('messages.portfolioDeleteError'));
    } finally {
      setDeletingPortfolio(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div
            className="animate-pulse"
            role="status"
            aria-label="Loading user data"
          >
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <span className="sr-only">Loading your profile information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <p
            className="text-center text-muted-foreground"
            role="alert"
            aria-live="polite"
          >
            Failed to load user data. Please try refreshing the page.
          </p>
        </div>
      </div>
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
        {t('title')} Settings
      </div>

      {/* Profile Picture Section */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t('sections.profilePicture')}
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`Profile picture of ${user.fullName}`}
                width={128}
                height={128}
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full object-cover border-2 border-border flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
                role="img"
                aria-label="Default profile picture placeholder"
              >
                <HiUser
                  className="w-12 h-12 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            )}
            {!user.profilePicture ? (
              <label className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer focus-within:opacity-100">
                <HiCamera className="w-6 h-6 text-white" aria-hidden="true" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={uploadingImage}
                  aria-label="Upload profile picture"
                />
              </label>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/75 rounded-full opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100">
                <label className="cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-white rounded">
                  <HiCamera className="w-6 h-6 text-white" aria-hidden="true" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={uploadingImage}
                    aria-label="Change profile picture"
                  />
                </label>
                <button
                  aria-label="Delete profile picture"
                  className="focus:outline-none focus:ring-2 focus:ring-white rounded"
                  onClick={handleImageDelete}
                  disabled={deletingImage}
                >
                  <HiTrash
                    className={`w-6 h-6 text-destructive`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
            {(deletingImage || uploadingImage) && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-full"
                aria-live="polite"
                aria-label={
                  uploadingImage
                    ? t('messages.uploading')
                    : t('messages.deleting')
                }
              >
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t('helpText.profilePictureHelp')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('helpText.profilePictureFormat')}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t('sections.basicInfo')}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Personal information form"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                id="full-name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                label={t('fields.fullName')}
                required
                aria-describedby="fullname-validation"
              />
              <div id="fullname-validation" className="sr-only">
                {!formData.fullName && t('validation.fullNameRequired')}
              </div>
            </div>
            <div>
              <Input
                id="phone-number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                label={t('fields.phone')}
                required
                aria-describedby="phone-validation"
              />
              <div id="phone-validation" className="sr-only">
                {!formData.phone && t('validation.phoneRequired')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                id="email-address"
                type="email"
                value={user.email}
                label={t('fields.email')}
                disabled
                aria-describedby="email-help-text"
              />
              <p
                id="email-help-text"
                className="text-xs text-muted-foreground mt-1"
              >
                {t('helpText.emailReadonly')}
              </p>
            </div>
            <div>
              <Input
                id="user-role"
                type="text"
                value={user.role}
                label={t('fields.role')}
                aria-describedby="role-help-text"
                disabled
              />
              <p
                id="role-help-text"
                className="text-xs text-muted-foreground mt-1 sr-only"
              >
                {t('helpText.roleReadonly')}
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-md font-semibold text-foreground mb-4">
              {t('sections.address')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DropdownSelector
                  id="country-selector"
                  label={t('fields.country')}
                  options={[
                    { id: user.address.country, label: user.address.country },
                  ]}
                  value={user.address.country}
                  onChange={() => {}}
                  disabled={true}
                  helpText={t('helpText.countryReadonly')}
                  allowEmpty={false}
                />
              </div>
              <div>
                <Input
                  id="address-state"
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  label={t('fields.state')}
                  required
                  aria-describedby="state-validation"
                />
                <div id="state-validation" className="sr-only">
                  {!formData.address.state && t('validation.stateRequired')}
                </div>
              </div>
              <div>
                <Input
                  id="address-city"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  label={t('fields.city')}
                  required
                  aria-describedby="city-validation"
                />
                <div id="city-validation" className="sr-only">
                  {!formData.address.city && t('validation.cityRequired')}
                </div>
              </div>
              <div>
                <Input
                  id="address-street"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  label={t('fields.street')}
                  required
                  aria-describedby="street-validation"
                />
                <div id="street-validation" className="sr-only">
                  {!formData.address.street && t('validation.streetRequired')}
                </div>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          {user?.role === 'craftsman' && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-md font-semibold text-foreground mb-4">
                {t('sections.serviceInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DropdownSelector
                    id="service-selector"
                    label={t('fields.service')}
                    options={services.map((service) => ({
                      id: service._id,
                      label: getServiceName(service, locale),
                      description: getServiceDescription(service, locale),
                    }))}
                    value={formData.serviceId}
                    onChange={handleServiceChange}
                    placeholder={t('placeholders.selectService')}
                    helpText={t('helpText.serviceHelp')}
                    allowEmpty={true}
                    emptyLabel={t('emptyStates.noService')}
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-4">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t('fields.bio')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={t('placeholders.bioPlaceholder')}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('helpText.bioHelp')}
                </p>
              </div>
            </div>
          )}

          {/* Portfolio Section for Craftsmen */}
          {user?.role === 'craftsman' && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-md font-semibold text-foreground mb-4">
                {t('sections.portfolio')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('helpText.portfolioHelp')}
              </p>

              {/* Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('buttons.uploadPortfolio')}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) =>
                    e.target.files && handlePortfolioUpload(e.target.files)
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={
                    uploadingPortfolio ||
                    (user?.portfolioImageUrls?.length || 0) >= 5
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('helpText.portfolioFormat')}
                </p>
              </div>

              {/* Portfolio Images Grid */}
              {user?.portfolioImageUrls &&
                user.portfolioImageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {user.portfolioImageUrls.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden bg-muted border border-border group"
                      >
                        <Image
                          src={imageUrl}
                          alt={`Portfolio image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handlePortfolioDelete(imageUrl)}
                            disabled={deletingPortfolio}
                            className="bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 transition-colors"
                            aria-label={`Delete portfolio image ${index + 1}`}
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                        {deletingPortfolio && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                            <div className="text-white">
                              {t('messages.deleting')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {uploadingPortfolio && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {t('messages.uploadingPortfolio')}
                  </span>
                </div>
              )}

              {(!user?.portfolioImageUrls ||
                user.portfolioImageUrls.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('emptyStates.noPortfolio')}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-3">
              {hasChanges && (
                <>
                  <span
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                    role="status"
                  >
                    {t('messages.unsavedChanges')}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (user) {
                        setFormData({
                          fullName: user.fullName,
                          phone: user.phone,
                          address: {
                            state: user.address.state,
                            city: user.address.city,
                            street: user.address.street,
                          },
                          serviceId: user.service?._id || '',
                          bio: user.bio || '',
                        });
                        setHasChanges(false);
                      }
                    }}
                    aria-describedby="reset-button-description"
                  >
                    {t('buttons.reset')}
                  </Button>
                  <span id="reset-button-description" className="sr-only">
                    Reset all changes to original values
                  </span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className={!hasChanges ? 'opacity-50' : ''}
              aria-describedby="save-button-description"
            >
              {saving ? (
                <>
                  <span className="sr-only">{t('buttons.saving')}</span>
                  <span aria-hidden="true">{t('buttons.saving')}</span>
                </>
              ) : (
                t('buttons.save')
              )}
            </Button>
            <span id="save-button-description" className="sr-only">
              {!hasChanges
                ? t('messages.noChanges')
                : saving
                ? 'Currently saving your changes'
                : 'Save your profile changes'}
            </span>
          </div>
        </form>
      </div>
    </main>
  );
};

export default PersonalSettings;
