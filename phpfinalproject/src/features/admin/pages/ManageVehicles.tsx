import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { uploadCarImage, useCars, useDeleteCar, useSaveCar } from '@/features/cars/api';
import { Car, CarInput } from '@/features/cars/types/car';
import { ApiError, errorMessage } from '@/lib/api';
import { formatPeso } from '@/lib/format';
import { Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  pricePerDay: '',
  seats: '',
  transmission: 'Automatic' as 'Automatic' | 'Manual',
  fuel: '',
  available: true,
  description: '',
  year: '',
  mileage: '',
  features: '',
  image: PLACEHOLDER_IMAGE,
};

type FormData = typeof emptyForm;

export function ManageVehicles() {
  const { data: vehicles = [], isLoading, isError, refetch } = useCars();
  const saveCar = useSaveCar();
  const deleteCar = useDeleteCar();

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Car | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Car | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setFormData((current) => ({ ...current, [field]: value }));

  // Open add modal
  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData(emptyForm);
    setFieldErrors({});
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleEdit = (vehicle: Car) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      brand: vehicle.brand,
      category: vehicle.category,
      pricePerDay: vehicle.pricePerDay.toString(),
      seats: vehicle.seats.toString(),
      transmission: vehicle.transmission,
      fuel: vehicle.fuel,
      available: vehicle.available,
      description: vehicle.description ?? '',
      year: vehicle.year?.toString() ?? '',
      mileage: vehicle.mileage ?? '',
      features: (vehicle.features ?? []).join('\n'),
      image: vehicle.image || PLACEHOLDER_IMAGE,
    });
    setFieldErrors({});
    setIsAddEditOpen(true);
  };

  const handleImageSelected = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      updateField('image', await uploadCarImage(file));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // Save vehicle (add or edit)
  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.category || !formData.pricePerDay || !formData.fuel) {
      toast.error('Please fill in all required fields');
      return;
    }

    const vehicleData: CarInput = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      pricePerDay: Number(formData.pricePerDay),
      seats: Number(formData.seats) || 4,
      transmission: formData.transmission,
      fuel: formData.fuel,
      available: formData.available,
      description: formData.description || null,
      image: formData.image || PLACEHOLDER_IMAGE,
      year: formData.year ? Number(formData.year) : null,
      mileage: formData.mileage || null,
      features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
      images: editingVehicle?.images ?? [],
    };

    try {
      await saveCar.mutateAsync({ id: editingVehicle?.id, data: vehicleData });
      toast.success(`${formData.name} ${editingVehicle ? 'updated' : 'added'} successfully`);
      setIsAddEditOpen(false);
    } catch (error) {
      if (error instanceof ApiError) setFieldErrors(error.fields);
      toast.error(errorMessage(error));
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (vehicle: Car) => {
    setDeletingVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    try {
      await deleteCar.mutateAsync(deletingVehicle.id);
      toast.success(`${deletingVehicle.name} deleted successfully`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsDeleteOpen(false);
      setDeletingVehicle(null);
    }
  };

  const fieldError = (field: string) =>
    fieldErrors[field] && <p className="text-sm text-destructive">{fieldErrors[field]}</p>;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content - Offset by sidebar width */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Vehicles</h1>
                <p className="text-sm text-muted-foreground">Add, edit, or remove vehicles from your fleet</p>
              </div>
              <Button onClick={handleAdd} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vehicle
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.category}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatPeso(vehicle.pricePerDay)}
                  </TableCell>
                  <TableCell>
                    {vehicle.available ? (
                      <Badge className="bg-green-500">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Unavailable</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(vehicle)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Could not load vehicles.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : (
            vehicles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No vehicles yet. Add your first vehicle!</p>
              </div>
            )
          )}
        </div>
        </main>

        {/* Add/Edit Modal */}
        <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              Fill in the vehicle details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <img
                src={formData.image}
                alt="Vehicle preview"
                className="w-32 h-24 object-cover rounded-lg border border-border bg-secondary"
              />
              <div className="space-y-2">
                <Label htmlFor="image-upload">Photo</Label>
                <div>
                  <Button variant="outline" size="sm" asChild disabled={isUploading}>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload image'}
                    </label>
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      handleImageSelected(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB</p>
                {fieldError('image')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Rolls-Royce Phantom"
                />
                {fieldError('name')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Rolls-Royce"
                />
                {fieldError('brand')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="e.g., Luxury Sedan"
                />
                {fieldError('category')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Day (₱) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={formData.pricePerDay}
                  onChange={(e) => updateField('pricePerDay', e.target.value)}
                  placeholder="e.g., 1500"
                />
                {fieldError('pricePerDay')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  value={formData.seats}
                  onChange={(e) => updateField('seats', e.target.value)}
                  placeholder="e.g., 5"
                />
                {fieldError('seats')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: 'Automatic' | 'Manual') => updateField('transmission', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Type *</Label>
                <Input
                  id="fuel"
                  value={formData.fuel}
                  onChange={(e) => updateField('fuel', e.target.value)}
                  placeholder="e.g., Gasoline"
                />
                {fieldError('fuel')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  placeholder="e.g., 2024"
                />
                {fieldError('year')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  value={formData.mileage}
                  onChange={(e) => updateField('mileage', e.target.value)}
                  placeholder="e.g., Unlimited"
                />
                {fieldError('mileage')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of the vehicle..."
                rows={3}
              />
              {fieldError('description')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => updateField('features', e.target.value)}
                placeholder={'Massage Seats\nPanoramic Sunroof'}
                rows={4}
              />
              {fieldError('features')}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => updateField('available', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="available">Available for rent</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary" disabled={saveCar.isPending || isUploading}>
              {saveCar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {deletingVehicle?.name}. Past bookings keep their record, but this action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
