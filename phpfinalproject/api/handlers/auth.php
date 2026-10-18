<?php
declare(strict_types=1);

function auth_me(): never
{
    $user = current_user();
    json_response(['user' => $user ? user_to_json($user) : null]);
}

function auth_register(): never
{
    $v = new Validator(json_input());
    $name = $v->string('name', 100, min: 2);
    $email = $v->email('email');
    $password = $v->password('password');
    $v->validate();

    try {
        db_execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [$name, $email, password_hash($password, PASSWORD_DEFAULT), 'customer'],
        );
    } catch (PDOException $e) {
        if (is_duplicate_key($e)) {
            abort(409, 'An account with this email already exists.', ['email' => 'An account with this email already exists.']);
        }
        throw $e;
    }

    $id = (int) db()->lastInsertId();
    log_in($id);
    json_response(['user' => user_to_json(db_fetch('SELECT * FROM users WHERE id = ?', [$id]))], 201);
}

function auth_login(): never
{
    $data = json_input();
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    $user = db_fetch('SELECT * FROM users WHERE email = ?', [$email]);

    // Hash anyway when the email is unknown so response time doesn't reveal which emails exist.
    $hash = $user['password_hash'] ?? password_hash('timing-safe-placeholder', PASSWORD_DEFAULT);
    if (!password_verify($password, $hash) || $user === null) {
        abort(401, 'Invalid email or password.');
    }

    // The admin login page asks the server to refuse customer accounts.
    if (!empty($data['admin']) && $user['role'] !== 'admin') {
        abort(403, 'This account does not have admin access.');
    }

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        db_execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    log_in((int) $user['id']);
    json_response(['user' => user_to_json($user)]);
}

function auth_logout(): never
{
    log_out();
    json_response(['ok' => true]);
}
