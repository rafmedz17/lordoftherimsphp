-- Lord of the Rims database schema (MariaDB 10.4+ / MySQL 8+).
-- Import this first, then seed.sql. Safe to run on an empty database only.

SET NAMES utf8mb4;

CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cars (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  brand         VARCHAR(80) NOT NULL,
  category      VARCHAR(80) NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image         VARCHAR(500) NOT NULL DEFAULT '/placeholder.svg',
  seats         TINYINT UNSIGNED NOT NULL,
  transmission  ENUM('Automatic', 'Manual') NOT NULL,
  fuel          VARCHAR(40) NOT NULL,
  available     TINYINT(1) NOT NULL DEFAULT 1,
  description   TEXT NULL,
  year          SMALLINT UNSIGNED NULL,
  mileage       VARCHAR(80) NULL,
  features      TEXT NULL COMMENT 'JSON array of feature names',
  images        TEXT NULL COMMENT 'JSON array of gallery image URLs',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  booking_number VARCHAR(20) NULL,
  user_id        INT UNSIGNED NOT NULL,
  -- NULL once the car is deleted; vehicle_name keeps the booking history readable.
  car_id         INT UNSIGNED NULL,
  vehicle_name   VARCHAR(120) NOT NULL,
  start_date     DATE NOT NULL COMMENT 'Pickup day',
  end_date       DATE NOT NULL COMMENT 'Return day (not charged)',
  total_days     SMALLINT UNSIGNED NOT NULL,
  price_per_day  DECIMAL(10, 2) NOT NULL COMMENT 'Price at the time of booking',
  total_amount   DECIMAL(12, 2) NOT NULL,
  status         ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookings_number (booking_number),
  KEY idx_bookings_car_dates (car_id, start_date, end_date),
  KEY idx_bookings_user (user_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
