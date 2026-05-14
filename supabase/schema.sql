-- NoiDue - Schema Supabase

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Couples
CREATE TABLE couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Couple Members
CREATE TABLE couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(couple_id, user_id)
);

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('date', 'escape', 'big_trip', 'custom')),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  location text,
  budget numeric,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'done', 'missed')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Event Checklist Items
CREATE TABLE event_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_done boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Date Ideas
CREATE TABLE date_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  level text DEFAULT 'romantic' CHECK (level IN ('chill', 'romantic', 'adventure', 'home', 'surprise')),
  estimated_budget numeric,
  estimated_duration text,
  location text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Memories
CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  title text NOT NULL,
  note text,
  photo_url text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Reminders
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  remind_at timestamp with time zone NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Triggers per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Helper: evita ricorsione infinita nelle policy su couple_members
CREATE OR REPLACE FUNCTION public.get_my_couple_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS 'SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid();';

-- Profiles: ogni utente vede solo se stesso e il partner
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR id IN (
      SELECT user_id FROM couple_members
      WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Couples: solo membri della coppia
CREATE POLICY "couples_select_member" ON couples
  FOR SELECT USING (
    id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "couples_insert_creator" ON couples
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "couples_update_member" ON couples
  FOR UPDATE USING (
    id IN (SELECT public.get_my_couple_ids())
  );

-- Couple Members: solo membri della stessa coppia
CREATE POLICY "couple_members_select" ON couple_members
  FOR SELECT USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "couple_members_insert_self" ON couple_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Events: solo membri della coppia
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

-- Event Checklist Items: eredita permessi dall'evento
CREATE POLICY "checklist_select" ON event_checklist_items
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "checklist_insert" ON event_checklist_items
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "checklist_update" ON event_checklist_items
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "checklist_delete" ON event_checklist_items
  FOR DELETE USING (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

-- Date Ideas: solo membri della coppia
CREATE POLICY "ideas_select" ON date_ideas
  FOR SELECT USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "ideas_insert" ON date_ideas
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "ideas_update" ON date_ideas
  FOR UPDATE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "ideas_delete" ON date_ideas
  FOR DELETE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

-- Memories: solo membri della coppia
CREATE POLICY "memories_select" ON memories
  FOR SELECT USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "memories_insert" ON memories
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "memories_update" ON memories
  FOR UPDATE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

CREATE POLICY "memories_delete" ON memories
  FOR DELETE USING (
    couple_id IN (SELECT public.get_my_couple_ids())
  );

-- Reminders: solo membri della coppia
CREATE POLICY "reminders_select" ON reminders
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "reminders_insert" ON reminders
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

CREATE POLICY "reminders_update" ON reminders
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events WHERE couple_id IN (
        SELECT public.get_my_couple_ids()
      )
    )
  );

-- Trigger per creare profilo alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
