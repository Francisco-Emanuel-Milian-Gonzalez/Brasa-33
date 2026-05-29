-- manager_id en restaurants + image_url en menu
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS manager_id VARCHAR(50);

ALTER TABLE menu ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Migrar asignaciones previas de restaurant_managers si existe la tabla
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_managers') THEN
    UPDATE restaurants r
    SET manager_id = rm.user_id
    FROM restaurant_managers rm
    WHERE r.id = rm.restaurant_id AND r.manager_id IS NULL;
  END IF;
END $$;
