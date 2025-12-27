-- SUPABASE MIGRATION SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. PRODUCTS TABLE
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  "isTrending" BOOLEAN DEFAULT false,
  "isLimited" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ORDERS TABLE
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. USERS TABLE
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  level TEXT DEFAULT 'BASIC MEMBER',
  "isElite" BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SUPPORT TABLE
CREATE TABLE support (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  reason TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SITE CONFIG TABLE
CREATE TABLE site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- ENABLE PUBLIC ACCESS (Optional - based on your RLS requirements)
-- For development, you can disable RLS or add policies.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON products FOR ALL USING (true); -- Note: In prod, restrict this!

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert Access" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Access" ON orders FOR ALL USING (true);

ALTER TABLE support ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert Access" ON support FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Access" ON support FOR ALL USING (true);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON site_config FOR ALL USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON users FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Access" ON users FOR ALL USING (true);

-- STORAGE BUCKET
-- Ensure you manually create a bucket named 'uploads' in the Supabase Dashboard
-- And set its policy to "Public" for reading.
