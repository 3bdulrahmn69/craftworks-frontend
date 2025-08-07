'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/ui/input';
import DropdownSelector from '@/app/components/ui/dropdown-selector';
import Textarea from '@/app/components/ui/textarea';
import InteractiveMap from '@/app/components/ui/interactive-map';
import { toast } from 'react-toastify';
import { jobsService } from '@/app/services/jobs';
import servicesAPI, { getServiceName } from '@/app/services/services';
import { Service } from '@/app/types/jobs';
import {
  getCurrentLocationAndGeocode,
  reverseGeocode,
} from '@/app/utils/geocoding';
import { getStatesForSelect } from '@/app/data/states';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaFileAlt,
  FaImage,
  FaTrash,
  FaArrowLeft,
  FaCalendarAlt,
} from 'react-icons/fa';

interface JobFormData {
  title: string;
  description: string;
  serviceId: string;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  paymentType: 'cash' | 'visa';
  jobDate: string;
  photos: File[];
  existingPhotos?: string[];
}

const JobManagerPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('createJob');
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're editing an existing job
  const editJobId = searchParams.get('edit');
  const isEditing = !!editJobId;

  // Memoized options for selects to prevent unnecessary re-renders
  const serviceOptions = useMemo(
    () =>
      services.map((service) => ({
        id: service._id,
        label: getServiceName(service, locale),
        value: service._id,
      })),
    [services, locale]
  );

  const stateOptions = useMemo(() => {
    const states = getStatesForSelect(locale as 'en' | 'ar');
    return states.map((state) => ({
      id: state.value,
      label: state.label,
      value: state.value,
    }));
  }, [locale]);

  const paymentTypeOptions = useMemo(
    () => [
      {
        id: 'cash',
        label: t('sections.pricing.paymentType.cash'),
        value: 'cash',
      },
      {
        id: 'visa',
        label: t('sections.pricing.paymentType.visa'),
        value: 'visa',
      },
    ],
    [t]
  );

  const [formData, setFormData] = useState<JobFormData>(() => ({
    title: '',
    description: '',
    serviceId: searchParams.get('serviceId') || '',
    address: {
      country: 'Egypt',
      state: '',
      city: '',
      street: '',
    },
    location: undefined,
    paymentType: 'cash',
    jobDate: '',
    photos: [],
    existingPhotos: [],
  }));

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get user's current location and reverse geocode it
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await getCurrentLocationAndGeocode();

      setFormData((prev) => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [locationData.longitude, locationData.latitude],
        },
        address: {
          ...prev.address,
          state: locationData.state,
          city: locationData.city,
        },
      }));
    } catch (error) {
      console.error('Location/geocoding error:', error);
      toast.error(
        error instanceof Error ? error.message : t('messages.locationError')
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      setFormData((prev) => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      }));

      // Optionally perform reverse geocoding to auto-fill address fields
      try {
        const geocodeResult = await reverseGeocode(lat, lng);
        setFormData((prev) => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          address: {
            ...prev.address,
            state: geocodeResult.state,
            city: geocodeResult.city,
          },
        }));
      } catch (error) {
        // If reverse geocoding fails, just set the coordinates without address
        console.warn('Reverse geocoding failed:', error);
        toast.info(t('messages.locationInfo'));
      }
    },
    [t]
  );

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await servicesAPI.getAllServices(locale);
        if (response.data) {
          setServices(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        toast.error(t('messages.servicesError'));
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [t, locale]);

  // Load job data if editing
  useEffect(() => {
    const loadJobForEdit = async () => {
      if (!editJobId || !session?.accessToken) return;

      try {
        setLoading(true);
        const response = await jobsService.getJob(
          editJobId,
          session.accessToken
        );

        if (response.success && response.data) {
          const job = response.data;

          setFormData({
            title: job.title,
            description: job.description,
            serviceId: job.service?._id || '',
            address:
              typeof job.address === 'string'
                ? {
                    country: 'Egypt',
                    state: '',
                    city: '',
                    street: job.address,
                  }
                : job.address,
            location: job.location,
            paymentType: job.paymentType,
            jobDate: job.jobDate.split('T')[0],
            photos: [],
            existingPhotos: job.photos || [],
          });

          // Set photo previews to show existing photos
          if (job.photos && job.photos.length > 0) {
            setPhotoPreviews(job.photos);
          }
        }
      } catch (err: any) {
        console.error('Failed to load job for editing:', err);
        toast.error(t('messages.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadJobForEdit();
  }, [editJobId, session?.accessToken, t]);

  // Cleanup effect for photo previews and periodic validation
  useEffect(() => {
    // Periodic validation of photos array
    const invalidPhotos = formData.photos.filter(
      (photo) =>
        !(photo instanceof File) ||
        photo.constructor !== File ||
        !photo.size ||
        !photo.name ||
        !photo.type
    );

    if (invalidPhotos.length > 0) {
      console.warn(
        'Found invalid photos in array, cleaning up:',
        invalidPhotos
      );
      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter(
          (photo) =>
            photo instanceof File &&
            photo.constructor === File &&
            photo.size > 0 &&
            photo.name &&
            photo.type
        ),
      }));
    }

    return () => {
      // Cleanup blob URLs on component unmount
      photoPreviews.forEach((preview) => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [photoPreviews, formData.photos]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = t('sections.basicInfo.jobTitle.error');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('sections.basicInfo.description.error');
    }

    if (!formData.serviceId) {
      newErrors.serviceId = t('sections.basicInfo.service.error');
    }

    if (!formData.address.state) {
      newErrors.state = t('sections.location.state.error');
    }

    if (!formData.address.city.trim()) {
      newErrors.city = t('sections.location.city.error');
    }

    if (!formData.address.street.trim()) {
      newErrors.street = t('sections.location.street.error');
    }

    if (!formData.jobDate.trim()) {
      newErrors.jobDate = t('sections.pricing.jobDate.error');
    } else {
      // Check if the selected date is not in the past
      const selectedDate = new Date(formData.jobDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.jobDate = t('sections.pricing.jobDate.pastDateError');
      }
    }

    if (!formData.location) {
      newErrors.location = t('sections.location.gps.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
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
          [name]:
            name === 'jobPrice'
              ? value === ''
                ? 0
                : parseFloat(value) || 0
              : value,
        }));
      }

      // Clear error when user starts typing
      if (errors[name] || errors[name.split('.')[1]]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
          [name.split('.')[1]]: '',
        }));
      }
    },
    [errors]
  );

  // Handle dropdown selector changes
  const handleDropdownChange = useCallback(
    (name: string) => (value: string) => {
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

      // Clear error when user makes selection
      if (errors[name] || errors[name.split('.')[1]]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
          [name.split('.')[1]]: '',
        }));
      }
    },
    [errors]
  );

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      // Calculate total photos (existing + new files + current new files)
      const totalPhotos =
        (formData.existingPhotos?.length || 0) +
        formData.photos.length +
        files.length;

      if (totalPhotos > 5) {
        toast.error(t('messages.maxPhotos'));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validate file types and sizes with ultra-strict validation
      const validFiles: File[] = [];

      files.forEach((file, index) => {
        const validTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // Ultra-strict validation
        if (
          file &&
          typeof file === 'object' &&
          file instanceof File &&
          file.constructor === File &&
          file.size > 0 &&
          file.size <= maxSize &&
          file.name &&
          typeof file.name === 'string' &&
          file.type &&
          typeof file.type === 'string' &&
          validTypes.includes(file.type)
        ) {
          validFiles.push(file);
        } else {
          if (!validTypes.includes(file?.type || '')) {
            toast.error(
              t('messages.invalidFormat', { fileName: file?.name || 'unknown' })
            );
          } else if ((file?.size || 0) > maxSize) {
            toast.error(
              t('messages.fileTooLarge', { fileName: file?.name || 'unknown' })
            );
          } else {
            console.error(`File ${index} failed validation:`, file);
            toast.error(`Invalid file: ${file?.name || 'unknown'}`);
          }
        }
      });

      if (validFiles.length > 0) {
        // Create preview URLs
        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

        // Update state with only valid files
        setFormData((prev) => {
          const updatedPhotos = [...prev.photos, ...validFiles];
          return {
            ...prev,
            photos: updatedPhotos,
          };
        });

        setPhotoPreviews((prev) => [...prev, ...newPreviews]);
      }

      // Clear the file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [formData.existingPhotos?.length, formData.photos.length, t]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const existingPhotosCount = formData.existingPhotos?.length || 0;

      if (index < existingPhotosCount) {
        // Removing an existing photo
        setFormData((prev) => ({
          ...prev,
          existingPhotos:
            prev.existingPhotos?.filter((_, i) => i !== index) || [],
        }));
      } else {
        // Removing a new uploaded photo
        const newPhotoIndex = index - existingPhotosCount;

        // Revoke the URL to prevent memory leaks
        const preview = photoPreviews[index];
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }

        setFormData((prev) => {
          const filteredPhotos = prev.photos.filter(
            (file, i) => i !== newPhotoIndex
          );
          // Ensure all remaining photos are valid
          const validPhotos = filteredPhotos.filter(
            (photo) =>
              photo instanceof File &&
              photo.constructor === File &&
              photo.size > 0 &&
              photo.name &&
              photo.type
          );

          return {
            ...prev,
            photos: validPhotos,
          };
        });
      }

      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [formData.existingPhotos?.length, photoPreviews]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('messages.validationError'));
      return;
    }

    if (!session?.accessToken) {
      toast.error(t('messages.loginRequired'));
      return;
    }

    try {
      setLoading(true);
      const jobFormData = new FormData();

      // Add job data with explicit conversion to strings
      jobFormData.append('title', String(formData.title));
      jobFormData.append('description', String(formData.description));
      jobFormData.append('service', String(formData.serviceId));
      jobFormData.append('address[country]', String(formData.address.country));
      jobFormData.append('address[state]', String(formData.address.state));
      jobFormData.append('address[city]', String(formData.address.city));
      jobFormData.append('address[street]', String(formData.address.street));
      jobFormData.append('paymentType', String(formData.paymentType));
      jobFormData.append('jobDate', String(formData.jobDate));

      // Add location coordinates if available
      if (formData.location) {
        jobFormData.append('location[type]', String(formData.location.type));
        jobFormData.append(
          'location[coordinates]',
          formData.location.coordinates.join(',')
        );
      }

      // Add photos - Only add valid File objects, not URLs or empty objects
      // IMPORTANT: Only append photos field if we have actual valid files
      if (formData.photos && formData.photos.length > 0) {
        // Ultra-strict photo validation
        const validPhotoFiles: File[] = [];

        formData.photos.forEach((photo) => {
          // Multiple checks to ensure it's a valid File
          if (
            photo &&
            typeof photo === 'object' &&
            photo instanceof File &&
            photo.constructor === File &&
            photo.size > 0 &&
            photo.name &&
            typeof photo.name === 'string' &&
            photo.type &&
            typeof photo.type === 'string' &&
            ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
              photo.type
            )
          ) {
            validPhotoFiles.push(photo);
          }
        });

        // Only append photos if we have valid files
        if (validPhotoFiles.length > 0) {
          validPhotoFiles.forEach((photo) => {
            jobFormData.append('photos', photo);
          });
        }
      }

      // For editing: handle existing photos that should remain
      if (
        isEditing &&
        formData.existingPhotos &&
        formData.existingPhotos.length > 0
      ) {
        formData.existingPhotos.forEach((photoUrl) => {
          if (typeof photoUrl === 'string' && photoUrl.trim()) {
            jobFormData.append('existingPhotos', photoUrl);
          }
        });
      }

      // List all FormData entries for final verification
      const formDataEntries: { [key: string]: any } = {};
      let photoCount = 0;
      for (const [key, value] of jobFormData.entries()) {
        if (key === 'photos') {
          photoCount++;
          formDataEntries[`photos_${photoCount}`] = {
            isFile: value instanceof File,
            name: (value as File)?.name,
            size: (value as File)?.size,
            type: (value as File)?.type,
          };
        } else {
          formDataEntries[key] = value;
        }
      }

      // Additional check: ensure no empty objects
      let hasEmptyObjects = false;
      for (const [key, value] of jobFormData.entries()) {
        if (
          key === 'photos' &&
          typeof value === 'object' &&
          !(value instanceof File)
        ) {
          console.error('⚠️ Found non-File object in photos:', value);
          hasEmptyObjects = true;
        }
      }

      if (hasEmptyObjects) {
        throw new Error('Invalid photo objects detected in FormData');
      }

      console.log('Submitting job data:', jobFormData);

      const response = isEditing
        ? await jobsService.updateJob(
            editJobId!,
            jobFormData,
            session.accessToken
          )
        : await jobsService.createJob(jobFormData, session.accessToken);

      if (response.success) {
        toast.success(
          isEditing ? t('messages.updateSuccess') : t('messages.createSuccess')
        );

        // Clear the form if creating a new job
        if (!isEditing) {
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          // Clear photo previews and revoke URLs
          photoPreviews.forEach((preview) => {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          });
          setPhotoPreviews([]);

          // Reset form data
          setFormData((prev) => ({
            ...prev,
            photos: [], // Clear photos array completely
            title: '',
            description: '',
            jobPrice: 0,
            jobDate: '',
            location: undefined,
          }));
        }

        router.push('/sc/my-jobs'); // Redirect to jobs list page
      } else {
        throw new Error(
          response.message ||
            (isEditing ? t('messages.updateError') : t('messages.createError'))
        );
      }
    } catch (err: any) {
      console.error('Failed to create job:', err);
      toast.error(err.message || t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceName =
    searchParams.get('serviceName') ||
    (services.find((s) => s._id === formData.serviceId)
      ? getServiceName(
          services.find((s) => s._id === formData.serviceId)!,
          locale
        )
      : '');

  return (
    <Container className={`py-8 max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`}>
      <main role="main">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`mb-4 p-2 hover:bg-accent ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <FaArrowLeft
              className={`w-4 h-4 ${isRTL ? 'ml-2 scale-x-reverse' : 'mr-2'}`}
            />
            {t('navigation.back')}
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <FaBriefcase
              className={`inline-block text-primary ${isRTL ? 'ml-3' : 'mr-3'}`}
            />
            {isEditing ? t('title.edit') : t('title.create')}
          </h1>

          {selectedServiceName && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                {t('selectedService.label')}
              </p>
              <p className="text-lg font-semibold text-primary">
                {selectedServiceName}
              </p>
            </div>
          )}
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaFileAlt
                className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
              {t('sections.basicInfo.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <Input
                  label={t('sections.basicInfo.jobTitle.label')}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('sections.basicInfo.jobTitle.placeholder')}
                  error={errors.title}
                  required
                />
              </div>

              <div>
                {servicesLoading ? (
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      {t('sections.basicInfo.service.label')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-muted-foreground">
                        {t('sections.basicInfo.service.loading')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <DropdownSelector
                    id="serviceId"
                    label={t('sections.basicInfo.service.label')}
                    options={serviceOptions}
                    value={formData.serviceId}
                    onChange={handleDropdownChange('serviceId')}
                    placeholder={t('sections.basicInfo.service.placeholder')}
                    error={errors.serviceId}
                    required
                    helpText={
                      formData.serviceId
                        ? `${t('sections.basicInfo.service.selected')} ${
                            services.find((s) => s._id === formData.serviceId)
                              ?.name
                          }`
                        : undefined
                    }
                  />
                )}
              </div>

              <div>
                <Textarea
                  id="description"
                  label={t('sections.basicInfo.description.label')}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={12}
                  placeholder={t('sections.basicInfo.description.placeholder')}
                  error={errors.description}
                  required
                  showCharCount={true}
                  maxLength={2000}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaMapMarkerAlt
                className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
              {t('sections.location.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {t('sections.location.country.label')}
                </label>
                <input
                  type="text"
                  value="Egypt"
                  disabled
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <DropdownSelector
                  id="address.state"
                  label={t('sections.location.state.label')}
                  options={stateOptions}
                  value={formData.address.state}
                  onChange={handleDropdownChange('address.state')}
                  placeholder={t('sections.location.state.placeholder')}
                  error={errors.state}
                  required
                />
              </div>

              <div>
                <Input
                  label={t('sections.location.city.label')}
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder={t('sections.location.city.placeholder')}
                  error={errors.city}
                  required
                />
              </div>

              <div>
                <Input
                  label={t('sections.location.street.label')}
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder={t('sections.location.street.placeholder')}
                  error={errors.street}
                  required
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {t('sections.location.gps.title')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('sections.location.gps.description')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="text-xs"
                >
                  {locationLoading ? (
                    <>
                      <LoadingSpinner
                        size="sm"
                        className={isRTL ? 'ml-2' : 'mr-2'}
                      />
                      {t('sections.location.gps.buttonLoading')}
                    </>
                  ) : (
                    <>
                      <FaMapMarkerAlt
                        className={`w-3 h-3 ${isRTL ? 'ml-2' : 'mr-2'}`}
                      />
                      {t('sections.location.gps.button')}
                    </>
                  )}
                </Button>
              </div>

              {/* Interactive Map for Location Selection */}
              <div className="mb-4">
                <InteractiveMap
                  latitude={formData.location?.coordinates[1]}
                  longitude={formData.location?.coordinates[0]}
                  zoom={13}
                  height="250px"
                  markerTitle={formData.title || 'Job Location'}
                  address={`${formData.address.street}, ${formData.address.city}, ${formData.address.state}`}
                  showPopup={true}
                  isClickable={true}
                  onLocationSelect={handleLocationSelect}
                  className="w-full"
                />
              </div>

              {formData.location ? (
                <div className="text-xs text-muted-foreground">
                  {t('sections.location.gps.locationSet')}{' '}
                  {formData.location.coordinates[1]},{' '}
                  {formData.location.coordinates[0]}
                </div>
              ) : (
                <div className="text-xs text-destructive">
                  {t('sections.location.gps.locationRequired')}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaDollarSign
                className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
              {t('sections.pricing.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <DropdownSelector
                  id="paymentType"
                  label={t('sections.pricing.paymentType.label')}
                  options={paymentTypeOptions}
                  value={formData.paymentType}
                  onChange={handleDropdownChange('paymentType')}
                  helpText={
                    (formData.paymentType === 'cash' &&
                      t('sections.pricing.paymentType.descriptions.cash')) ||
                    (formData.paymentType === 'visa' &&
                      t('sections.pricing.paymentType.descriptions.visa')) ||
                    undefined
                  }
                />
              </div>

              <div>
                <div className="mb-2">
                  <label className="flex items-center text-sm font-medium text-foreground mb-2">
                    <FaCalendarAlt
                      className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}
                    />
                    {t('sections.pricing.jobDate.label')}
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="jobDate"
                    value={formData.jobDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  {errors.jobDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.jobDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaImage className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('sections.photos.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {t('sections.photos.upload.label')}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={photoPreviews.length >= 5}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {t('sections.photos.upload.supported')}
                </p>
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`${t('sections.photos.upload.preview')} ${
                          index + 1
                        }`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div
            className={`flex space-x-4 ${
              isRTL
                ? 'justify-start flex-row-reverse space-x-reverse'
                : 'justify-end'
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              loadingText={
                isEditing ? t('buttons.updating') : t('buttons.creating')
              }
              disabled={loading}
            >
              {isEditing ? t('buttons.update') : t('buttons.create')}
            </Button>
          </div>
        </form>
      </main>
    </Container>
  );
};

export default JobManagerPage;
