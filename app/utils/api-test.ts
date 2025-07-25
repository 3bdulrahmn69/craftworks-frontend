// Test file to verify API response handling
import { ApiResponse, User } from '../types/user';

// Mock API response that matches the new format
const mockApiResponse: ApiResponse<{ token: string; user: User }> = {
  success: true,
  data: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgwZWEzMTNkY2FhNzc2Zjk1NGJjZjMiLCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNzUzNDMxMzgxLCJleHAiOjE3NTQwMzYxODF9.Fo2Q1vzEB22f6AMLwDgpGobsGy24VBV9zaUg9w_9azE',
    user: {
      id: '6880ea313dcaa776f954bcf3',
      email: 'client1@example.com',
      phone: '01018326780',
      role: 'client',
      fullName: 'Ahmed Mohamed',
      profilePicture:
        'https://res.cloudinary.com/demo/image/upload/d_avatar.png/client1.png',
      createdAt: '2025-07-23T13:57:05.421Z',
      address: {
        country: 'Egypt',
        state: 'Cairo',
        city: 'New Cairo',
        street: '123 Main Street',
      },
      rating: 4.2,
      ratingCount: 15,
    },
  },
  message: 'Login successful',
};

// Function to extract data from API response
export function extractApiData<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'API request failed');
}

// Test the extraction
export function testApiResponse() {
  try {
    const { token, user } = extractApiData(mockApiResponse);
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Full Name:', user.fullName);
    console.log('Profile Picture:', user.profilePicture);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}
