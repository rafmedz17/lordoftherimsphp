# Lord of the Rims: Luxury Car Rentals

A car rental website with a **React** frontend and a **PHP + MySQL/MariaDB** backend.

- Customers can browse the fleet, create an account, book a car for specific dates, and track or cancel their bookings.
- Admins manage vehicles (including photo uploads) and move bookings through `pending → confirmed → active → completed`.

## How it fits together

```
phpfinalproject/
├── api/                  PHP backend (REST API, JSON in/out)
│   ├── index.php         Router: every /api/* request lands here
│   ├── .htaccess         Sends all /api/* requests to index.php
│   ├── config.example.php  Copy to config.php and add database details
│   ├── lib/              Database, sessions/auth, validation, HTTP helpers
│   └── handlers/         Endpoints: auth, cars, bookings, admin stats, uploads
├── database/
│   ├── schema.sql        Tables: users, cars, bookings
│   └── seed.sql          The 6 starter cars
├── src/                  React app (Vite + TypeScript + Tailwind + shadcn/ui)
├── public/.htaccess      Apache rules so routes like /cars/3 load the React app
└── scripts/copy-api.mjs  Puts api/ into dist/ during the build
```

`npm run build` produces a single `dist/` folder containing the React app **and** the PHP API. That folder is exactly what goes into the web root on the server.

### Security notes

- Passwords are hashed with `password_hash()` (bcrypt). They are never stored or logged in plain text.
- Logins use PHP session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` on HTTPS). The session ID is regenerated on login.
- Admin rights are checked **on the server** for every admin endpoint. Hiding buttons in the UI is not what protects them.
- Every SQL query uses PDO prepared statements.
- State-changing requests must come from the site's own origin and send JSON (CSRF protection).
- Image uploads are checked by their real content (JPG/PNG/WebP only, 5 MB max) and saved under random names.
- Double bookings are prevented with an overlap check inside a transaction that locks the car's row.

## API endpoints

| Method | Path | Who | What |
| --- | --- | --- | --- |
| GET | `/api/auth/me` | anyone | Current user, or `null` |
| POST | `/api/auth/register` | anyone | Create a customer account and log in |
| POST | `/api/auth/login` | anyone | Log in (`"admin": true` rejects non-admins) |
| POST | `/api/auth/logout` | anyone | Log out |
| GET | `/api/cars` | anyone | All vehicles |
| GET | `/api/cars/{id}` | anyone | One vehicle |
| GET | `/api/cars/{id}/booked` | anyone | Booked date ranges (for the calendar) |
| POST | `/api/cars` | admin | Add a vehicle |
| PUT | `/api/cars/{id}` | admin | Update a vehicle |
| DELETE | `/api/cars/{id}` | admin | Delete a vehicle (blocked while it has open bookings) |
| POST | `/api/uploads` | admin | Upload a vehicle photo (multipart field `image`) |
| POST | `/api/bookings` | customer | Book a car: `{ vehicleId, startDate, endDate }` |
| GET | `/api/bookings/mine` | customer | The customer's own bookings |
| POST | `/api/bookings/{id}/cancel` | owner or admin | Cancel a booking |
| GET | `/api/bookings` | admin | All bookings |
| PATCH | `/api/bookings/{id}/status` | admin | Change a booking's status |
| GET | `/api/admin/stats` | admin | Dashboard numbers and recent bookings |

Dates are `YYYY-MM-DD`. A booking from the 20th to the 25th is 5 days. The car is returned on the 25th and can be picked up again that same day.

---

## Run it on your computer

You need:
- Node.js 18+
- PHP 8.1+ with the `pdo_mysql`, `mbstring` and `fileinfo` extensions
- MySQL or MariaDB (XAMPP provides both)

1. **Install the frontend packages**
   ```sh
   npm install
   ```
2. **Create the database.** In phpMyAdmin (or the `mysql` command line):
   - create a database called `lordoftherims` (collation `utf8mb4_unicode_ci`);
   - import `database/schema.sql`, then `database/seed.sql`.
3. **Configure the API.** Copy `api/config.example.php` to `api/config.php` and set your database user and password. The XAMPP default is user `root` with an empty password. Set `'debug' => true` locally to see error details.
4. **Start both servers** in two terminals:
   ```sh
   npm run dev:api   # PHP API on http://127.0.0.1:8000
   npm run dev       # React app on http://localhost:8080 (forwards /api to PHP)
   ```
5. Open http://localhost:8080.

If `php` isn't recognised, add your PHP folder (e.g. `C:\xampp\php`) to your `PATH`, or run `C:\xampp\php\php.exe -S 127.0.0.1:8000 api/dev-router.php` instead of `npm run dev:api`.

## Make yourself an admin

There is no public admin sign-up, on purpose:

1. Create a normal account on the website ("Login" → "Create one").
2. In phpMyAdmin, run this on your database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
   ```
