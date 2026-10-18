import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

/** Route guard for the admin pages. The PHP API enforces admin access too; this only keeps the UI in step. */
export function RequireAdmin() {
  const { user, isReady } = useAuthStore();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/adminlogin" replace />;
  }

  return <Outlet />;
}
