'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/components/ui/button';
import { userService, UpdateUserData } from '@/app/services/user';
import { User } from '@/app/types/user';
import { HiCamera } from 'react-icons/hi2';
import Image from 'next/image';

import SettingsPageHeader from '@/app/components/settings/settings-page-header';

const PersonalSettings = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: {
      country: '',
      state: '',
      city: '',
      street: '',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        const userData = await userService.getMe(session.accessToken);
        setUser(userData);
        setFormData({
          fullName: userData.fullName,
          phone: userData.phone,
          address: userData.address,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setSaving(true);
    try {
      const updateData: UpdateUserData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      };

      const updatedUser = await userService.updateProfile(
        session.accessToken,
        updateData
      );
      setUser(updatedUser);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
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
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <p className="text-center text-muted-foreground">
            Failed to load user data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SettingsPageHeader
        title="Personal Information"
        description="Update your profile details and personal information"
      />

      {/* Profile Picture Section */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Profile Picture
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={user.profilePicture}
              alt="Profile picture"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <HiCamera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <input
                type="text"
                value={user.role}
                className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground capitalize"
                disabled
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-md font-semibold text-foreground mb-4">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Street
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Information (for craftsmen) */}
          {user.service && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-md font-semibold text-foreground mb-4">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    value={user.service.name}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Rating
                  </label>
                  <input
                    type="text"
                    value={`${user.rating} (${user.ratingCount} reviews)`}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground"
                    disabled
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={user.service.description}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground"
                  disabled
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalSettings;
