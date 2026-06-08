
ALTER TABLE reservations ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE orders       ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE payments     ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE reviews      ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE invoices     ALTER COLUMN user_id TYPE VARCHAR(50);

CREATE TABLE IF NOT EXISTS restaurant_managers (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(50) NOT NULL UNIQUE,
  restaurant_id INT         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at    TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_managers_user ON restaurant_managers(user_id);
