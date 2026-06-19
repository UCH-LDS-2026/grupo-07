CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ,
    github_user TEXT,
    linkedin_user TEXT,
    instagram_user TEXT
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    drive_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    client TEXT, 
    purpose TEXT,
    tech TEXT,
    status TEXT DEFAULT 'planning',
    progress INT DEFAULT 0,
    git_repo TEXT,
    drive_url TEXT,
    budget NUMERIC,
    paid NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    deadline DATE,
    client_phone TEXT,
    client_email TEXT,
    tax_rate INT DEFAULT 0,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE 
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC,
    status TEXT DEFAULT 'draft',
    legal_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    invoice_number TEXT UNIQUE,
    net_amount NUMERIC,
    tax_amount NUMERIC,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);


CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    concept TEXT NOT NULL,
    category TEXT,
    amount NUMERIC NOT NULL,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);


CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT false,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE operator_assets (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT,
    name TEXT NOT NULL,
    value TEXT,
    extra_info TEXT
);

CREATE TABLE operator_links (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);