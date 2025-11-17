export interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  vehicleId: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}
