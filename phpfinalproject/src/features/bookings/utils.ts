import { BookingStatus } from './types/booking';

export const BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'confirmed':
      return 'bg-blue-500';
    case 'active':
      return 'bg-green-500';
    case 'completed':
      return 'bg-gray-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}
