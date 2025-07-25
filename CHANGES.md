# API Response Format Update - Changes Summary

## Overview

Updated the frontend to handle the new API response format where all successful responses are wrapped in:

```json
{
  "success": true,
  "data": { /* actual response data */ },
  "message": "Success message"
}
```

## Files Updated

### 1. Types

- **`app/types/user.ts`**:
  - Updated `User` interface to match new field names (`fullName`, `profilePicture`, etc.)
  - Added `ApiResponse<T>` interface for type-safe API responses

### 2. Services

- **`app/services/auth.ts`**:

  - Updated all API calls to extract data from `response.data.data`
  - Changed field names: `full_name` → `fullName`, `profile_image` → `profilePicture`
  - Added proper TypeScript typing with `ApiResponse<T>`

- **`app/services/api.ts`**:

  - Enhanced error handling interceptor
  - Added automatic token cleanup on 401 errors

- **`app/services/services.ts`**:

  - Updated to extract data from `response.data.data`

- **`app/services/email.ts`**:
  - Updated to extract data from `response.data.data`

### 3. Authentication

- **`app/api/auth/[...nextauth]/route.ts`**:
  - Updated to handle new response format
  - Changed field access: `user.full_name` → `user.fullName`, `user.profile_image` → `user.profilePicture`

### 4. Hooks

- **`app/hooks/useAuth.ts`**:
  - Updated helper functions to use new field names
  - Added new helper functions for additional user data (phone, address, rating)

### 5. Components

- **`app/auth/register/page.tsx`**:
  - Updated form state to use `fullName` instead of `full_name`
  - Updated all form validation and submission logic

## New User Data Structure

The API now returns user data in this format:

```typescript
{
  id: string;
  email: string;
  phone: string;
  role: 'client' | 'craftsman';
  fullName: string;  // Changed from full_name
  profilePicture: string;  // Changed from profile_image
  createdAt: string;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  rating: number;
  ratingCount: number;
}
```

## Testing

- Created test utility in `app/utils/api-test.ts` to verify response handling
- All API calls now properly extract data from the nested response structure

## Breaking Changes

- Field name changes require frontend updates
- All API response handling now expects the wrapped format
- Components using user data need to use new field names

## Next Steps

1. Test login/register functionality
2. Verify all API calls work with new format
3. Update any remaining components that reference old field names
4. Test error handling with new response format
