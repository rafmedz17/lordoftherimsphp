<?php
declare(strict_types=1);

/** Shared PDO connection. All queries use prepared statements. */
function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $c = config()['db'];
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $c['host'],
            $c['port'] ?? 3306,
            $c['name'],
        );
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        // Store timestamps in UTC so they convert cleanly to ISO 8601 for the frontend.
        $pdo->exec("SET time_zone = '+00:00'");
    }

    return $pdo;
}

function db_fetch(string $sql, array $params = []): ?array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch() ?: null;
}

function db_fetch_all(string $sql, array $params = []): array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function db_execute(string $sql, array $params = []): int
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

function is_duplicate_key(PDOException $e): bool
{
    return ($e->errorInfo[1] ?? null) === 1062;
}

/** Converts a UTC DATETIME column value to ISO 8601. */
function iso_datetime(?string $value): ?string
{
    return $value === null ? null : str_replace(' ', 'T', $value) . 'Z';
}
