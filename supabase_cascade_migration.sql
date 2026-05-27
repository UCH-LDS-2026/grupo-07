-- ============================================================
-- NEXUSSGE — Actualización de Foreign Keys para Cascading Delete
-- Permite que al eliminar un proyecto, se eliminen contratos y facturas
-- ============================================================

-- 1. Actualizar FK de INVOICES (Facturas)
DO $$
BEGIN
  -- Eliminar la restricción actual si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_project_id_fkey'
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_project_id_fkey;
  END IF;

  -- Crear la nueva restricción con ON DELETE CASCADE
  ALTER TABLE invoices
    ADD CONSTRAINT invoices_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
END $$;

-- 2. Actualizar FK de CONTRACTS (Contratos)
DO $$
BEGIN
  -- Eliminar la restricción actual si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contracts_project_id_fkey'
      AND table_name = 'contracts'
  ) THEN
    ALTER TABLE contracts DROP CONSTRAINT contracts_project_id_fkey;
  END IF;

  -- Crear la nueva restricción con ON DELETE CASCADE
  ALTER TABLE contracts
    ADD CONSTRAINT contracts_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
END $$;

-- 3. (Opcional) Hacer lo mismo para los clientes, para que si borras un cliente se borren sus facturas/contratos
DO $$
BEGIN
  -- INVOICES -> CLIENTS
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_client_id_fkey'
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_client_id_fkey;
  END IF;
  
  ALTER TABLE invoices
    ADD CONSTRAINT invoices_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

  -- CONTRACTS -> CLIENTS
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contracts_client_id_fkey'
      AND table_name = 'contracts'
  ) THEN
    ALTER TABLE contracts DROP CONSTRAINT contracts_client_id_fkey;
  END IF;

  ALTER TABLE contracts
    ADD CONSTRAINT contracts_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;
