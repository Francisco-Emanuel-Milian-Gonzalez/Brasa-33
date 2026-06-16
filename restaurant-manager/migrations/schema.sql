-- ============================================================
-- BRASA 33 - Restaurant Manager: Schema Completo
-- Ejecutar en orden. Compatible con PostgreSQL 13+
-- ============================================================

-- ============================================================
-- TABLAS BASE (existentes - crear si no existen)
-- ============================================================

CREATE TABLE IF NOT EXISTS restaurants (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  email       VARCHAR(255),
  description TEXT,
  logo_url    VARCHAR(500),
  manager_id  VARCHAR(50),
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255)   NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
  stock         INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  restaurant_id INT            NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category      VARCHAR(50)    DEFAULT 'main'
                  CHECK (category IN ('starter','main','dessert','beverage','other')),
  ingredients   TEXT,
  image_url     VARCHAR(500),
  is_available  BOOLEAN        DEFAULT TRUE,
  created_at    TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(50)    NOT NULL,
  restaurant_id INT            REFERENCES restaurants(id) ON DELETE SET NULL,
  total         DECIMAL(10,2)  NOT NULL CHECK (total >= 0),
  status        VARCHAR(20)    DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','preparing','ready','completed','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id        SERIAL PRIMARY KEY,
  order_id  INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id   INT           NOT NULL REFERENCES menu(id),
  quantity  INT           NOT NULL CHECK (quantity > 0),
  price     DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id         SERIAL PRIMARY KEY,
  order_id   INT           NOT NULL REFERENCES orders(id),
  user_id    VARCHAR(50)   NOT NULL,
  amount     DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  method     VARCHAR(30)   NOT NULL
               CHECK (method IN ('card','cash','transfer')),
  status     VARCHAR(20)   DEFAULT 'paid'
               CHECK (status IN ('paid','refunded','pending')),
  created_at TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(50)  NOT NULL,
  restaurant_id INT          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date          DATE         NOT NULL,
  time          TIME         NOT NULL,
  people_count  INT          NOT NULL CHECK (people_count > 0),
  type          VARCHAR(20)  DEFAULT 'table'
                  CHECK (type IN ('table','delivery','takeaway')),
  notes         TEXT,
  status        VARCHAR(20)  DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','cancelled','completed')),
  table_id      INT,
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- NUEVAS TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS tables (
  id            SERIAL PRIMARY KEY,
  restaurant_id INT          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  number        INT          NOT NULL CHECK (number > 0),
  capacity      INT          NOT NULL CHECK (capacity > 0),
  location      VARCHAR(100),
  status        VARCHAR(20)  DEFAULT 'available'
                  CHECK (status IN ('available','occupied','reserved','maintenance')),
  created_at    TIMESTAMP    DEFAULT NOW(),
  UNIQUE (restaurant_id, number)
);

CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(50) NOT NULL,
  restaurant_id INT         REFERENCES restaurants(id) ON DELETE SET NULL,
  menu_id       INT       REFERENCES menu(id) ON DELETE SET NULL,
  rating        INT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  CONSTRAINT reviews_target_check
    CHECK (restaurant_id IS NOT NULL OR menu_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS promotions (
  id               SERIAL PRIMARY KEY,
  restaurant_id    INT            NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title            VARCHAR(255)   NOT NULL,
  description      TEXT,
  discount_percent DECIMAL(5,2)   CHECK (discount_percent BETWEEN 0 AND 100),
  start_date       DATE,
  end_date         DATE,
  status           VARCHAR(20)    DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected','active','expired')),
  created_at       TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id         SERIAL PRIMARY KEY,
  order_id   INT           NOT NULL REFERENCES orders(id),
  user_id    VARCHAR(50)   NOT NULL,
  subtotal   DECIMAL(10,2) NOT NULL,
  tax        DECIMAL(10,2) NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL,
  notes      TEXT,
  issued_at  TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
-- MIGRACIONES SOBRE TABLAS EXISTENTES
-- (ejecutar con IF NOT EXISTS / DO BLOCK para idempotencia)
-- ============================================================

DO $$
BEGIN
  -- menu: category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='menu' AND column_name='category'
  ) THEN
    ALTER TABLE menu
      ADD COLUMN category VARCHAR(50) DEFAULT 'main'
        CHECK (category IN ('starter','main','dessert','beverage','other'));
  END IF;

  -- menu: ingredients
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='menu' AND column_name='ingredients'
  ) THEN
    ALTER TABLE menu ADD COLUMN ingredients TEXT;
  END IF;

  -- menu: is_available
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='menu' AND column_name='is_available'
  ) THEN
    ALTER TABLE menu ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
  END IF;

  -- orders: restaurant_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='restaurant_id'
  ) THEN
    ALTER TABLE orders
      ADD COLUMN restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL;
  END IF;

  -- orders: notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes TEXT;
  END IF;

  -- orders: status constraint (agrega preparing y ready)
  -- (no se puede modificar CHECK directamente; se borra y recrea)

  -- reservations: type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='reservations' AND column_name='type'
  ) THEN
    ALTER TABLE reservations
      ADD COLUMN type VARCHAR(20) DEFAULT 'table'
        CHECK (type IN ('table','delivery','takeaway'));
  END IF;

  -- reservations: notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='reservations' AND column_name='notes'
  ) THEN
    ALTER TABLE reservations ADD COLUMN notes TEXT;
  END IF;

  -- reservations: table_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='reservations' AND column_name='table_id'
  ) THEN
    ALTER TABLE reservations
      ADD COLUMN table_id INT REFERENCES tables(id) ON DELETE SET NULL;
  END IF;

  -- restaurants: email, description, logo_url, is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='restaurants' AND column_name='email'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN email VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='restaurants' AND column_name='description'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='restaurants' AND column_name='is_active'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

END $$;

-- ============================================================
-- ÍNDICES (performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_menu_restaurant       ON menu(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user           ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant     ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order        ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user         ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user     ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_rest     ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date     ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant     ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant    ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu          ON reviews(menu_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user          ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status     ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_order        ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user         ON invoices(user_id);

-- Asignación gerente ↔ restaurante (user_id del auth-service)
CREATE TABLE IF NOT EXISTS restaurant_managers (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(50) NOT NULL UNIQUE,
  restaurant_id INT         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at    TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_managers_user ON restaurant_managers(user_id);
