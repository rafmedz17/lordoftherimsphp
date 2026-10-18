export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  /** Null when the vehicle has since been deleted. */
  vehicleId: string | null;
  vehicleName: string;
  vehicleImage: string | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}
