import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Booking } from '@/features/bookings/types/booking';

export interface AdminStats {
  totalVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  revenue: number;
  totalCustomers: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<{ stats: AdminStats; recentBookings: Booking[] }>('/admin/stats'),
  });
}
