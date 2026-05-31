# AP3X Intelligent AI — Supabase Setup Guide

## 1. Create a Supabase project

Go to https://supabase.com → New Project.

## 2. Run the schema

In Supabase → SQL Editor → paste the full contents of `ap3x/supabase/schema.sql` → Run.

This creates all 9 tables with RLS policies pre-configured.

## 3. Get your credentials

Supabase → Settings → API:
- **Project URL** → e.g. `https://xxxx.supabase.co`
- **anon / public key** → used in the browser client

## 4. Configure AP3X

Edit `ap3x/index.js` and fill in:

```js
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

## 5. Enable Realtime (for clinician dashboard)

Supabase → Database → Replication → Enable for:
- `anxiety_logs`
- `risk_flags`
- `clinician_notes`

(The schema.sql already includes the SQL commands for this.)

## 6. Auth setup

Supabase → Authentication → Providers → Enable Email/Password.

After a user signs up, insert a row in `user_profiles` with:
- `auth_user_id` = the user's auth UID
- `role` = `'patient'` or `'clinician'`

You can automate this with a Supabase Auth trigger/webhook.

## 7. Assign patients to clinicians

In `patient_profiles`, set `clinician_id` to the clinician's `auth.uid()`.
RLS policies will automatically scope the clinician's reads to their assigned patients.

## Tables Summary

| Table               | Who writes      | Who reads              |
|---------------------|-----------------|------------------------|
| user_profiles       | own user        | own user               |
| patient_profiles    | own patient     | own patient, clinician |
| clinician_profiles  | own clinician   | own clinician          |
| anxiety_logs        | patient only    | patient + assigned clin|
| mood_logs           | patient only    | patient + assigned clin|
| sleep_logs          | patient only    | patient + assigned clin|
| triggers            | patient only    | patient + assigned clin|
| risk_flags          | system/backend  | patient (read), clinician|
| clinician_notes     | clinician only  | clinician only         |

> Clinicians can NEVER write patient self-reported data.
> Patients cannot read clinician notes.
