import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInCalendarDays, format, parseISO, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Car } from '@/features/cars/types/car';
import { useBookedRanges } from '@/features/cars/api';
import { useCreateBooking } from '../api';
import { errorMessage } from '@/lib/api';
import { formatPeso } from '@/lib/format';

interface BookingDialogProps {
  car: Car;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ car, open, onOpenChange }: BookingDialogProps) {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>();
  const { data: bookedRanges = [], isLoading } = useBookedRanges(car.id, open);
  const createBooking = useCreateBooking();

  // Booked nights are disabled; the return day of an existing booking stays free for a new pickup.
  const booked = useMemo(
    () => bookedRanges.map((r) => ({ from: parseISO(r.start), to: addDays(parseISO(r.end), -1) })),
    [bookedRanges],
  );

  const days = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const overlapsBooking =
    !!range?.from && !!range?.to && booked.some((b) => range.from! <= b.to && b.from < range.to!);

  const handleOpenChange = (next: boolean) => {
    if (!next) setRange(undefined);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!range?.from || !range?.to) return;
    try {
      const booking = await createBooking.mutateAsync({
        vehicleId: car.id,
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to, 'yyyy-MM-dd'),
      });
      toast.success(`Booking ${booking.bookingNumber} received! We'll confirm it shortly.`);
      handleOpenChange(false);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Book {car.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pick your pickup day, then your return day.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          {isLoading ? (
            <div className="h-[320px] flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              disabled={[{ before: startOfToday() }, ...booked]}
              className="rounded-md border border-border"
            />
          )}
        </div>

        <div className="rounded-lg bg-secondary p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pickup</span>
            <span className="text-foreground">{range?.from ? format(range.from, 'EEE, MMM d, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return</span>
            <span className="text-foreground">{range?.to ? format(range.to, 'EEE, MMM d, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {days > 0 ? `${days} day${days === 1 ? '' : 's'} × ${formatPeso(car.pricePerDay)}` : 'Rental length'}
            </span>
            <span className="font-semibold text-primary">{days > 0 ? formatPeso(days * car.pricePerDay) : '—'}</span>
          </div>
        </div>

        {overlapsBooking && (
          <p className="text-sm text-destructive">
            Those dates include days when this vehicle is already booked. Please choose another range.
          </p>
        )}
        {range?.from && range?.to && days < 1 && (
          <p className="text-sm text-destructive">The return day must be after the pickup day.</p>
        )}

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={days < 1 || overlapsBooking || createBooking.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
