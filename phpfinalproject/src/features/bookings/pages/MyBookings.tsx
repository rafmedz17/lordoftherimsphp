import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { useCancelBooking, useMyBookings } from '../api';
import { Booking } from '../types/booking';
import { getStatusColor } from '../utils';
import { errorMessage } from '@/lib/api';
import { formatDate, formatPeso } from '@/lib/format';
import { assetUrl } from '@/lib/paths';

export function MyBookings() {
  const navigate = useNavigate();
  const { user, isReady } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading, isError, refetch } = useMyBookings(!!user);
  const cancelBooking = useCancelBooking();

  const handleCancelConfirm = async () => {
    if (!cancelling) return;
    try {
      await cancelBooking.mutateAsync(cancelling.id);
      toast.success(`Booking ${cancelling.bookingNumber} has been cancelled`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Collection
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground mb-8">Track your reservations and their status.</p>

        {!isReady || (user && isLoading) ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-6">Please log in to see your bookings.</p>
            <Button onClick={() => setShowLogin(true)} className="bg-primary text-primary-foreground shadow-gold">
              Login
            </Button>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">We couldn't load your bookings.</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <CalendarDays className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">Find your perfect ride in our collection.</p>
            <Button asChild className="bg-primary text-primary-foreground shadow-gold">
              <Link to="/">Browse Vehicles</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={assetUrl(booking.vehicleImage)}
                  alt={booking.vehicleName}
                  className="w-full sm:w-40 h-28 object-cover rounded-lg bg-secondary"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{booking.vehicleName}</h2>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.bookingNumber}</p>
                  <p className="text-sm text-foreground">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}{' '}
                    <span className="text-muted-foreground">
                      ({booking.totalDays} day{booking.totalDays === 1 ? '' : 's'})
                    </span>
                  </p>
                  <p className="text-lg font-semibold text-primary">{formatPeso(booking.totalAmount)}</p>
                </div>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <div className="sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelling(booking)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={cancelling !== null} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel booking {cancelling?.bookingNumber} for {cancelling?.vehicleName}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-500 hover:bg-red-600">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
}
