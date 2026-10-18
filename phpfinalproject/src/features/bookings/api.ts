import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Booking, BookingStatus } from './types/booking';

type BookingResponse = { booking: Booking };
type BookingsResponse = { bookings: Booking[] };

/** Admin: every booking. */
export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: () => api.get<BookingsResponse>('/bookings').then((r) => r.bookings),
  });
}

/** Customer: their own bookings. */
export function useMyBookings(enabled: boolean) {
  return useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => api.get<BookingsResponse>('/bookings/mine').then((r) => r.bookings),
    enabled,
  });
}

/** Booking changes affect booking lists, the car calendars and the admin stats. */
function useInvalidateBookingData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['cars'] }),
      queryClient.invalidateQueries({ queryKey: ['admin'] }),
    ]);
}

export function useCreateBooking() {
  const invalidate = useInvalidateBookingData();
  return useMutation({
    mutationFn: (input: { vehicleId: string; startDate: string; endDate: string }) =>
      api.post<BookingResponse>('/bookings', input).then((r) => r.booking),
    onSuccess: invalidate,
  });
}

export function useUpdateBookingStatus() {
  const invalidate = useInvalidateBookingData();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.patch<BookingResponse>(`/bookings/${id}/status`, { status }).then((r) => r.booking),
    onSuccess: invalidate,
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateBookingData();
  return useMutation({
    mutationFn: (id: string) => api.post<BookingResponse>(`/bookings/${id}/cancel`).then((r) => r.booking),
    onSuccess: invalidate,
  });
}
