-- Estructura SQL real para el TP3 - NEXUSS

CREATE TABLE operador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL,
    ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_empresa TEXT NOT NULL,
    contacto_principal TEXT,
    estado_pago TEXT NOT NULL DEFAULT 'AL DIA',
    historial_facturacion NUMERIC DEFAULT 0.0
);

CREATE TABLE proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    estado_fase TEXT NOT NULL DEFAULT 'BACKLOG',
    deadline DATE,
    progress_porcentaje NUMERIC DEFAULT 0.0,
    repositorio_git TEXT,
    archivo_documentacion TEXT,
    stack_tech TEXT[],
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE gastooperative (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    tipo_moneda TEXT NOT NULL DEFAULT 'ARS',
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);