import { useState, useMemo } from 'react';
import { Target, ChevronDown, ChevronUp, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { ScoreBar } from '../components/ui/ScoreBar';
import { Badge } from '../components/ui/Badge';
import { analyzePain, getScoreBg } from '../lib/scoring';
import { INDUSTRIES, BUYER_ROLES, cn } from '../lib/utils';

interface PainCardProps {
  industry: string;
  role: string;
}

function PainCard({ industry, role }: PainCardProps) {
  const [open, setOpen] = useState(false);
  const analysis = analyzePain(industry, role);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{industry} — {role}</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">{analysis.primaryPain}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-50 dark:border-slate-800 space-y-4">
          <div className="pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Automation Opportunity</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.automationOpportunity}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Positioning Angle</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 italic">"{analysis.positioningAngle}"</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Pain Points</p>
            <ul className="space-y-1">
              {analysis.painPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-red-400 mt-0.5">•</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function Scoring() {
  const { leads } = useLeads();
  const [activeTab, setActiveTab] = useState<'leads' | 'pain'>('leads');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [sortBy, setSortBy] = useState<'icp_score' | 'pain_score' | 'intent_score'>('icp_score');

  const sortedLeads = useMemo(() => {
    return [...leads]
      .filter(l => !filterIndustry || l.industry === filterIndustry)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [leads, filterIndustry, sortBy]);

  const painCombinations = useMemo(() => {
    const industries = ['Healthcare', 'Dental', 'Real Estate', 'E-commerce', 'B2B SaaS', 'Finance', 'Logistics', 'Legal'];
    const roles = ['Founder', 'CEO', 'COO', 'Operations Head', 'Practice Manager'];
    const combos: { industry: string; role: string }[] = [];
    industries.forEach(ind => combos.push({ industry: ind, role: roles[0] }));
    return combos;
  }, []);

  return (
    <div className="p-6 space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {(['leads', 'pain'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {tab === 'leads' ? 'Lead Scores' : 'Pain Analysis'}
          </button>
        ))}
      </div>

      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              Sort by:
            </div>
            {(['icp_score', 'pain_score', 'intent_score'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                  sortBy === k
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {k.replace('_score', '').toUpperCase()}
              </button>
            ))}
          </div>

          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Target className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No leads to score yet</p>
              <p className="text-xs mt-1">Add leads in the Lead Management section</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLeads.map(lead => (
                <div key={lead.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                        <span className="text-xs text-slate-400">{lead.title}</span>
                      </div>
                      <p className="text-xs text-slate-400">{lead.company} · {lead.industry}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-0.5">ICP</p>
                        <span className={cn('text-sm font-bold', getScoreBg(lead.icp_score), 'px-2 py-0.5 rounded')}>{lead.icp_score}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Pain</p>
                        <span className={cn('text-sm font-bold', getScoreBg(lead.pain_score), 'px-2 py-0.5 rounded')}>{lead.pain_score}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Intent</p>
                        <span className={cn('text-sm font-bold', getScoreBg(lead.intent_score), 'px-2 py-0.5 rounded')}>{lead.intent_score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <ScoreBar score={lead.icp_score} label="ICP Score" size="sm" />
                    <ScoreBar score={lead.pain_score} label="Pain Score" size="sm" />
                    <ScoreBar score={lead.intent_score} label="Intent Score" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pain' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rules-based pain analysis for each target industry. Click to expand and see automation opportunity + positioning.
          </p>
          {painCombinations.map(({ industry, role }) => (
            <PainCard key={`${industry}-${role}`} industry={industry} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
