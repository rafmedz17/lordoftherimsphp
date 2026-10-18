<?php
declare(strict_types=1);

const BOOKING_STATUSES = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
const MAX_RENTAL_DAYS = 90;

const BOOKING_SELECT = '
    SELECT b.*, u.name AS customer_name, u.email AS customer_email, c.image AS vehicle_image
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    LEFT JOIN cars c ON c.id = b.car_id';

function booking_to_json(array $b): array
{
    return [
        'id' => (string) $b['id'],
        'bookingNumber' => $b['booking_number'],
        'customerName' => $b['customer_name'],
        'customerEmail' => $b['customer_email'],
        'vehicleId' => $b['car_id'] === null ? null : (string) $b['car_id'],
        'vehicleName' => $b['vehicle_name'],
        'vehicleImage' => $b['vehicle_image'],
        'startDate' => $b['start_date'],
        'endDate' => $b['end_date'],
        'totalDays' => (int) $b['total_days'],
        'pricePerDay' => (float) $b['price_per_day'],
        'totalAmount' => (float) $b['total_amount'],
        'status' => $b['status'],
        'createdAt' => iso_datetime($b['created_at']),
    ];
}

function find_booking_or_404(int $id): array
{
    return db_fetch(BOOKING_SELECT . ' WHERE b.id = ?', [$id]) ?? abort(404, 'Booking not found.');
}

/** Admin: every booking, newest first. */
function bookings_index(): never
{
    require_admin();
    $rows = db_fetch_all(BOOKING_SELECT . ' ORDER BY b.created_at DESC, b.id DESC');
    json_response(['bookings' => array_map('booking_to_json', $rows)]);
}

/** Customer: their own bookings. */
function bookings_mine(): never
{
    $user = require_user();
    $rows = db_fetch_all(BOOKING_SELECT . ' WHERE b.user_id = ? ORDER BY b.created_at DESC, b.id DESC', [$user['id']]);
    json_response(['bookings' => array_map('booking_to_json', $rows)]);
}

function bookings_store(): never
{
    $user = require_user();

    $v = new Validator(json_input());
    $carId = $v->int('vehicleId', 1, PHP_INT_MAX);
    $start = $v->date('startDate');
    $end = $v->date('endDate');
    $v->validate();

    if ($start < new DateTimeImmutable('today')) {
        $v->addError('startDate', 'Pickup date cannot be in the past.');
    }
    $days = (int) $start->diff($end)->format('%r%a');
    if ($days < 1) {
        $v->addError('endDate', 'Return date must be after the pickup date.');
    } elseif ($days > MAX_RENTAL_DAYS) {
        $v->addError('endDate', 'Bookings can be at most ' . MAX_RENTAL_DAYS . ' days long.');
    }
    $v->validate();

    $pdo = db();
    $pdo->beginTransaction();
    try {
        // Lock the car row so two people can't book the same dates at the same moment.
        $car = db_fetch('SELECT * FROM cars WHERE id = ? FOR UPDATE', [$carId]) ?? abort(404, 'Vehicle not found.');
        if (!$car['available']) {
            abort(409, 'This vehicle is not available for rent right now.');
        }

        // Two rentals overlap when each starts before the other ends.
        // A car returned on the 25th can be picked up again on the 25th.
        $placeholders = implode(',', array_fill(0, count(BLOCKING_STATUSES), '?'));
        $clash = db_fetch(
            "SELECT COUNT(*) AS n FROM bookings
             WHERE car_id = ? AND status IN ($placeholders) AND start_date < ? AND end_date > ?",
            [$carId, ...BLOCKING_STATUSES, $end->format('Y-m-d'), $start->format('Y-m-d')],
        );
        if ((int) $clash['n'] > 0) {
            abort(409, 'Sorry, this vehicle is already booked for some of those dates. Please choose different dates.');
        }

        $price = (float) $car['price_per_day'];
        db_execute(
            'INSERT INTO bookings (user_id, car_id, vehicle_name, start_date, end_date, total_days, price_per_day, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $user['id'], $carId, $car['name'],
                $start->format('Y-m-d'), $end->format('Y-m-d'),
                $days, $price, round($price * $days, 2), 'pending',
            ],
        );
        $id = (int) $pdo->lastInsertId();
        db_execute('UPDATE bookings SET booking_number = ? WHERE id = ?', [sprintf('BK-%s-%05d', date('Y'), $id), $id]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    json_response(['booking' => booking_to_json(find_booking_or_404($id))], 201);
}

/** Admin: move a booking through pending → confirmed → active → completed. */
function bookings_update_status(int $id): never
{
    require_admin();
    $v = new Validator(json_input());
    $status = $v->oneOf('status', BOOKING_STATUSES);
    $v->validate();

    $booking = find_booking_or_404($id);
    if ($booking['status'] === 'cancelled') {
        abort(409, 'Cancelled bookings cannot be changed.');
    }

    db_execute('UPDATE bookings SET status = ? WHERE id = ?', [$status, $id]);
    json_response(['booking' => booking_to_json(find_booking_or_404($id))]);
}

/** Admins can cancel any open booking; customers can cancel their own before the rental starts. */
function bookings_cancel(int $id): never
{
    $user = require_user();
    $booking = find_booking_or_404($id);
    $isAdmin = $user['role'] === 'admin';

    if (!$isAdmin && (int) $booking['user_id'] !== (int) $user['id']) {
        abort(404, 'Booking not found.');
    }

    $cancellable = $isAdmin ? ['pending', 'confirmed', 'active'] : ['pending', 'confirmed'];
    if (!in_array($booking['status'], $cancellable, true)) {
        abort(409, "A booking that is {$booking['status']} cannot be cancelled.");
    }

    db_execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [$id]);
    json_response(['booking' => booking_to_json(find_booking_or_404($id))]);
}
