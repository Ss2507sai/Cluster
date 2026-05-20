import type { Lead } from '../types';

const ICP_INDUSTRIES: Record<string, number> = {
  'Healthcare': 95,
  'Dental': 95,
  'Real Estate': 85,
  'E-commerce': 75,
  'B2B SaaS': 70,
  'Finance': 75,
  'Logistics': 80,
  'Education': 65,
  'Hospitality': 70,
  'Legal': 75,
  'Other': 40,
};

const BUYER_ROLE_SCORES: Record<string, number> = {
  'Founder': 100,
  'CEO': 100,
  'COO': 95,
  'Practice Manager': 90,
  'Operations Head': 90,
  'Revenue Leader': 85,
  'Sales Director': 80,
  'VP Sales': 80,
  'CTO': 75,
  'Manager': 60,
  'Other': 40,
};

const EMPLOYEE_COUNT_SCORES: Record<string, number> = {
  '1-10': 50,
  '11-50': 85,
  '51-200': 95,
  '201-500': 80,
  '501-1000': 65,
  '1000+': 40,
};

export function computeIcpScore(lead: Partial<Lead>): number {
  const industryScore = ICP_INDUSTRIES[lead.industry || 'Other'] ?? 40;
  const roleScore = BUYER_ROLE_SCORES[lead.title || 'Other'] ?? 40;
  const sizeScore = EMPLOYEE_COUNT_SCORES[lead.employee_count || ''] ?? 60;
  const hiringBonus = lead.hiring_signal ? 10 : 0;

  const raw = industryScore * 0.35 + roleScore * 0.30 + sizeScore * 0.25 + hiringBonus * 1.0;
  return Math.min(100, Math.round(raw));
}

export function computePainScore(lead: Partial<Lead>): number {
  const INDUSTRY_PAIN: Record<string, number> = {
    'Healthcare': 90,
    'Dental': 88,
    'Real Estate': 82,
    'E-commerce': 75,
    'Finance': 78,
    'Logistics': 80,
    'Legal': 72,
    'B2B SaaS': 68,
    'Other': 50,
  };

  const basePain = INDUSTRY_PAIN[lead.industry || 'Other'] ?? 50;
  const roleMultiplier = (BUYER_ROLE_SCORES[lead.title || 'Other'] ?? 50) / 100;
  const sizeBonus = ['11-50', '51-200', '201-500'].includes(lead.employee_count || '') ? 10 : 0;

  return Math.min(100, Math.round(basePain * roleMultiplier + sizeBonus));
}

