-- ============================================================
-- NEXUSSGE — LIMPIEZA TOTAL DE RESTRICCIONES DE FOREIGN KEYS
-- Esto borra TODAS las reglas antiguas (que ponían el valor en NULL) 
-- y crea UNA ÚNICA regla que borra en cascada.
-- ============================================================

DO $$
DECLARE 
    r RECORD;
BEGIN
    -- 1. Eliminar TODAS las restricciones de llave foránea en 'invoices' que apuntan a 'project_id'
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'invoices' AND column_name = 'project_id'
    ) LOOP
        EXECUTE 'ALTER TABLE invoices DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;

    -- 2. Eliminar TODAS las restricciones de llave foránea en 'contracts' que apuntan a 'project_id'
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'contracts' AND column_name = 'project_id'
    ) LOOP
        EXECUTE 'ALTER TABLE contracts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- 3. Crear las nuevas restricciones definitivas (ON DELETE CASCADE)
    ALTER TABLE invoices
        ADD CONSTRAINT invoices_project_id_fkey
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

    ALTER TABLE contracts
        ADD CONSTRAINT contracts_project_id_fkey
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

END $$;
