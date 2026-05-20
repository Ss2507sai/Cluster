/*
  # ClusterX AI Outbound Command Center - Initial Schema

  ## Overview
  Full schema for the ClusterX outbound sales platform MVP.

  ## Tables

  ### leads
  Core CRM entity with enriched fields for ICP scoring and outreach tracking.
  - id, name, title, company, industry, website, linkedin, email, phone
  - employee_count, geography, hiring_signal
  - icp_score, pain_score, intent_score
  - stage (pipeline stage)
  - notes, next_action
  - timestamps

  ### outreach_messages
  Generated outreach content linked to leads.
  - lead_id (FK), type (email/linkedin/etc), subject, body
  - edited_body (user-modified version)
  - timestamps

  ### reply_classifications
  Stored reply assistant results.
  - lead_id (FK), reply_text, classification, suggested_response
  - timestamps

  ### pipeline_settings
  Configurable pipeline stages.
  - name, position, color

  ### scoring_settings
  Configurable ICP scoring weights.
  - key, label, weight, description

  ### templates
  User-editable outreach templates.
  - type, name, content, is_default

  ## Security
  - RLS enabled on all tables
  - Public access policies for MVP (single-tenant, no auth required in Phase 1)
*/

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  title text DEFAULT '',
  company text DEFAULT '',
  industry text DEFAULT '',
  website text DEFAULT '',
  linkedin text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  employee_count text DEFAULT '',
  geography text DEFAULT '',
  hiring_signal boolean DEFAULT false,
  icp_score integer DEFAULT 0,
  pain_score integer DEFAULT 0,
  intent_score integer DEFAULT 0,
  stage text DEFAULT 'New',
  notes text DEFAULT '',
  next_action text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on leads"
  ON leads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on leads"
  ON leads FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on leads"
  ON leads FOR DELETE
  TO anon, authenticated
  USING (true);

-- OUTREACH MESSAGES TABLE
CREATE TABLE IF NOT EXISTS outreach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'email',
  subject text DEFAULT '',
  body text DEFAULT '',
  edited_body text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on outreach_messages"
  ON outreach_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on outreach_messages"
  ON outreach_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on outreach_messages"
  ON outreach_messages FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on outreach_messages"
  ON outreach_messages FOR DELETE
  TO anon, authenticated
  USING (true);

-- REPLY CLASSIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS reply_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  reply_text text NOT NULL DEFAULT '',
  classification text DEFAULT 'neutral',
  suggested_response text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reply_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on reply_classifications"
  ON reply_classifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on reply_classifications"
  ON reply_classifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow delete on reply_classifications"
  ON reply_classifications FOR DELETE
  TO anon, authenticated
  USING (true);

-- TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'email',
  name text NOT NULL DEFAULT '',
  content text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on templates"
  ON templates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on templates"
  ON templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on templates"
  ON templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on templates"
  ON templates FOR DELETE
  TO anon, authenticated
  USING (true);

-- SCORING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS scoring_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  weight integer DEFAULT 20,
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scoring_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on scoring_settings"
  ON scoring_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on scoring_settings"
  ON scoring_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on scoring_settings"
  ON scoring_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default scoring settings
INSERT INTO scoring_settings (key, label, weight, description) VALUES
  ('industry_fit', 'Industry Fit', 25, 'How well the industry matches ClusterX target verticals'),
  ('company_size', 'Company Size', 20, 'Optimal size for automation ROI (10-500 employees)'),
  ('buyer_role', 'Buyer Role', 20, 'Seniority and decision-making authority of contact'),
  ('workflow_complexity', 'Workflow Complexity', 20, 'Likelihood of repetitive, automatable workflows'),
  ('intent_signals', 'Intent Signals', 15, 'Hiring signals, tech stack, recent activity')
ON CONFLICT (key) DO NOTHING;

-- Insert default templates
INSERT INTO templates (type, name, content, is_default) VALUES
  ('linkedin_connection', 'LinkedIn Connection Note', 'Hi {{name}}, I noticed {{company}} is scaling its {{industry}} operations. We help {{industry}} businesses automate repetitive workflows with AI. Would love to connect and share what we''re seeing work.', true),
  ('linkedin_dm', 'LinkedIn First DM', 'Hi {{name}}, thanks for connecting! Quick question — is {{company}} currently handling {{pain_point}} manually? We''ve helped similar {{industry}} businesses cut that time by 60-70% with a simple AI workflow. Worth a 15-min call to see if it applies to you?', true),
  ('cold_email', 'Cold Email', 'Subject: AI automation for {{company}}''s {{pain_point}}\n\nHi {{name}},\n\nI''ve been researching {{company}} and noticed you likely deal with {{pain_point}} at scale.\n\nWe''ve helped {{industry}} businesses like yours automate this with AI workflows — typically saving 15-20 hours/week per team.\n\nWould a quick 15-min call make sense to see if this applies to {{company}}?\n\nBest,\nClusterX Team', true),
  ('follow_up_1', 'Follow-up 1', 'Hi {{name}}, just following up on my last message about automating {{pain_point}} at {{company}}.\n\nWe recently helped a similar {{industry}} business reduce manual work by 65%. Happy to share the case study.\n\nStill worth a quick chat?', true),
  ('follow_up_2', 'Follow-up 2', 'Hi {{name}}, one last nudge — I know inboxes get busy.\n\nIf {{pain_point}} is a real challenge at {{company}}, I''d love to show you a 10-min demo of what we''ve built for {{industry}} teams.\n\nIf not the right time, totally understand. Just let me know.', true),
  ('breakup_email', 'Breakup Email', 'Hi {{name}}, I''ll stop reaching out — clearly the timing isn''t right.\n\nIf {{company}} ever wants to explore AI automation for {{pain_point}}, we''ll be here.\n\nWishing you a great quarter.', true),
  ('call_opener', 'Call Opener Script', 'Hi {{name}}, this is [Your Name] from ClusterX. I''ll be quick — I''m calling because we specialize in helping {{industry}} businesses automate {{pain_point}} with AI. Is that something {{company}} is actively looking at right now?', true),
  ('discovery_questions', 'Discovery Questions', '1. Walk me through how your team currently handles {{pain_point}} today?\n2. How many hours per week does your team spend on this?\n3. What''s the cost of getting this wrong or delayed?\n4. Have you explored automation before? What held you back?\n5. If we could cut that time by 60%, what would your team focus on instead?\n6. What does the decision-making process look like for a tool like this?', true)
ON CONFLICT DO NOTHING;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_messages_updated_at BEFORE UPDATE ON outreach_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
