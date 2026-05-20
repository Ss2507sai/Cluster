export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export const INDUSTRIES = [
  'Healthcare',
  'Dental',
  'Real Estate',
  'E-commerce',
  'B2B SaaS',
  'Finance',
  'Logistics',
  'Education',
  'Hospitality',
  'Legal',
  'Other',
] as const;

export const BUYER_ROLES = [
  'Founder',
  'CEO',
  'COO',
  'CTO',
  'Operations Head',
  'Revenue Leader',
  'Sales Director',
  'Practice Manager',
  'VP Sales',
  'Manager',
  'Other',
] as const;

export const EMPLOYEE_COUNTS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const PIPELINE_STAGES = [
  'New',
  'Contacted',
  'Engaged',
  'Discovery',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
] as const;

export const STAGE_COLORS: Record<string, string> = {
  New: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Engaged: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Discovery: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Qualified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Proposal: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Negotiation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