export function computeIntentScore(lead: Partial<Lead>): number {
  let score = 30;
  if (lead.hiring_signal) score += 25;
  if (lead.linkedin) score += 15;
  if (lead.website) score += 10;
  if (lead.email) score += 10;
  if (lead.notes && lead.notes.length > 20) score += 10;
  return Math.min(100, score);
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Weak';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (score >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

export interface PainAnalysis {
  primaryPain: string;
  automationOpportunity: string;
  positioningAngle: string;
  painPoints: string[];
}

export function analyzePain(industry: string, role: string): PainAnalysis {
  const painMap: Record<string, PainAnalysis> = {
    'Healthcare': {
      primaryPain: 'Manual appointment scheduling and patient follow-ups consuming staff time',
      automationOpportunity: 'AI appointment scheduler, patient reminder automation, billing workflow agent',
      positioningAngle: 'Cut admin overhead by 60% so your clinical staff can focus on patients, not paperwork',
      painPoints: [
        'Staff spending 3-4 hours/day on phone scheduling',
        'Missed appointment reminders causing no-shows',
        'Manual insurance verification delays',
        'Post-visit follow-up falling through the cracks',
        'Billing errors from manual data entry',
      ],
    },
    'Dental': {
      primaryPain: 'Front desk overwhelmed with scheduling, recalls, and insurance verification',
      automationOpportunity: 'Dental recall automation, appointment confirmation AI, treatment plan follow-up',
      positioningAngle: 'Automate recall, booking, and follow-up so your front desk handles exceptions, not routine calls',
      painPoints: [
        'Recall campaigns done manually via phone',
        'No-show rate of 15-25% costing revenue',
        'Insurance pre-authorization delays',
        'Treatment plan follow-up inconsistent',
        'Review collection done manually if at all',
      ],
    },
    'Real Estate': {
      primaryPain: 'Leads falling through the cracks due to manual follow-up and slow response times',
      automationOpportunity: 'Lead routing AI, automated follow-up sequences, CRM enrichment agent',
      positioningAngle: 'Respond to every lead in 90 seconds and nurture them automatically until they book',
      painPoints: [
        'Leads going cold due to delayed response',
        'Agents spending time on unqualified inquiries',
        'Manual CRM updates taking 1-2 hours/day',
        'No systematic follow-up after initial contact',
        'Difficulty routing leads to right agent',
      ],
    },
    'E-commerce': {
      primaryPain: 'Support volume scaling faster than team, repetitive tickets killing productivity',
      automationOpportunity: 'AI support agent, order status bot, return/refund automation',
      positioningAngle: 'Handle 80% of support tickets automatically so your team tackles complex issues only',
      painPoints: [
        'Order status inquiries taking agent time',
        'Return and refund requests handled manually',
        'Response times degrading during peak season',
        'Repetitive FAQ questions clogging ticket queue',
        'Escalation routing done manually',
      ],
    },
    'B2B SaaS': {
      primaryPain: 'Sales team spending too much time on unqualified leads and manual outreach',
      automationOpportunity: 'Lead qualification AI, automated outreach sequences, CRM enrichment',
      positioningAngle: 'Qualify 10x more leads and automate follow-up so your reps close, not prospect',
      painPoints: [
        'SDRs spending 60% time on manual prospecting',
        'Lead scoring done manually or not at all',
        'Follow-up sequences inconsistent across reps',
        'CRM data incomplete due to manual entry',
        'Meeting booking friction in outreach flow',
      ],
    },
    'Finance': {
      primaryPain: 'Document processing, compliance workflows, and client communication done manually',
      automationOpportunity: 'Document processing AI, compliance checklist agent, client update automation',
      positioningAngle: 'Automate document workflows and client communication to reduce compliance risk and free advisor time',
      painPoints: [
        'Manual document review and data extraction',
        'Compliance checklist management error-prone',
        'Client reporting generated manually',
        'Onboarding paperwork slow and manual',
        'Follow-up on outstanding documents inconsistent',
      ],
    },
    'Logistics': {
      primaryPain: 'Manual dispatch coordination, tracking updates, and customer communication',
      automationOpportunity: 'Dispatch automation, proactive shipment alerts, exception handling agent',
      positioningAngle: 'Automate dispatch coordination and proactive customer updates to cut WISMO calls by 70%',
      painPoints: [
        'Dispatcher manually communicating ETAs',
        'Customer WISMO calls overwhelming support',
        'Exception handling slow and reactive',
        'Driver coordination via phone/SMS',
        'Proof of delivery collection manual',
      ],
    },
    'Legal': {
      primaryPain: 'Document drafting, client intake, and deadline tracking consuming billable hours',
      automationOpportunity: 'Contract draft assistant, client intake automation, deadline tracking agent',
      positioningAngle: 'Automate intake and document workflows so attorneys focus on billable, high-value work',
      painPoints: [
        'Client intake forms processed manually',
        'Contract drafts starting from scratch',
        'Deadline tracking in spreadsheets or memory',
        'Client update calls taking associate time',
        'Document retrieval slow and disorganized',
      ],
    },
  };

  return painMap[industry] || {
    primaryPain: 'Repetitive manual workflows consuming team bandwidth',
    automationOpportunity: 'Custom AI workflow automation tailored to your business processes',
    positioningAngle: 'Automate your most repetitive workflows so your team focuses on growth',
    painPoints: [
      'Manual data entry and document handling',
      'Repetitive customer communication',
      'Slow internal approval workflows',
      'Inconsistent follow-up processes',
      'Reporting done manually',
    ],
  };
}
