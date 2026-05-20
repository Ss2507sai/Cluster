import { useMemo } from 'react';
import { Users, PhoneCall, Star, Calendar, TrendingUp, Trophy } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { PIPELINE_STAGES } from '../lib/utils';

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, sub, color }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-5 text-right">{value}</span>
    </div>
  );
}

export function Dashboard() {
  const { leads } = useLeads();

  const metrics = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(l => !['New'].includes(l.stage)).length;
    const qualified = leads.filter(l => ['Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.stage)).length;
    const meetings = leads.filter(l => ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.stage)).length;
    const won = leads.filter(l => l.stage === 'Won').length;
    const conversionRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

    return { total, contacted, qualified, meetings, won, conversionRate };
  }, [leads]);

  const stageBreakdown = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      stage,
      count: leads.filter(l => l.stage === stage).length,
    }));
  }, [leads]);

  const industryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      if (l.industry) map[l.industry] = (map[l.industry] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [leads]);

  const topLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => b.icp_score - a.icp_score)
      .slice(0, 5);
  }, [leads]);

  const maxStageCount = Math.max(...stageBreakdown.map(s => s.count), 1);

  const STAGE_BAR_COLORS: Record<string, string> = {
    New: 'bg-slate-400',
    Contacted: 'bg-blue-400',
    Engaged: 'bg-cyan-400',
    Discovery: 'bg-violet-400',
    Qualified: 'bg-amber-400',
    Proposal: 'bg-orange-400',
    Negotiation: 'bg-yellow-400',
    Won: 'bg-emerald-500',
    Lost: 'bg-red-400',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard icon={Users} label="Total Leads" value={metrics.total} color="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" />
        <MetricCard icon={PhoneCall} label="Contacted" value={metrics.contacted} sub={`${metrics.total > 0 ? Math.round((metrics.contacted / metrics.total) * 100) : 0}% of total`} color="bg-blue-50 dark:bg-blue-950/40 text-blue-500" />
        <MetricCard icon={Star} label="Qualified" value={metrics.qualified} color="bg-amber-50 dark:bg-amber-950/40 text-amber-500" />
        <MetricCard icon={Calendar} label="In Discovery+" value={metrics.meetings} color="bg-violet-50 dark:bg-violet-950/40 text-violet-500" />
        <MetricCard icon={TrendingUp} label="Conv. Rate" value={`${metrics.conversionRate}%`} sub="New → Qualified" color="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500" />
        <MetricCard icon={Trophy} label="Won" value={metrics.won} color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Pipeline Distribution</h3>
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Add leads to see pipeline data</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stageBreakdown.map(({ stage, count }) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{stage}</span>
                  <div className="flex-1">
                    <MiniBar value={count} max={maxStageCount} color={STAGE_BAR_COLORS[stage] || 'bg-slate-400'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Segment Breakdown</h3>
          {industryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <p className="text-sm">No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {industryBreakdown.map(([industry, count]) => (
                <div key={industry} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{industry}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.round((count / leads.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-4">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Leads by ICP Score */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Leads by ICP Score</h3>
        {topLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-slate-400">
            <p className="text-sm">No leads yet — add some to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Name', 'Company', 'Industry', 'Stage', 'ICP', 'Pain', 'Intent'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.title}</p>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-600 dark:text-slate-400">{lead.company}</td>
                    <td className="py-2.5 pr-4 text-sm text-slate-500 dark:text-slate-400">{lead.industry}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{lead.stage}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs font-semibold ${lead.icp_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : lead.icp_score >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>{lead.icp_score}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{lead.pain_score}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{lead.intent_score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
