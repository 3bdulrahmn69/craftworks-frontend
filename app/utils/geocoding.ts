import { egyptianStates } from '@/app/data/states';

interface ReverseGeocodeResponse {
  latitude: number;
  longitude: number;
  lookupSource: string;
  localityLanguageRequested: string;
  continent: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  principalSubdivision: string;
  principalSubdivisionCode: string;
  city: string;
  locality: string;
  postcode: string;
  plusCode: string;
  localityInfo: {
    administrative: Array<{
      name: string;
      description: string;
      isoName: string;
      order: number;
      adminLevel: number;
      isoCode: string;
      wikidataId: string;
      geonameId: number;
    }>;
    informative: Array<{
      name: string;
      description: string;
      isoName?: string;
      order: number;
      isoCode?: string;
      wikidataId?: string;
      geonameId?: number;
    }>;
  };
}

interface GeocodeResult {
  state: string;
  city: string;
}

// Egyptian states with possible variations/mappings - built from states data
const buildStatesMapping = () => {
  const mapping: Record<string, string> = {};

  egyptianStates.forEach((state) => {
    // Exact matches
    mapping[state.name.en] = state.name.en;
    mapping[state.name.ar] = state.name.en;

    // Common variations
    const variations = [
      `Al ${state.name.en}`,
      `Al-${state.name.en}`,
      `محافظة ${state.name.ar}`,
    ];

    variations.forEach((variation) => {
      mapping[variation] = state.name.en;
    });
  });

  // Additional common variations
  const additionalMappings: Record<string, string> = {
    Qalyubiya: 'Qalyubia',
    'Al-Qalyubiyah': 'Qalyubia',
    Qalubiya: 'Qalyubia',
    Kalyoubia: 'Qalyubia',
    Kaliobeya: 'Qalyubia',
    'Muḩafazat al Qalyubiyah': 'Qalyubia',
    'Al Qāhirah': 'Cairo',
    'Al-Qāhirah': 'Cairo',
    'Al Iskandariyah': 'Alexandria',
    'Al-Iskandariyah': 'Alexandria',
    'Al Jizah': 'Giza',
    'Al-Jizah': 'Giza',
    'Bur Said': 'Port Said',
    'Al Suways': 'Suez',
    'Al-Suways': 'Suez',
    'Al Uqsur': 'Luxor',
    'Al-Uqsur': 'Luxor',
    'Aswan Governorate': 'Aswan',
    'Cairo Governorate': 'Cairo',
    'Giza Governorate': 'Giza',
  };

  Object.assign(mapping, additionalMappings);
  return mapping;
};

const egyptianStatesMapping = buildStatesMapping();

/**
 * Finds the best matching Egyptian state from the API response
 */
function findBestStateMatch(
  principalSubdivision: string,
  administrativeAreas: any[]
): string {
  // First try exact match with the principal subdivision
  if (egyptianStatesMapping[principalSubdivision]) {
    return egyptianStatesMapping[principalSubdivision];
  }

  // Try to find matches in administrative areas
  for (const area of administrativeAreas) {
    if (area.adminLevel === 4) {
      // Governorate level
      if (egyptianStatesMapping[area.name]) {
        return egyptianStatesMapping[area.name];
      }
      if (egyptianStatesMapping[area.isoName]) {
        return egyptianStatesMapping[area.isoName];
      }
    }
  }

  // Fallback: try partial matching
  const normalizedSubdivision = principalSubdivision.toLowerCase();
  for (const [key, value] of Object.entries(egyptianStatesMapping)) {
    if (
      key.toLowerCase().includes(normalizedSubdivision) ||
      normalizedSubdivision.includes(key.toLowerCase())
    ) {
      return value;
    }
  }

  // If no match found, return the original subdivision name
  return principalSubdivision;
}

/**
 * Calls the reverse geocoding API and extracts state and city information
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with state and city information
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ReverseGeocodeResponse = await response.json();

    // Find the best matching state
    const state = findBestStateMatch(
      data.principalSubdivision,
      data.localityInfo.administrative
    );

    // Get the city (prefer locality over city if available)
    const city = data.locality || data.city || '';

    return {
      state,
      city,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw new Error(
      'Failed to get location information. Please enter the address manually.'
    );
  }
}

/**
 * Gets current user location and performs reverse geocoding
 * @returns Promise with latitude, longitude, state, and city
 */
export async function getCurrentLocationAndGeocode(): Promise<{
  latitude: number;
  longitude: number;
  state: string;
  city: string;
}> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocodeResult = await reverseGeocode(latitude, longitude);

          resolve({
            latitude,
            longitude,
            ...geocodeResult,
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}
