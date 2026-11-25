-- ========================================================
-- SWAYAMVAR SUPABASE SCHEMA (2-TABLE RELATIONAL STRUCTURE)
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hssiqewqibjhwtdwavki/sql
-- ========================================================

-- TABLE 1: games (Stores overall room state & active sessions)
CREATE TABLE IF NOT EXISTS public.games (
  room_code TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on games" ON public.games;
CREATE POLICY "Allow public all access on games"
ON public.games
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------

-- TABLE 2: votes (Stores every individual user vote as a separate row!)
CREATE TABLE IF NOT EXISTS public.votes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES public.games(room_code) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT,
  question_id TEXT NOT NULL, -- 'marry', 'date', 'mum', 'emergency'
  vote TEXT NOT NULL,        -- 'cash', 'debt', 'gold', 'realestate', 'equity', 'alternatives'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevents duplicate votes for the same question by the same player
  CONSTRAINT unique_player_round_vote UNIQUE (room_code, player_id, question_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on votes" ON public.votes;
CREATE POLICY "Allow public all access on votes"
ON public.votes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ========================================================
-- Done! Both 'games' and 'votes' tables are ready!
-- ========================================================
