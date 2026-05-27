-- ============================================================
-- NEXUSSGE — Script SQL Defensivo para Supabase SQL Editor
-- Asegura que contracts e invoices tengan la estructura correcta
-- ============================================================

-- 1. ASEGURAR COLUMNAS EN 'contracts'
-- ============================================================

-- Agregar client_id si no existe (para vincular contrato al cliente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN client_id bigint;
  END IF;
END $$;

-- Agregar project_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN project_id bigint;
  END IF;
END $$;

-- 2. ASEGURAR COLUMNAS EN 'invoices'
-- ============================================================

-- Verificar que invoices tenga invoice_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE invoices ADD COLUMN invoice_number text;
  END IF;
END $$;

-- Verificar que invoices tenga project_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN project_id bigint;
  END IF;
END $$;

-- Verificar que invoices tenga client_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN client_id bigint;
  END IF;
END $$;

-- Verificar que invoices tenga amount
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN amount numeric DEFAULT 0;
  END IF;
END $$;

-- Verificar que invoices tenga status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Verificar que invoices tenga created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE invoices ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 3. ASEGURAR COLUMNA tax_rate EN 'projects'
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE projects ADD COLUMN tax_rate integer DEFAULT 0;
  END IF;
END $$;

-- 4. FOREIGN KEYS (necesarias para que Supabase haga joins relacionales)
-- ============================================================

-- FK: invoices.project_id -> projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_project_id_fkey'
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- FK: invoices.client_id -> clients.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_client_id_fkey'
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- FK: contracts.project_id -> projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contracts_project_id_fkey'
      AND table_name = 'contracts'
  ) THEN
    ALTER TABLE contracts
      ADD CONSTRAINT contracts_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- FK: contracts.client_id -> clients.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contracts_client_id_fkey'
      AND table_name = 'contracts'
  ) THEN
    ALTER TABLE contracts
      ADD CONSTRAINT contracts_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. HABILITAR RLS (si no estaba habilitado)
-- ============================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policies permisivas para usuarios autenticados (ajustar según tu esquema de seguridad)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'invoices_all_authenticated' AND tablename = 'invoices'
  ) THEN
    CREATE POLICY invoices_all_authenticated ON invoices
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'contracts_all_authenticated' AND tablename = 'contracts'
  ) THEN
    CREATE POLICY contracts_all_authenticated ON contracts
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- FIN DEL SCRIPT — Copiar y pegar en Supabase SQL Editor → Run
-- ============================================================
