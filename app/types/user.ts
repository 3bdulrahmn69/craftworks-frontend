export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'client' | 'craftsman';
  profile_image?: string;
}