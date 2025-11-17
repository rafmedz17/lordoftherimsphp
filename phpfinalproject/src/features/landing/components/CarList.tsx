import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Gauge, Fuel, Lock, Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { mockCars } from '@/features/cars/data/mockCars';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { toast } from 'sonner';

export function CarList() {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  // Filter logic
  const filteredCars = useMemo(() => {
    return mockCars.filter((car) => {
      // Search filter (name and brand)
      const matchesSearch = searchTerm === '' ||
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;

      // Availability filter
      const matchesAvailability = !showAvailableOnly || car.available;

      // Fuel type filter
      const matchesFuelType = selectedFuelTypes.length === 0 ||
        selectedFuelTypes.includes(car.fuel);

      // Seats filter
      const matchesSeats = selectedSeats === null || car.seats === selectedSeats;

      // Price range filter
      let matchesPriceRange = true;
      if (priceRange === 'under1000') {
        matchesPriceRange = car.pricePerDay < 1000;
      } else if (priceRange === '1000-1500') {
        matchesPriceRange = car.pricePerDay >= 1000 && car.pricePerDay <= 1500;
      } else if (priceRange === '1500plus') {
        matchesPriceRange = car.pricePerDay > 1500;
      }

      return matchesSearch && matchesCategory && matchesAvailability &&
             matchesFuelType && matchesSeats && matchesPriceRange;
    });
  }, [searchTerm, selectedCategory, showAvailableOnly, selectedFuelTypes, selectedSeats, priceRange]);

  // Get unique values for filters
  const categories = Array.from(new Set(mockCars.map(car => car.category)));
  const fuelTypes = Array.from(new Set(mockCars.map(car => car.fuel)));
  const seatOptions = Array.from(new Set(mockCars.map(car => car.seats))).sort((a, b) => a - b);

  // Helper functions
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowAvailableOnly(false);
    setSelectedFuelTypes([]);
    setSelectedSeats(null);
    setPriceRange('all');
  };

  const toggleFuelType = (fuel: string) => {
    setSelectedFuelTypes(prev =>
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    );
  };

  const handleRentClick = (carName: string) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      toast.info('Please login to rent a vehicle');
    } else {
      toast.success(`Rental request initiated for ${carName}`);
    }
  };

  return (
    <>
      <section id="cars" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Exclusive
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Vehicle Collection
              </span>
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-12 bg-card border-border text-foreground"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="bg-card border border-border rounded-lg pt-3 pl-4 pr-4 pb-3">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Category
                      {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-xs">1</Badge>
                      )}
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Price Range
                      {priceRange !== 'all' && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-xs">1</Badge>
                      )}
                    </label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="All Prices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under1000">Under ₱1000</SelectItem>
                        <SelectItem value="1000-1500">₱1000-₱1500</SelectItem>
                        <SelectItem value="1500plus">₱1500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fuel Type Filter - Multi-select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Fuel Type
                      {selectedFuelTypes.length > 0 && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                          {selectedFuelTypes.length}
                        </Badge>
                      )}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-card border-border font-normal"
                        >
                          <span className="truncate">
                            {selectedFuelTypes.length > 0
                              ? selectedFuelTypes.join(', ')
                              : 'All Fuel Types'}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-3" align="start">
                        <div className="space-y-2">
                          {fuelTypes.map((fuel) => (
                            <div key={fuel} className="flex items-center space-x-2">
                              <Checkbox
                                id={`fuel-${fuel}`}
                                checked={selectedFuelTypes.includes(fuel)}
                                onCheckedChange={() => toggleFuelType(fuel)}
                              />
                              <label
                                htmlFor={`fuel-${fuel}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {fuel}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Seats Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Seats
                      {selectedSeats !== null && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-xs">1</Badge>
                      )}
                    </label>
                    <Select
                      value={selectedSeats?.toString() || 'all'}
                      onValueChange={(value) => setSelectedSeats(value === 'all' ? null : Number(value))}
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Any Seats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Seats</SelectItem>
                        {seatOptions.map((seats) => (
                          <SelectItem key={seats} value={seats.toString()}>
                            {seats} Seats
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability Filter - Keep as toggle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Availability
                      {showAvailableOnly && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-xs">1</Badge>
                      )}
                    </label>
                    <Select
                      value={showAvailableOnly ? 'available' : 'all'}
                      onValueChange={(value) => setShowAvailableOnly(value === 'available')}
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Show All</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredCars.length}</span> of{' '}
                <span className="font-semibold text-foreground">{mockCars.length}</span> vehicles
              </p>
            </div>
          </div>

          {/* Car Grid or Empty State */}
          {filteredCars.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-card border border-border rounded-lg p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No vehicles found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to find the perfect vehicle.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <Link
                  key={car.id}
                  to={`/cars/${car.id}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-gold transition-all block"
                >
                {/* Car Image */}
                <div className="relative h-56 overflow-hidden bg-secondary">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    {car.available ? (
                      <Badge className="bg-primary text-primary-foreground">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Rented
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">{car.name}</h3>
                    <p className="text-sm text-muted-foreground">{car.category}</p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{car.seats}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span>{car.fuel}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">₱{car.pricePerDay}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRentClick(car.name);
                      }}
                      disabled={!car.available}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {!isAuthenticated ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Rent
                        </>
                      ) : car.available ? (
                        'Rent Now'
                      ) : (
                        'Unavailable'
                      )}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          )}
        </div>
      </section>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
