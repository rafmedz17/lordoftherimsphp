<?php
declare(strict_types=1);

/** Booking statuses that occupy a car's calendar. */
const BLOCKING_STATUSES = ['pending', 'confirmed', 'active'];

function car_to_json(array $car): array
{
    return [
        'id' => (string) $car['id'],
        'name' => $car['name'],
        'brand' => $car['brand'],
        'category' => $car['category'],
        'pricePerDay' => (float) $car['price_per_day'],
        'image' => $car['image'],
        'seats' => (int) $car['seats'],
        'transmission' => $car['transmission'],
        'fuel' => $car['fuel'],
        'available' => (bool) $car['available'],
        'description' => $car['description'],
        'year' => $car['year'] === null ? null : (int) $car['year'],
        'mileage' => $car['mileage'],
        'features' => json_decode($car['features'] ?? '[]', true) ?: [],
        'images' => json_decode($car['images'] ?? '[]', true) ?: [],
    ];
}

function find_car_or_404(int $id): array
{
    return db_fetch('SELECT * FROM cars WHERE id = ?', [$id]) ?? abort(404, 'Vehicle not found.');
}

/** Validates the vehicle form and returns the column values to save. */
function car_input(): array
{
    $v = new Validator(json_input());
    $values = [
        'name' => $v->string('name', 120),
        'brand' => $v->string('brand', 80),
        'category' => $v->string('category', 80),
        'price_per_day' => $v->number('pricePerDay', 1, 10_000_000),
        'image' => $v->imageUrl('image', required: false) ?? '/placeholder.svg',
        'seats' => $v->int('seats', 1, 60),
        'transmission' => $v->oneOf('transmission', ['Automatic', 'Manual']),
        'fuel' => $v->string('fuel', 40),
        'available' => $v->bool('available', true) ? 1 : 0,
        'description' => $v->string('description', 5000, required: false),
        'year' => $v->int('year', 1900, 2100, required: false),
        'mileage' => $v->string('mileage', 80, required: false),
        'features' => json_encode($v->stringList('features', 30, 100)),
        'images' => json_encode($v->imageUrlList('images', 10)),
    ];
    $v->validate();
    return $values;
}

function cars_index(): never
{
    $cars = db_fetch_all('SELECT * FROM cars ORDER BY id');
    json_response(['cars' => array_map('car_to_json', $cars)]);
}

function cars_show(int $id): never
{
    json_response(['car' => car_to_json(find_car_or_404($id))]);
}

/** Date ranges already taken, so the booking calendar can grey them out. End dates are return days. */
function cars_booked(int $id): never
{
    find_car_or_404($id);
    $placeholders = implode(',', array_fill(0, count(BLOCKING_STATUSES), '?'));
    $rows = db_fetch_all(
        "SELECT start_date, end_date FROM bookings
         WHERE car_id = ? AND status IN ($placeholders) AND end_date > ?
         ORDER BY start_date",
        [$id, ...BLOCKING_STATUSES, (new DateTimeImmutable('today'))->format('Y-m-d')],
    );
    json_response(['ranges' => array_map(
        fn ($r) => ['start' => $r['start_date'], 'end' => $r['end_date']],
        $rows,
    )]);
}

function cars_store(): never
{
    require_admin();
    $values = car_input();

    $columns = implode(', ', array_keys($values));
    $placeholders = implode(', ', array_fill(0, count($values), '?'));
    db_execute("INSERT INTO cars ($columns) VALUES ($placeholders)", array_values($values));

    cars_show_created((int) db()->lastInsertId());
}

function cars_update(int $id): never
{
    require_admin();
    find_car_or_404($id);
    $values = car_input();

    $assignments = implode(', ', array_map(fn ($column) => "$column = ?", array_keys($values)));
    db_execute("UPDATE cars SET $assignments WHERE id = ?", [...array_values($values), $id]);

    cars_show($id);
}

function cars_destroy(int $id): never
{
    require_admin();
    find_car_or_404($id);

    $placeholders = implode(',', array_fill(0, count(BLOCKING_STATUSES), '?'));
    $open = db_fetch(
        "SELECT COUNT(*) AS n FROM bookings WHERE car_id = ? AND status IN ($placeholders)",
        [$id, ...BLOCKING_STATUSES],
    );
    if ((int) $open['n'] > 0) {
        abort(409, 'This vehicle has pending or active bookings. Cancel or complete them first, or mark the vehicle as unavailable.');
    }

    // Past bookings keep their vehicle name; their car_id becomes NULL (see schema.sql).
    db_execute('DELETE FROM cars WHERE id = ?', [$id]);
    json_response(['ok' => true]);
}

function cars_show_created(int $id): never
{
    json_response(['car' => car_to_json(find_car_or_404($id))], 201);
}
