-- Brasa-33: restaurant hours, inventory, notifications, table availability, order paid_at

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_time TIME;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS closing_time TIME;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

ALTER TABLE tables ADD COLUMN IF NOT EXISTS available_from TIME;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS available_to TIME;

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  ingredient VARCHAR(200) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50),
  min_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_restaurant ON inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read);
