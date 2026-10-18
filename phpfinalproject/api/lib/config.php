<?php
declare(strict_types=1);

/** Loads api/config.php once and returns its settings. */
function config(): array
{
    static $config = null;

    if ($config === null) {
        $file = dirname(__DIR__) . '/config.php';
        if (!is_file($file)) {
            throw new RuntimeException(
                'api/config.php is missing. Copy api/config.example.php to api/config.php and fill in your database details.'
            );
        }
        $config = require $file;
    }

    return $config;
}
