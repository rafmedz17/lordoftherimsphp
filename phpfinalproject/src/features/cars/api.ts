import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookedRange, Car, CarInput } from './types/car';

export function useCars() {
  return useQuery({
    queryKey: ['cars'],
    queryFn: () => api.get<{ cars: Car[] }>('/cars').then((r) => r.cars),
  });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ['cars', id],
    queryFn: () => api.get<{ car: Car }>(`/cars/${id}`).then((r) => r.car),
    enabled: !!id,
  });
}

export function useBookedRanges(carId: string, enabled = true) {
  return useQuery({
    queryKey: ['cars', carId, 'booked'],
    queryFn: () => api.get<{ ranges: BookedRange[] }>(`/cars/${carId}/booked`).then((r) => r.ranges),
    enabled,
  });
}

export function useSaveCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: CarInput }) =>
      (id ? api.put<{ car: Car }>(`/cars/${id}`, data) : api.post<{ car: Car }>('/cars', data)).then((r) => r.car),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cars/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
  });
}

/** Uploads a vehicle photo and returns its URL. */
export async function uploadCarImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const { url } = await api.post<{ url: string }>('/uploads', form);
  return url;
}
