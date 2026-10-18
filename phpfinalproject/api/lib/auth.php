<?php
declare(strict_types=1);

const SESSION_NAME = 'lotr_session';

function start_session(): void
{
    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/** The logged-in user, re-read from the database so role changes and deletions apply immediately. */
function current_user(): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if ($userId === null) {
        return null;
    }

    $user = db_fetch('SELECT id, name, email, role FROM users WHERE id = ?', [$userId]);
    if ($user === null) {
        unset($_SESSION['user_id']);
    }
    return $user;
}

function require_user(): array
{
    return current_user() ?? abort(401, 'Please log in first.');
}

function require_admin(): array
{
    $user = require_user();
    if ($user['role'] !== 'admin') {
        abort(403, 'Admin access is required.');
    }
    return $user;
}

function log_in(int $userId): void
{
    // A new session ID on login prevents session fixation attacks.
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
}

function log_out(): void
{
    $_SESSION = [];
    $params = session_get_cookie_params();
    setcookie(SESSION_NAME, '', [
        'expires' => time() - 3600,
        'path' => $params['path'],
        'secure' => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => $params['samesite'],
    ]);
    session_destroy();
}

function user_to_json(array $user): array
{
    return [
        'id' => (string) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ];
}
