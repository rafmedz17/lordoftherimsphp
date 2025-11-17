import { create } from 'zustand';
import { Booking } from '../types/booking';
import { mockBookings } from '../data/mockBookings';

interface BookingState {
  bookings: Booking[];

  // Actions
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [...mockBookings],

  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      ),
    }));
  },

  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      ),
    }));
  },
}));
