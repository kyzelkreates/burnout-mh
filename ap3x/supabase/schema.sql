-- ═══════════════════════════════════════════════════════════════
-- AP3X AnxietyCore — Supabase Schema
-- ═══════════════════════════════════════════════════════════════
-- Extends the existing BCO Core user/session model.
-- Run this once against your Supabase project.
-- Row Level Security (RLS) enforced on all patient tables.
-- ───────────────────────────────────────────────────────────────

-- ── Enable UUID extension ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. USERS  (auth.users is Supabase built-in — we extend it)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('patient', 'clinician')),
  display_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. PATIENT PROFILES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id    UUID REFERENCES auth.users(id),
  display_name    TEXT,
  date_of_birth   DATE,
  emergency_contact_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. CLINICIAN PROFILES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.clinician_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  organisation  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. ANXIETY LOGS  (patient write only)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.anxiety_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anxiety_score   SMALLINT NOT NULL CHECK (anxiety_score BETWEEN 0 AND 10),
  note            TEXT,
  sleep_hours     NUMERIC(4,1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS anxiety_logs_user_created
  ON public.anxiety_logs (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 5. MOOD LOGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_text   TEXT,
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mood_logs_user_created
  ON public.mood_logs (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 6. SLEEP LOGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hours       NUMERIC(4,1) NOT NULL,
  quality     SMALLINT CHECK (quality BETWEEN 1 AND 5),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sleep_logs_user_created
  ON public.sleep_logs (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 7. TRIGGERS (user-defined events)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.triggers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_name  TEXT NOT NULL,
  description   TEXT,
  severity      SMALLINT CHECK (severity BETWEEN 1 AND 10),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS triggers_user_created
  ON public.triggers (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 8. RISK FLAGS  (system-generated, read by clinician)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.risk_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_code   TEXT NOT NULL,   -- e.g. HIGH_SINGLE_SCORE
  risk_level  TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL','MISSING_DATA')),
  resolved    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS risk_flags_user
  ON public.risk_flags (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 9. CLINICIAN NOTES  (clinician write only)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.clinician_notes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id     UUID NOT NULL REFERENCES auth.users(id),
  note_text        TEXT NOT NULL,
  follow_up_status TEXT CHECK (follow_up_status IN ('MONITOR','REVIEW','URGENT')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinician_notes_patient
  ON public.clinician_notes (patient_user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE public.user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anxiety_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_notes    ENABLE ROW LEVEL SECURITY;

-- ── Helper function: current user role ───────────────────────
CREATE OR REPLACE FUNCTION public.ap3x_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ── Helper: is clinician assigned to patient ─────────────────
CREATE OR REPLACE FUNCTION public.ap3x_is_assigned_clinician(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_profiles
    WHERE user_id = p_user_id
      AND clinician_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ── user_profiles ─────────────────────────────────────────────
CREATE POLICY "user_own_profile" ON public.user_profiles
  FOR ALL USING (auth_user_id = auth.uid());

-- ── patient_profiles ──────────────────────────────────────────
CREATE POLICY "patient_own_profile" ON public.patient_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "clinician_assigned_patient_profiles" ON public.patient_profiles
  FOR SELECT USING (ap3x_user_role() = 'clinician' AND clinician_id = auth.uid());

-- ── clinician_profiles ────────────────────────────────────────
CREATE POLICY "clinician_own_profile" ON public.clinician_profiles
  FOR ALL USING (user_id = auth.uid());

-- ── anxiety_logs ──────────────────────────────────────────────
-- Patients: read/write own data
CREATE POLICY "patient_own_anxiety_logs" ON public.anxiety_logs
  FOR ALL USING (user_id = auth.uid());

-- Clinicians: read assigned patients only
CREATE POLICY "clinician_read_anxiety_logs" ON public.anxiety_logs
  FOR SELECT USING (
    ap3x_user_role() = 'clinician' AND ap3x_is_assigned_clinician(user_id)
  );

-- ── mood_logs ─────────────────────────────────────────────────
CREATE POLICY "patient_own_mood_logs" ON public.mood_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "clinician_read_mood_logs" ON public.mood_logs
  FOR SELECT USING (
    ap3x_user_role() = 'clinician' AND ap3x_is_assigned_clinician(user_id)
  );

-- ── sleep_logs ────────────────────────────────────────────────
CREATE POLICY "patient_own_sleep_logs" ON public.sleep_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "clinician_read_sleep_logs" ON public.sleep_logs
  FOR SELECT USING (
    ap3x_user_role() = 'clinician' AND ap3x_is_assigned_clinician(user_id)
  );

-- ── triggers ──────────────────────────────────────────────────
CREATE POLICY "patient_own_triggers" ON public.triggers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "clinician_read_triggers" ON public.triggers
  FOR SELECT USING (
    ap3x_user_role() = 'clinician' AND ap3x_is_assigned_clinician(user_id)
  );

-- ── risk_flags ────────────────────────────────────────────────
-- Patients can read their own flags (informational)
CREATE POLICY "patient_read_own_flags" ON public.risk_flags
  FOR SELECT USING (user_id = auth.uid());

-- System service role inserts flags (via Supabase Edge Function or backend)
-- Clinicians can read assigned patient flags
CREATE POLICY "clinician_read_flags" ON public.risk_flags
  FOR SELECT USING (
    ap3x_user_role() = 'clinician' AND ap3x_is_assigned_clinician(user_id)
  );

-- ── clinician_notes ───────────────────────────────────────────
-- Clinicians write/read their own notes on assigned patients
CREATE POLICY "clinician_own_notes" ON public.clinician_notes
  FOR ALL USING (clinician_id = auth.uid());

-- Patients CANNOT read clinician notes (monitoring-only layer)

-- ═══════════════════════════════════════════════════════════════
-- REALTIME — enable for clinician dashboard live updates
-- ═══════════════════════════════════════════════════════════════
-- Run in Supabase dashboard → Database → Replication
-- Or via SQL:
ALTER TABLE public.anxiety_logs   REPLICA IDENTITY FULL;
ALTER TABLE public.risk_flags     REPLICA IDENTITY FULL;
ALTER TABLE public.clinician_notes REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'anxiety_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.anxiety_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_flags;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clinician_notes;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- UPDATED_AT trigger helper
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
