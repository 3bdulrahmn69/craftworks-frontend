export interface Service {
  _id: string;
  name: string;
  icon: string;
  description: string;
  subcategories?: string[];
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}