3. Go to `/adminlogin` and sign in with that account.

---

## Deploy to alwaysdata

Replace `ACCOUNT` below with your alwaysdata account name. Your site will be at `https://ACCOUNT.alwaysdata.net`.

### 1. Create the database

1. In the alwaysdata admin panel, open **Databases → MySQL**. (alwaysdata runs MariaDB, which works the same way.)
2. Add a database, e.g. `ACCOUNT_lordoftherims`. alwaysdata adds the `ACCOUNT_` prefix.
3. Under the **Users** tab of the same page, make sure a database user has **all privileges** on that database, and note its password.
4. Open **phpMyAdmin** at https://phpmyadmin.alwaysdata.com and log in with that database user.
5. Select your database → **Import** → upload `database/schema.sql`. Then import `database/seed.sql` the same way.

### 2. Check the site settings

1. Open **Web → Sites** and edit your site (one is created with the account).
2. The **type** must be **PHP**, and note the **root directory** (normally `/www/`).
3. Under **Environment → PHP** (or on the site itself), choose PHP **8.1 or newer**. 8.3 is a good choice.

### 3. Build and upload

1. On your computer:
   ```sh
   npm run build
   ```
2. Connect with an SFTP client such as FileZilla:
   - Host: `ssh-ACCOUNT.alwaysdata.net`
   - Port: `22`
   - Username and password: your alwaysdata SSH login (by default your account name; see **Remote access → SSH**)
3. In FileZilla, turn on **Server → Force showing hidden files** so the `.htaccess` files get uploaded.
4. Upload **the contents of `dist/`** (not the `dist` folder itself) into `/www/`. You should end up with `/www/index.html`, `/www/.htaccess`, `/www/assets/` and `/www/api/`.

### 4. Add the server config

Create `/www/api/config.php` on the server. The easiest way is to copy `config.example.php` to `config.php` and edit it in FileZilla:

```php
'db' => [
    'host' => 'mysql-ACCOUNT.alwaysdata.net',
    'port' => 3306,
    'name' => 'ACCOUNT_lordoftherims',
    'user' => 'YOUR_DB_USER',
    'pass' => 'YOUR_DB_PASSWORD',
],
'debug' => false,
```

This file is **not** part of `dist/` and is git-ignored, so your password never ends up in Git and redeploys don't overwrite it.

### 5. Try it

1. Open `https://ACCOUNT.alwaysdata.net`. The 6 cars should appear.
2. Visit `https://ACCOUNT.alwaysdata.net/api/cars`. You should see JSON.
3. Create your account, make it admin with the SQL from [Make yourself an admin](#make-yourself-an-admin), then sign in at `/adminlogin`.
4. In **Manage Vehicles**, upload real photos for each car. The starter cars use a placeholder image.

### Updating the live site later

Run `npm run build` again and upload the contents of `dist/` over `/www/`. Two things stay on the server because they aren't in `dist/`:
- `api/config.php`
- the `uploads/` folder with vehicle photos

So **don't delete `/www/` before uploading**.

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| Refreshing `/cars/3` gives a 404 | `/www/.htaccess` wasn't uploaded (hidden file). Turn on hidden files in FileZilla and upload it. |
| `/api/cars` shows "Something went wrong on the server" | Usually the database settings. Temporarily set `'debug' => true` in `/www/api/config.php` to see the real error, then set it back to `false`. |
| `/api/cars` shows PHP source code or a 404 page | The site type isn't PHP, or `/www/api/.htaccess` is missing. |
| Photo upload fails | Check that the site can write to `/www/uploads/`. It is created automatically on the first upload. |
