export type PipelineStage =
  | 'New'
  | 'Contacted'
  | 'Engaged'
  | 'Discovery'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Industry =
  | 'Healthcare'
  | 'Dental'
  | 'Real Estate'
  | 'E-commerce'
  | 'B2B SaaS'
  | 'Finance'
  | 'Logistics'
  | 'Education'
  | 'Hospitality'
  | 'Legal'
  | 'Other';

export type BuyerRole =
  | 'Founder'
  | 'CEO'
  | 'COO'
  | 'CTO'
  | 'Operations Head'
  | 'Revenue Leader'
  | 'Sales Director'
  | 'Practice Manager'
  | 'VP Sales'
  | 'Manager'
  | 'Other';

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  website: string;
  linkedin: string;
  email: string;
  phone: string;
  employee_count: string;
  geography: string;
  hiring_signal: boolean;
  icp_score: number;
  pain_score: number;
  intent_score: number;
  stage: PipelineStage;
  notes: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  lead_id: string;
  type: string;
  subject: string;
  body: string;
  edited_body: string;
  created_at: string;
  updated_at: string;
}

export interface ReplyClassification {
  id: string;
  lead_id: string | null;
  reply_text: string;
  classification: 'positive' | 'neutral' | 'objection' | 'not_interested' | 'follow_up_later';
  suggested_response: string;
  created_at: string;
}

export interface Template {
  id: string;
  type: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoringSettings {
  id: string;
  key: string;
  label: string;
  weight: number;
  description: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  meetingsBooked: number;
  conversionRate: number;
  wonDeals: number;
}

export type OutreachType =
  | 'linkedin_connection'
  | 'linkedin_dm'
  | 'cold_email'
  | 'follow_up_1'
  | 'follow_up_2'
  | 'breakup_email'
  | 'call_opener'
  | 'discovery_questions';

export type ReplyClassificationLabel =
  | 'positive'
  | 'neutral'
  | 'objection'
  | 'not_interested'
  | 'follow_up_later';
