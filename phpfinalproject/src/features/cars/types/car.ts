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
  description?: string | null;
  year?: number | null;
  mileage?: string | null;
  features?: string[];
  images?: string[];
}

export type CarInput = Omit<Car, 'id'>;

/** A date range already booked. `end` is the return day, which is free for a new pickup. */
export interface BookedRange {
  start: string;
  end: string;
}
