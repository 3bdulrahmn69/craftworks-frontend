'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/ui/input';
import InteractiveMap from '@/app/components/ui/interactive-map';
import { toast } from 'react-toastify';
import { jobsService } from '@/app/services/jobs';
import servicesAPI from '@/app/services/services';
import { Service } from '@/app/types/jobs';
import {
  getCurrentLocationAndGeocode,
  reverseGeocode,
} from '@/app/utils/geocoding';
import { getEgyptianStatesArray } from '@/app/data/states';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaFileAlt,
  FaImage,
  FaTrash,
  FaArrowLeft,
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
  paymentType: 'Cash' | 'Escrow' | 'CashProtected';
  jobPrice: number;
  photos: File[];
  existingPhotos?: string[]; // URLs of existing photos when editing
}

const CreateJobPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're editing an existing job
  const editJobId = searchParams.get('edit');
  const isEditing = !!editJobId;

  const [formData, setFormData] = useState<JobFormData>({
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
    paymentType: 'Cash',
    jobPrice: 0,
    photos: [],
    existingPhotos: [],
  });

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
        error instanceof Error
          ? error.message
          : 'Failed to get location information'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number) => {
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
      toast.info(
        'Location coordinates set. Please fill in the address manually.'
      );
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await servicesAPI.getAllServices();
        if (response.data) {
          setServices(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        toast.error('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

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
            jobPrice: job.jobPrice,
            photos: [], // Only new file uploads go here
            existingPhotos: job.photos || [], // Existing photo URLs
          });

          // Set photo previews to show existing photos
          if (job.photos && job.photos.length > 0) {
            setPhotoPreviews(job.photos);
          }
        }
      } catch (err: any) {
        console.error('Failed to load job for editing:', err);
        toast.error('Failed to load job data');
      } finally {
        setLoading(false);
      }
    };

    loadJobForEdit();
  }, [editJobId, session?.accessToken]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Please select a service';
    }

    if (!formData.address.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.jobPrice || formData.jobPrice <= 0) {
      newErrors.jobPrice = 'Job price must be greater than 0';
    }

    if (!formData.location) {
      newErrors.location = 'GPS location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
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
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Calculate total photos (existing + new files + current new files)
    const totalPhotos =
      (formData.existingPhotos?.length || 0) +
      formData.photos.length +
      files.length;

    if (totalPhotos > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      // Create preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...validFiles],
      }));

      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
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

      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== newPhotoIndex),
      }));
    }

    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!session?.accessToken) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const jobFormData = new FormData();

      // Add job data
      jobFormData.append('title', formData.title);
      jobFormData.append('description', formData.description);
      jobFormData.append('service', formData.serviceId);
      jobFormData.append('address[country]', formData.address.country);
      jobFormData.append('address[state]', formData.address.state);
      jobFormData.append('address[city]', formData.address.city);
      jobFormData.append('address[street]', formData.address.street);
      jobFormData.append('paymentType', formData.paymentType);
      jobFormData.append('jobPrice', formData.jobPrice.toString());

      // Add location coordinates if available
      if (formData.location) {
        jobFormData.append('location[type]', formData.location.type);
        jobFormData.append(
          'location[coordinates]',
          formData.location.coordinates.join(',')
        );
      }

      // Add photos - Only add valid File objects, not URLs or empty objects
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((photo, index) => {
          // Ensure it's a valid File object
          if (photo instanceof File && photo.size > 0) {
            jobFormData.append('photos', photo);
          } else {
            console.warn(`Skipping invalid photo at index ${index}:`, photo);
          }
        });
      }

      const response = isEditing
        ? await jobsService.updateJob(
            editJobId!,
            jobFormData,
            session.accessToken
          )
        : await jobsService.createJob(jobFormData, session.accessToken);

      if (response.success) {
        toast.success(
          isEditing ? 'Job updated successfully!' : 'Job created successfully!'
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
            photos: [],
            title: '',
            description: '',
            jobPrice: 0,
            location: undefined,
          }));
        }

        router.push('/sc/my-jobs'); // Redirect to jobs list page
      } else {
        throw new Error(
          response.message || `Failed to ${isEditing ? 'update' : 'create'} job`
        );
      }
    } catch (err: any) {
      console.error('Failed to create job:', err);
      toast.error(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceName =
    searchParams.get('serviceName') ||
    services.find((s) => s._id === formData.serviceId)?.name ||
    '';

  return (
    <Container className="py-8 max-w-4xl">
      <main role="main">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 p-2 hover:bg-accent"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <FaBriefcase className="inline-block mr-3 text-primary" />
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </h1>

          {selectedServiceName && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Creating job for:</p>
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
              <FaFileAlt className="mr-2 text-primary" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <Input
                  label="Job Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a clear, descriptive job title"
                  error={errors.title}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Service *
                </label>
                {servicesLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-muted-foreground">
                      Loading services...
                    </span>
                  </div>
                ) : (
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                )}
                {formData.serviceId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected:{' '}
                    {services.find((s) => s._id === formData.serviceId)?.name}
                  </p>
                )}
                {errors.serviceId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.serviceId}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Describe the job in detail, including requirements, expectations, and any specific instructions..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-primary" />
              Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value="Egypt"
                  disabled
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  State *
                </label>
                <select
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select state</option>
                  {getEgyptianStatesArray().map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="City *"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city name"
                  error={errors.city}
                />
              </div>

              <div>
                <Input
                  label="Street Address *"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  error={errors.street}
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    GPS Location *
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Share your precise location to help craftsmen find you
                    easily
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
                      <LoadingSpinner size="sm" className="mr-2" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <FaMapMarkerAlt className="mr-2 w-3 h-3" />
                      Get Current Location
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
                  📍 Location set: {formData.location.coordinates[1].toFixed(6)}
                  , {formData.location.coordinates[0].toFixed(6)}
                </div>
              ) : (
                <div className="text-xs text-destructive">
                  ⚠️ Location is required. Click on the map or use &quot;Get
                  Current Location&quot; button.
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-primary" />
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Payment Type
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="Cash">
                    Cash - Direct payment to craftsman
                  </option>
                  <option value="Escrow">
                    Escrow - Protected payment held until completion
                  </option>
                  <option value="CashProtected">
                    Cash Protected - Protected cash payment
                  </option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.paymentType === 'Cash' &&
                    'Payment made directly to the craftsman'}
                  {formData.paymentType === 'Escrow' &&
                    'Payment held securely until job completion'}
                  {formData.paymentType === 'CashProtected' &&
                    'Cash payment with platform protection'}
                </p>
              </div>

              <div>
                <Input
                  label="Job Price *"
                  name="jobPrice"
                  type="text"
                  value={
                    formData.jobPrice === 0 ? '' : formData.jobPrice.toString()
                  }
                  onChange={handleInputChange}
                  placeholder="0.00"
                  error={errors.jobPrice}
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FaImage className="mr-2 text-primary" />
              Photos (Optional)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Upload Photos (Max 5, 5MB each)
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
                  Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
                </p>
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
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
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              loadingText={isEditing ? 'Updating Job...' : 'Creating Job...'}
              disabled={loading}
            >
              {isEditing ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </main>
    </Container>
  );
};

export default CreateJobPage;
