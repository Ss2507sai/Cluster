/*
  # Fix Remaining RLS SELECT Policies

  ## Summary
  The previous migration left behind old SELECT policies that still grant access to
  the `anon` role with `USING (true)`. This migration:

  1. Drops the remaining legacy open-access SELECT policies on all five tables.
  2. Replaces them with authenticated-only SELECT policies (already created for
     `leads` in the previous migration, so only the others need new policies here).
  3. The `leads` table still has "Allow all operations on leads" (the original SELECT
     policy) — this is also dropped and replaced.

  After this migration every table allows access only to the `authenticated` role,
  with `auth.uid() IS NOT NULL` as the non-trivially-true guard.
*/

-- leads: drop old open SELECT policy
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can select leads" ON public.leads;

CREATE POLICY "Authenticated users can select leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- outreach_messages: drop old open SELECT policy and replace
DROP POLICY IF EXISTS "Allow select on outreach_messages" ON public.outreach_messages;
DROP POLICY IF EXISTS "Authenticated users can select outreach_messages" ON public.outreach_messages;

CREATE POLICY "Authenticated users can select outreach_messages"
  ON public.outreach_messages FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- reply_classifications: drop old open SELECT policy and replace
DROP POLICY IF EXISTS "Allow select on reply_classifications" ON public.reply_classifications;
DROP POLICY IF EXISTS "Authenticated users can select reply_classifications" ON public.reply_classifications;

CREATE POLICY "Authenticated users can select reply_classifications"
  ON public.reply_classifications FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- scoring_settings: drop old open SELECT policy and replace
DROP POLICY IF EXISTS "Allow select on scoring_settings" ON public.scoring_settings;
DROP POLICY IF EXISTS "Authenticated users can select scoring_settings" ON public.scoring_settings;

CREATE POLICY "Authenticated users can select scoring_settings"
  ON public.scoring_settings FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- templates: drop old open SELECT policy and replace
DROP POLICY IF EXISTS "Allow select on templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can select templates" ON public.templates;

CREATE POLICY "Authenticated users can select templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
