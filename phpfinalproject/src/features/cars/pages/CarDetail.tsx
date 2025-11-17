import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCars } from '@/features/cars/data/mockCars';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Gauge,
  Fuel,
  Calendar,
  MapPin,
  Check,
  ChevronLeft,
  Home
} from 'lucide-react';

export function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Find the car by ID
  const car = mockCars.find((c) => c.id === id);

  // If car not found, show not found message
  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      toast.info('Please login to rent this vehicle');
    } else {
      toast.success(`Rental request initiated for ${car.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Collection
              </Button>
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>/</span>
                <button
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const carsSection = document.getElementById('cars');
                      if (carsSection) {
                        carsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="hover:text-foreground"
                >
                  Cars
                </button>
                <span>/</span>
                <span className="text-foreground">{car.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                {car.available ? (
                  <Badge className="bg-primary text-primary-foreground">Available</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Currently Rented
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery (if multiple images exist) */}
            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {car.images.slice(0, 3).map((img, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg overflow-hidden bg-secondary border border-border cursor-pointer hover:border-primary transition-colors"
                  >
                    <img
                      src={img}
                      alt={`${car.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Title and Category */}
            <div>
              <Badge variant="outline" className="mb-3">
                {car.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {car.name}
              </h1>
              <p className="text-xl text-muted-foreground">{car.brand}</p>
            </div>

            {/* Price */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">₱{car.pricePerDay}</span>
                <span className="text-lg text-muted-foreground">/day</span>
              </div>
              {car.mileage && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {car.mileage}
                </p>
              )}
            </div>

            {/* Specifications Grid */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-semibold text-foreground">{car.seats} People</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-semibold text-foreground">{car.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-semibold text-foreground">{car.fuel}</p>
                  </div>
                </div>
                {car.year && (
                  <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold text-foreground">{car.year}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">About This Vehicle</h3>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className="space-y-3 pt-6 border-t border-border">
              <Button
                size="lg"
                onClick={handleBookNow}
                disabled={!car.available}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {car.available ? 'Book This Vehicle' : 'Currently Unavailable'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By booking, you agree to our rental terms and conditions
              </p>
            </div>
          </div>
        </div>

        {/* Similar Cars Section (Optional - to be implemented) */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-foreground mb-8">Similar Vehicles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {mockCars
              .filter((c) => c.id !== car.id && c.category === car.category)
              .slice(0, 3)
              .map((similarCar) => (
                <Link
                  key={similarCar.id}
                  to={`/cars/${similarCar.id}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-gold transition-all"
                >
                  <div className="relative h-48 overflow-hidden bg-secondary">
                    <img
                      src={similarCar.image}
                      alt={similarCar.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{similarCar.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{similarCar.category}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-primary">₱{similarCar.pricePerDay}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
}
