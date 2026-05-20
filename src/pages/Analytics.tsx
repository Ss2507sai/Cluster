import { useMemo } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { PIPELINE_STAGES } from '../lib/utils';

function StatBox({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function HorizBar({ label, value, max, color = 'bg-blue-500' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-24 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-6">{value}</span>
    </div>
  );
}

const STAGE_COLORS_CHART: Record<string, string> = {
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

export function Analytics() {
  const { leads } = useLeads();

  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.stage === 'Won').length;
    const lost = leads.filter(l => l.stage === 'Lost').length;
    const qualified = leads.filter(l => ['Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.stage)).length;
    const activeDeals = leads.filter(l => !['New', 'Won', 'Lost'].includes(l.stage)).length;

    const convRate = total > 0 ? ((qualified / total) * 100).toFixed(1) : '0.0';
    const winRate = (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0.0';

    const avgIcp = total > 0 ? Math.round(leads.reduce((s, l) => s + l.icp_score, 0) / total) : 0;
    const avgPain = total > 0 ? Math.round(leads.reduce((s, l) => s + l.pain_score, 0) / total) : 0;

    return { total, won, lost, qualified, activeDeals, convRate, winRate, avgIcp, avgPain };
  }, [leads]);

  const stageData = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      stage,
      count: leads.filter(l => l.stage === stage).length,
    }));
  }, [leads]);

  const industryData = useMemo(() => {
    const map: Record<string, { count: number; won: number; qualified: number }> = {};
    leads.forEach(l => {
      if (!l.industry) return;
      if (!map[l.industry]) map[l.industry] = { count: 0, won: 0, qualified: 0 };
      map[l.industry].count++;
      if (l.stage === 'Won') map[l.industry].won++;
      if (['Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.stage)) map[l.industry].qualified++;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [leads]);

  const funnelData = useMemo(() => {
    const stages = ['New', 'Contacted', 'Engaged', 'Discovery', 'Qualified', 'Won'];
    return stages.map(stage => ({
      stage,
      count: leads.filter(l => {
        const stageIndex = PIPELINE_STAGES.indexOf(l.stage as typeof PIPELINE_STAGES[number]);
        const funnelIndex = PIPELINE_STAGES.indexOf(stage as typeof PIPELINE_STAGES[number]);
        return stageIndex >= funnelIndex;
      }).length,
    }));
  }, [leads]);

  const maxStageCount = Math.max(...stageData.map(s => s.count), 1);
  const maxFunnelCount = Math.max(...funnelData.map(f => f.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Leads" value={stats.total} />
        <StatBox label="Qualification Rate" value={`${stats.convRate}%`} sub="of all leads qualified" color="text-amber-600 dark:text-amber-400" />
        <StatBox label="Win Rate" value={`${stats.winRate}%`} sub="of closed deals" color="text-emerald-600 dark:text-emerald-400" />
        <StatBox label="Active Pipeline" value={stats.activeDeals} sub="leads in progress" color="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Stage Distribution
          </h3>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="space-y-2.5">
              {stageData.map(({ stage, count }) => (
                <HorizBar key={stage} label={stage} value={count} max={maxStageCount} color={STAGE_COLORS_CHART[stage]} />
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Conversion Funnel
          </h3>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="space-y-3">
              {funnelData.map(({ stage, count }, i) => {
                const prev = i > 0 ? funnelData[i - 1].count : count;
                const dropPct = prev > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{stage}</span>
                      <div className="flex items-center gap-2">
                        {i > 0 && dropPct > 0 && (
                          <span className="text-xs text-red-400">-{dropPct}%</span>
                        )}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{count}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(count / maxFunnelCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Segment Performance */}
      {industryData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Segment Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Industry', 'Total', 'Qualified', 'Won', 'Conv. Rate', 'Win Rate'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {industryData.map(([industry, data]) => {
                  const convRate = data.count > 0 ? ((data.qualified / data.count) * 100).toFixed(0) : '0';
                  const winRate = (data.won + (data.count - data.won)) > 0 ? ((data.won / data.count) * 100).toFixed(0) : '0';
                  return (
                    <tr key={industry} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="py-2.5 pr-4 text-sm text-slate-700 dark:text-slate-300">{industry}</td>
                      <td className="py-2.5 pr-4 text-sm text-slate-600 dark:text-slate-400">{data.count}</td>
                      <td className="py-2.5 pr-4 text-sm text-slate-600 dark:text-slate-400">{data.qualified}</td>
                      <td className="py-2.5 pr-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{data.won}</td>
                      <td className="py-2.5 pr-4 text-sm text-slate-600 dark:text-slate-400">{convRate}%</td>
                      <td className="py-2.5 text-sm text-slate-600 dark:text-slate-400">{winRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Score averages */}
      <div className="grid grid-cols-2 gap-4">
        <StatBox label="Avg. ICP Score" value={stats.avgIcp} sub="across all leads" color="text-blue-600 dark:text-blue-400" />
        <StatBox label="Avg. Pain Score" value={stats.avgPain} sub="across all leads" color="text-amber-600 dark:text-amber-400" />
      </div>
    </div>
  );
}
