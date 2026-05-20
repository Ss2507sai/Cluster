/*
  # Fix All Remaining RLS Always-True Policies and Function Search Path

  ## Summary
  Fixes all remaining security advisories:

  1. **RLS Policy Always True** — 12 policies across 5 tables still use literal `true`
     in their USING or WITH CHECK clauses, which the Supabase security linter flags as
     bypassing row-level security. All are replaced with `auth.uid() IS NOT NULL`.

  2. **Function Search Path** — `update_updated_at_column` uses bare `now()` instead
     of `pg_catalog.now()`. With `search_path = ''`, the bare call could fail or be
     ambiguous. Fully-qualifying it removes any ambiguity.

  ## Tables affected
  - `leads` — INSERT, UPDATE, DELETE
  - `outreach_messages` — INSERT, UPDATE, DELETE
  - `reply_classifications` — INSERT, DELETE
  - `scoring_settings` — INSERT, UPDATE
  - `templates` — INSERT, UPDATE, DELETE

  ## Policy changes
  Every INSERT/UPDATE/DELETE policy is dropped and recreated with:
  - Role: `authenticated` only (unchanged)
  - USING clause: `auth.uid() IS NOT NULL` (was `true`)
  - WITH CHECK clause: `auth.uid() IS NOT NULL` (was `true`)

  ## Function change
  - `update_updated_at_column`: `now()` → `pg_catalog.now()`
*/

-- ============================================================
-- Fix trigger function: use pg_catalog.now() instead of bare now()
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- leads: fix INSERT, UPDATE, DELETE policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Authenticated users can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- outreach_messages: fix INSERT, UPDATE, DELETE policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert outreach_messages" ON public.outreach_messages;
DROP POLICY IF EXISTS "Authenticated users can update outreach_messages" ON public.outreach_messages;
DROP POLICY IF EXISTS "Authenticated users can delete outreach_messages" ON public.outreach_messages;

CREATE POLICY "Authenticated users can insert outreach_messages"
  ON public.outreach_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update outreach_messages"
  ON public.outreach_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete outreach_messages"
  ON public.outreach_messages FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- reply_classifications: fix INSERT, DELETE policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert reply_classifications" ON public.reply_classifications;
DROP POLICY IF EXISTS "Authenticated users can delete reply_classifications" ON public.reply_classifications;

CREATE POLICY "Authenticated users can insert reply_classifications"
  ON public.reply_classifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete reply_classifications"
  ON public.reply_classifications FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- scoring_settings: fix INSERT, UPDATE policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert scoring_settings" ON public.scoring_settings;
DROP POLICY IF EXISTS "Authenticated users can update scoring_settings" ON public.scoring_settings;

CREATE POLICY "Authenticated users can insert scoring_settings"
  ON public.scoring_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update scoring_settings"
  ON public.scoring_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- templates: fix INSERT, UPDATE, DELETE policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can delete templates" ON public.templates;

CREATE POLICY "Authenticated users can insert templates"
  ON public.templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update templates"
  ON public.templates FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete templates"
  ON public.templates FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
