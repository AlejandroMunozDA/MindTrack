-- TABLA DE PERFILES (VINCULADA A AUTH)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE HÁBITOS
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  days TEXT[] NOT NULL,
  grad TEXT NOT NULL,
  hex TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE DÍAS PERFECTOS (RACHAS)
CREATE TABLE perfect_days (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- TABLA DE NOTAS
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  grad TEXT,
  hex TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ACTIVIDADES
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  grad TEXT,
  hex TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE RECORDATORIOS (AGENDA)
CREATE TABLE agenda (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  grad TEXT,
  hex TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE CATEGORÍAS DE LECTURA
CREATE TABLE reading_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ARCHIVOS DE LECTURA
CREATE TABLE reading_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name_storage TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR SEGURIDAD (RLS) PARA TODAS LAS TABLAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfect_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_files ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: LOS USUARIOS SOLO VEN SUS PROPIOS DATOS
CREATE POLICY "Users can see their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can see their own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own perfect days" ON perfect_days FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own activities" ON activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own agenda" ON agenda FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own categories" ON reading_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own files" ON reading_files FOR ALL USING (auth.uid() = user_id);
