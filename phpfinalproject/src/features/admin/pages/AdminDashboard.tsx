import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { useAdminStats } from '@/features/admin/api';
import { getStatusColor } from '@/features/bookings/utils';
import { formatDate, formatPeso } from '@/lib/format';
import { Calendar, Car, DollarSign, Loader2, Users } from 'lucide-react';

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, refetch } = useAdminStats();

  const stats = data
    ? [
        {
          title: 'Total Vehicles',
          value: data.stats.totalVehicles.toString(),
          icon: Car,
          color: 'text-blue-500',
          detail: `${data.stats.availableVehicles} available for rent`,
        },
        {
          title: 'Bookings',
          value: data.stats.totalBookings.toString(),
          icon: Calendar,
          color: 'text-yellow-500',
          detail: `${data.stats.pendingBookings} pending · ${data.stats.activeBookings} active`,
        },
        {
          title: 'Revenue',
          value: formatPeso(data.stats.revenue),
          icon: DollarSign,
          color: 'text-green-500',
          detail: 'Confirmed, active and completed bookings',
        },
        {
          title: 'Customers',
          value: data.stats.totalCustomers.toString(),
          icon: Users,
          color: 'text-purple-500',
          detail: 'Registered accounts',
        },
      ]
    : [];

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
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError || !data ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Could not load dashboard data.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.title} className="bg-card border-border hover:border-primary/50 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Bookings */}
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Bookings</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/bookings">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.recentBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {data.recentBookings.map((booking) => (
                        <div key={booking.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.vehicleName}{' '}
                              <span className="text-sm text-muted-foreground">· {booking.customerName}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.bookingNumber} · {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{formatPeso(booking.totalAmount)}</span>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
