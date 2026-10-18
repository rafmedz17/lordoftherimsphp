<?php
declare(strict_types=1);

function admin_stats(): never
{
    require_admin();

    $cars = db_fetch('SELECT COUNT(*) AS total, COALESCE(SUM(available), 0) AS available FROM cars');
    $bookings = db_fetch(
        "SELECT COUNT(*) AS total,
                COALESCE(SUM(status = 'pending'), 0) AS pending,
                COALESCE(SUM(status = 'active'), 0) AS active,
                COALESCE(SUM(CASE WHEN status IN ('confirmed', 'active', 'completed') THEN total_amount END), 0) AS revenue
         FROM bookings",
    );
    $customers = db_fetch("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    $recent = db_fetch_all(BOOKING_SELECT . ' ORDER BY b.created_at DESC, b.id DESC LIMIT 5');

    json_response([
        'stats' => [
            'totalVehicles' => (int) $cars['total'],
            'availableVehicles' => (int) $cars['available'],
            'totalBookings' => (int) $bookings['total'],
            'pendingBookings' => (int) $bookings['pending'],
            'activeBookings' => (int) $bookings['active'],
            'revenue' => (float) $bookings['revenue'],
            'totalCustomers' => (int) $customers['total'],
        ],
        'recentBookings' => array_map('booking_to_json', $recent),
    ]);
}
