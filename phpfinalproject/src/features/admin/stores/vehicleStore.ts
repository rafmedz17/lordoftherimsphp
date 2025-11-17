import { create } from 'zustand';
import { Car } from '@/features/cars/types/car';
import { mockCars } from '@/features/cars/data/mockCars';

interface VehicleState {
  vehicles: Car[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchVehicles: () => void;
  addVehicle: (vehicle: Omit<Car, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Car>) => void;
  deleteVehicle: (id: string) => void;
  deleteMultipleVehicles: (ids: string[]) => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [...mockCars],
  isLoading: false,
  error: null,

  fetchVehicles: () => {
    // Simulate API call
    set({ isLoading: true });
    setTimeout(() => {
      set({ vehicles: [...mockCars], isLoading: false });
    }, 500);
  },

  addVehicle: (vehicleData) => {
    const newVehicle: Car = {
      ...vehicleData,
      id: Date.now().toString(), // Generate simple ID
    };

    set((state) => ({
      vehicles: [...state.vehicles, newVehicle],
    }));
  },

  updateVehicle: (id, updates) => {
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      ),
    }));
  },

  deleteVehicle: (id) => {
    set((state) => ({
      vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id),
    }));
  },

  deleteMultipleVehicles: (ids) => {
    set((state) => ({
      vehicles: state.vehicles.filter((vehicle) => !ids.includes(vehicle.id)),
    }));
  },
}));
