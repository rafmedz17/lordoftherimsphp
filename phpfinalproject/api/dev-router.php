<?php
// Router for PHP's built-in server during local development (`npm run dev:api`).
// Uploaded images are served as plain files; everything else goes to the API.
// Not used in production, where Apache and api/.htaccess do this job.

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (str_starts_with($path, '/uploads/')) {
    return false;
}

require __DIR__ . '/index.php';
