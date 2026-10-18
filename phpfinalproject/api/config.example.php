<?php
// Copy this file to api/config.php and fill in your own values.
// config.php is git-ignored: never commit real passwords.

return [
    'db' => [
        // Local XAMPP/MariaDB: 127.0.0.1, user root, empty password.
        // alwaysdata: mysql-ACCOUNT.alwaysdata.net, database ACCOUNT_lordoftherims,
        // and the database user/password you created under Databases > MySQL.
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'lordoftherims',
        'user' => 'root',
        'pass' => '',
    ],

    // Timezone used to decide what "today" is for bookings.
    'timezone' => 'Asia/Manila',

    // Include PHP error messages in API responses. Keep false in production.
    'debug' => false,

    // Where uploaded vehicle images are saved and the URL they are served from.
    // The default puts them in an "uploads" folder next to the "api" folder.
    'upload_dir' => dirname(__DIR__) . '/uploads',
    'upload_url' => '/uploads',
];
