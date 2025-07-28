'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Button } from '@/app/components/ui/button';
import SettingsPageHeader from '@/app/components/settings/settings-page-header';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import { userService, UpdateUserData } from '@/app/services/user';
import servicesAPI from '@/app/services/services';
import { User } from '@/app/types/user';
import { Category } from '@/app/types/services';

import { HiCamera, HiTrash, HiUser } from 'react-icons/hi2';
import Input from '@/app/components/ui/input';
import DropdownSelector from '@/app/components/ui/dropdown-selector';

const PersonalSettings = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
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
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        const [userData, servicesData] = await Promise.all([
          userService.getMe(session.accessToken),
          servicesAPI.getAllServices(session.accessToken),
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
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
          country: user.address.country, // Keep original country from backend
          state: formData.address.state,
          city: formData.address.city,
          street: formData.address.street,
        },
        serviceId: formData.serviceId || undefined,
      };

      const updatedUser = await userService.updateProfile(
        session.accessToken,
        updateData
      );
      setUser(updatedUser);
      setHasChanges(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image. Please try again.');
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
      toast.success('Profile picture deleted successfully!');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image. Please try again.');
    } finally {
      setDeletingImage(false);
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
      <SettingsPageHeader
        title="Personal Information"
        description="Update your profile details and personal information"
      />
      <div id="page-title" className="sr-only">
        Personal Information Settings
      </div>

      {/* Profile Picture Section */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Profile Picture
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
                    className={`w-6 h-6 text-red-500`}
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
                  uploadingImage ? 'Uploading image...' : 'Deleting image...'
                }
              >
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Click on the image to upload a new profile picture
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG. Max size of 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Basic Information
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
                label="Full Name"
                required
                aria-describedby="fullname-validation"
              />
              <div id="fullname-validation" className="sr-only">
                {!formData.fullName && 'Full name is required'}
              </div>
            </div>
            <div>
              <Input
                id="phone-number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                label="Phone Number"
                required
                aria-describedby="phone-validation"
              />
              <div id="phone-validation" className="sr-only">
                {!formData.phone && 'Phone number is required'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                id="email-address"
                type="email"
                value={user.email}
                label="Email"
                disabled
                aria-describedby="email-help-text"
              />
              <p
                id="email-help-text"
                className="text-xs text-muted-foreground mt-1"
              >
                Email cannot be changed
              </p>
            </div>
            <div>
              <Input
                id="user-role"
                type="text"
                value={user.role}
                label="Role"
                aria-describedby="role-help-text"
                disabled
              />
              <p
                id="role-help-text"
                className="text-xs text-muted-foreground mt-1 sr-only"
              >
                User role cannot be changed
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-md font-semibold text-foreground mb-4">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DropdownSelector
                  id="country-selector"
                  label="Country"
                  options={[
                    { id: user.address.country, label: user.address.country },
                  ]}
                  value={user.address.country}
                  onChange={() => {}}
                  disabled={true}
                  helpText="Country cannot be changed"
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
                  label="State"
                  required
                  aria-describedby="state-validation"
                />
                <div id="state-validation" className="sr-only">
                  {!formData.address.state && 'State is required'}
                </div>
              </div>
              <div>
                <Input
                  id="address-city"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  label="City"
                  required
                  aria-describedby="city-validation"
                />
                <div id="city-validation" className="sr-only">
                  {!formData.address.city && 'City is required'}
                </div>
              </div>
              <div>
                <Input
                  id="address-street"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  label="Street"
                  required
                  aria-describedby="street-validation"
                />
                <div id="street-validation" className="sr-only">
                  {!formData.address.street && 'Street is required'}
                </div>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          {user?.role === 'craftsman' && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-md font-semibold text-foreground mb-4">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DropdownSelector
                    id="service-selector"
                    label="Choose Your Service"
                    options={services.map((service) => ({
                      id: service._id,
                      label: service.name,
                      description: service.description,
                    }))}
                    value={formData.serviceId}
                    onChange={handleServiceChange}
                    placeholder="Select a service"
                    helpText="Select the service you provide to customers"
                    allowEmpty={true}
                    emptyLabel="No service selected"
                  />
                </div>
              </div>
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
                    You have unsaved changes
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
                        });
                        setHasChanges(false);
                      }
                    }}
                    aria-describedby="reset-button-description"
                  >
                    Reset
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
                  <span className="sr-only">Saving changes...</span>
                  <span aria-hidden="true">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <span id="save-button-description" className="sr-only">
              {!hasChanges
                ? 'No changes to save'
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
