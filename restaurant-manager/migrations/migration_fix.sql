-- Brasa-33: migraciones consolidadas (user_id VARCHAR, manager_id, payment columns)

ALTER TABLE reservations ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE orders ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE payments ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE reviews ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE invoices ALTER COLUMN user_id TYPE VARCHAR(50);

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS manager_id VARCHAR(50);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_last_four VARCHAR(4);
