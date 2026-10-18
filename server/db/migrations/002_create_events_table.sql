-- Migration 002: Create events table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Technical', 'Cultural', 'Sports', 'Workshops', 'Entrepreneurship') NOT NULL,
  venue VARCHAR(255) NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  capacity INT UNSIGNED NOT NULL,
  poster_url VARCHAR(1024) NULL,
  status ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'published',
  organizer_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_events_category (category),
  INDEX idx_events_status (status),
  INDEX idx_events_start_datetime (start_datetime),
  INDEX idx_events_organizer_id (organizer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
