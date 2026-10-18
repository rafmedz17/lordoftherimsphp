import { useState } from 'react';
import { useForm, UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../stores/authStore';
import { ApiError, errorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Enter your password' }),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, { message: 'Enter your full name' }).max(100),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(72, { message: 'Password must be at most 72 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Shows server-side field errors (e.g. "email already exists") next to the matching inputs. */
function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
    for (const [field, message] of Object.entries(error.fields)) {
      setError(field as Path<T>, { message });
    }
  } else {
    toast.error(errorMessage(error));
  }
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleOpenChange = (next: boolean) => {
    if (!next) setMode('login');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to access your account and start renting premium vehicles.'
              : 'Join Lord of the Rims to book premium vehicles in minutes.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          <LoginForm onSuccess={() => handleOpenChange(false)} />
        ) : (
          <RegisterForm onSuccess={() => handleOpenChange(false)} />
        )}

        <p className="text-sm text-center text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      onSuccess();
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          className="bg-secondary border-border text-foreground"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="bg-secondary border-border text-foreground"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <SubmitButton isLoading={isSubmitting} label="Sign In" loadingLabel="Signing in..." />
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const registerUser = useAuthStore((state) => state.register);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const user = await registerUser(data.name, data.email, data.password);
      toast.success(`Welcome to Lord of the Rims, ${user.name}!`);
      onSuccess();
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-foreground">Full Name</Label>
        <Input
          id="register-name"
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          className="bg-secondary border-border text-foreground"
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-foreground">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          className="bg-secondary border-border text-foreground"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-foreground">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="bg-secondary border-border text-foreground"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm" className="text-foreground">Confirm Password</Label>
        <Input
          id="register-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className="bg-secondary border-border text-foreground"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <SubmitButton isLoading={isSubmitting} label="Create Account" loadingLabel="Creating account..." />
    </form>
  );
}

function SubmitButton({ isLoading, label, loadingLabel }: { isLoading: boolean; label: string; loadingLabel: string }) {
  return (
    <Button
      type="submit"
      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
