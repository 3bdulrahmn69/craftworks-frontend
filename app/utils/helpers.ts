/**
 * Helper Functions for Craftworks Frontend
 * Contains utility functions for formatting, validation, and common operations
 */

// Date formatting helpers
export const formatDate = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  if (!dateString) return 'No date provided';

  try {
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatDateTime = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  if (!dateString) return 'No date provided';

  try {
    return new Date(dateString).toLocaleString(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid date';
  }
};

export const formatRelativeTime = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  if (!dateString) return 'No date provided';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return locale === 'ar' ? 'منذ لحظات' : 'Just now';
    } else if (diffInHours < 24) {
      return locale === 'ar'
        ? `منذ ${diffInHours} ساعة`
        : `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return locale === 'ar' ? `منذ ${days} يوم` : `${days} days ago`;
    } else {
      return formatDate(dateString, locale);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
};

// Address formatting helpers
export const formatAddress = (address: any): string => {
  if (!address) return 'No address provided';

  if (typeof address === 'string') return address;

  if (typeof address === 'object' && address) {
    const parts = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  }

  return 'No address provided';
};

export const formatShortAddress = (address: any): string => {
  if (!address) return 'No location';

  if (typeof address === 'string') return address;

  if (typeof address === 'object' && address) {
    // Return city and state only for shorter display
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);

    return parts.length > 0 ? parts.join(', ') : 'No location';
  }

  return 'No location';
};

// Price formatting helpers
export const formatPrice = (
  price: number | string,
  currency: string = 'EGP'
): string => {
  if (!price && price !== 0) return 'Price not set';

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) return 'Invalid price';

  // Format with thousand separators
  const formatted = numPrice.toLocaleString();
  return `${formatted} ${currency}`;
};

export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  currency: string = 'EGP'
): string => {
  if (!minPrice && !maxPrice) return 'Price not set';

  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }

  return `${formatPrice(minPrice, currency)} - ${formatPrice(
    maxPrice,
    currency
  )}`;
};

// Text formatting helpers
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatJobTitle = (title: string): string => {
  if (!title) return 'Untitled Job';

  // Capitalize first letter and ensure proper formatting
  return capitalizeFirst(title.trim());
};

// Status helpers
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'posted':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'hired':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'in progress':
    case 'inprogress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'posted':
      return '📋';
    case 'hired':
      return '✅';
    case 'in progress':
    case 'inprogress':
      return '🔄';
    case 'completed':
      return '🏆';
    case 'cancelled':
    case 'canceled':
      return '❌';
    case 'pending':
      return '⏳';
    default:
      return '📄';
  }
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array helpers
export const removeEmptyElements = <T>(
  array: (T | null | undefined)[]
): T[] => {
  return array.filter((item): item is T => item != null);
};

export const uniqueById = <T extends { _id: string }>(array: T[]): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    if (seen.has(item._id)) {
      return false;
    }
    seen.add(item._id);
    return true;
  });
};

// File helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Local storage helpers
export const setLocalStorage = (key: string, value: any): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// Coordinate helpers
export const formatCoordinates = (
  coordinates: [number, number] | number[]
): string => {
  if (!coordinates || coordinates.length !== 2) return 'No coordinates';

  const [lng, lat] = coordinates;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Random helpers
export const generateRandomId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// URL helpers
export const buildUrlWithParams = (
  baseUrl: string,
  params: Record<string, any>
): string => {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

export const getQueryParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

// Export all helpers as default
const helpers = {
  // Date helpers
  formatDate,
  formatDateTime,
  formatRelativeTime,

  // Address helpers
  formatAddress,
  formatShortAddress,

  // Price helpers
  formatPrice,
  formatPriceRange,

  // Text helpers
  truncateText,
  capitalizeFirst,
  formatJobTitle,

  // Status helpers
  getStatusColor,
  getStatusIcon,

  // Validation helpers
  isValidEmail,
  isValidPhone,
  isValidUrl,

  // Array helpers
  removeEmptyElements,
  uniqueById,

  // File helpers
  formatFileSize,
  getFileExtension,

  // Storage helpers
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,

  // Coordinate helpers
  formatCoordinates,
  calculateDistance,

  // Random helpers
  generateRandomId,
  shuffleArray,

  // URL helpers
  buildUrlWithParams,
  getQueryParams,
};

export default helpers;
