<?php
// Lord of the Rims API: every request under /api is routed here (see api/.htaccess).
declare(strict_types=1);

// Never print PHP errors (with server paths) to visitors; they go to the error log.
ini_set('display_errors', '0');

require __DIR__ . '/lib/config.php';
require __DIR__ . '/lib/http.php';
require __DIR__ . '/lib/database.php';
require __DIR__ . '/lib/validator.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/handlers/auth.php';
require __DIR__ . '/handlers/cars.php';
require __DIR__ . '/handlers/bookings.php';
require __DIR__ . '/handlers/admin.php';
require __DIR__ . '/handlers/uploads.php';

// Turn PHP warnings into exceptions so nothing half-works silently.
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function (Throwable $e): void {
    if ($e instanceof HttpError) {
        $body = ['error' => $e->getMessage()];
        if ($e->fields) {
            $body['fields'] = $e->fields;
        }
        json_response($body, $e->status);
    }

    error_log((string) $e);
    $body = ['error' => 'Something went wrong on the server. Please try again.'];
    try {
        if (config()['debug'] ?? false) {
            $body['debug'] = $e->getMessage();
        }
    } catch (Throwable) {
        // config.php itself is missing; the error log has the details.
    }
    json_response($body, 500);
});

date_default_timezone_set(config()['timezone'] ?? 'UTC');

// [method, path pattern, handler]. Captured numbers are passed to the handler as ints.
$routes = [
    ['GET', '#^/auth/me$#', 'auth_me'],
    ['POST', '#^/auth/register$#', 'auth_register'],
    ['POST', '#^/auth/login$#', 'auth_login'],
    ['POST', '#^/auth/logout$#', 'auth_logout'],

    ['GET', '#^/cars$#', 'cars_index'],
    ['POST', '#^/cars$#', 'cars_store'],
    ['GET', '#^/cars/(\d+)$#', 'cars_show'],
    ['PUT', '#^/cars/(\d+)$#', 'cars_update'],
    ['DELETE', '#^/cars/(\d+)$#', 'cars_destroy'],
    ['GET', '#^/cars/(\d+)/booked$#', 'cars_booked'],

    ['GET', '#^/bookings$#', 'bookings_index'],
    ['POST', '#^/bookings$#', 'bookings_store'],
    ['GET', '#^/bookings/mine$#', 'bookings_mine'],
    ['PATCH', '#^/bookings/(\d+)/status$#', 'bookings_update_status'],
    ['POST', '#^/bookings/(\d+)/cancel$#', 'bookings_cancel'],

    ['GET', '#^/admin/stats$#', 'admin_stats'],
    ['POST', '#^/uploads$#', 'uploads_store'],
];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = api_path();

if ($method !== 'GET' && $method !== 'HEAD') {
    require_same_origin();
}
start_session();

$pathExists = false;
foreach ($routes as [$routeMethod, $pattern, $handler]) {
    if (!preg_match($pattern, $path, $matches)) {
        continue;
    }
    $pathExists = true;
    if ($routeMethod === $method) {
        $handler(...array_map('intval', array_slice($matches, 1)));
    }
}

$pathExists
    ? abort(405, "Method $method is not allowed for $path.")
    : abort(404, "No API endpoint at $path.");
