export interface Car {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: number;
  image: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  fuel: string;
  available: boolean;
  description?: string;
  year?: number;
  mileage?: string;
  features?: string[];
  images?: string[];
}
