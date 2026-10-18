<?php
declare(strict_types=1);

/** An error that should be sent to the client as-is, with an HTTP status code. */
final class HttpError extends Exception
{
    /** @param array<string, string> $fields Per-field validation messages. */
    public function __construct(
        public readonly int $status,
        string $message,
        public readonly array $fields = [],
    ) {
        parent::__construct($message);
    }
}

function abort(int $status, string $message, array $fields = []): never
{
    throw new HttpError($status, $message, $fields);
}

function json_response(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Decodes the JSON request body. Requiring the JSON content type also blocks cross-site form posts. */
function json_input(): array
{
    $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
    if (!str_starts_with($type, 'application/json')) {
        abort(415, 'Expected a JSON request body.');
    }

    $data = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($data)) {
        abort(400, 'The request body is not valid JSON.');
    }

    return $data;
}

/** Rejects state-changing requests sent from another website (CSRF protection). */
function require_same_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if ($origin === null) {
        return; // Non-browser clients don't send Origin; the SameSite cookie still protects sessions.
    }

    $parts = parse_url($origin);
    $originHost = ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
    if (strcasecmp($originHost, $_SERVER['HTTP_HOST'] ?? '') !== 0) {
        abort(403, 'Cross-site requests are not allowed.');
    }
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

/** The request path relative to the API root, e.g. "/cars/3" for "/api/cars/3". */
function api_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = preg_replace('#^.*?/api(?=/|$)#', '', $path, 1);
    return '/' . trim($path, '/');
}
