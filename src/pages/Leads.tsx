import { useState, useMemo } from 'react';
import { Plus, Search, Filter, ChevronUp, ChevronDown, CreditCard as Edit2, Trash2, ExternalLink, Mail, Phone, Building2, MoreHorizontal } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LeadForm } from '../components/leads/LeadForm';
import { ScoreBar } from '../components/ui/ScoreBar';
import { STAGE_COLORS, INDUSTRIES, PIPELINE_STAGES, BUYER_ROLES, cn } from '../lib/utils';
import type { Lead } from '../types';

type SortKey = 'name' | 'company' | 'icp_score' | 'stage' | 'created_at';
type SortDir = 'asc' | 'desc';

export function Leads() {
  const { leads, loading, addLead, updateLead, deleteLead } = useLeads();
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q || [l.name, l.company, l.email, l.title, l.industry].some(f => f?.toLowerCase().includes(q));
        const matchIndustry = !filterIndustry || l.industry === filterIndustry;
        const matchStage = !filterStage || l.stage === filterStage;
        return matchSearch && matchIndustry && matchStage;
      })
      .sort((a, b) => {
        let av: string | number = a[sortKey] ?? '';
        let bv: string | number = b[sortKey] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, search, filterIndustry, filterStage, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleAdd = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    await addLead(data);
    setFormLoading(false);
    setShowAddModal(false);
  };

  const handleUpdate = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingLead) return;
    setFormLoading(true);
    await updateLead(editingLead.id, data);
    setFormLoading(false);
    setEditingLead(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteLead(deletingId);
    setDeletingId(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const stageVariantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    New: 'neutral', Contacted: 'info', Engaged: 'info', Discovery: 'default',
    Qualified: 'warning', Proposal: 'warning', Negotiation: 'warning', Won: 'success', Lost: 'danger',
  };

  return (
    <div className="p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <select
          value={filterIndustry}
          onChange={e => setFilterIndustry(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3 h-3" />
            {filterIndustry || filterStage ? 'Filtered' : 'No filters'}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full mr-3" />
            Loading leads...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">{leads.length === 0 ? 'No leads yet' : 'No results found'}</p>
            <p className="text-xs mt-1">{leads.length === 0 ? 'Add your first lead to get started' : 'Try adjusting your search or filters'}</p>
            {leads.length === 0 && (
              <Button className="mt-4" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-3 h-3" /> Add First Lead
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {[
                    { key: 'name' as SortKey, label: 'Name' },
                    { key: 'company' as SortKey, label: 'Company' },
                    { key: 'stage' as SortKey, label: 'Stage' },
                    { key: 'icp_score' as SortKey, label: 'ICP' },
                    { key: null, label: 'Pain / Intent' },
                    { key: 'created_at' as SortKey, label: 'Added' },
                    { key: null, label: '' },
                  ].map(col => (
                    <th
                      key={col.label}
                      className={cn(
                        'text-left text-xs text-slate-400 font-medium px-4 py-3',
                        col.key && 'cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none'
                      )}
                      onClick={() => col.key && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <>
                    <tr
                      key={lead.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                          <p className="text-xs text-slate-400">{lead.title || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{lead.company || '—'}</p>
                          <p className="text-xs text-slate-400">{lead.industry || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={stageVariantMap[lead.stage] || 'neutral'}>{lead.stage}</Badge>
                      </td>
                      <td className="px-4 py-3 w-28">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn(
                            'text-xs font-semibold',
                            lead.icp_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                            lead.icp_score >= 60 ? 'text-blue-600 dark:text-blue-400' :
                            'text-amber-600 dark:text-amber-400'
                          )}>{lead.icp_score}</span>
                          <ScoreBar score={lead.icp_score} showValue={false} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400">Pain</span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{lead.pain_score}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400">Intent</span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{lead.intent_score}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(lead.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === lead.id && (
                      <tr key={`${lead.id}-expanded`} className="bg-slate-50/80 dark:bg-slate-900/80">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Mail className="w-3 h-3" /> {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Phone className="w-3 h-3" /> {lead.phone}
                              </div>
                            )}
                            {lead.website && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <ExternalLink className="w-3 h-3" />
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400" onClick={e => e.stopPropagation()}>Website</a>
                              </div>
                            )}
                            {lead.geography && (
                              <div className="text-slate-600 dark:text-slate-400">Geography: {lead.geography}</div>
                            )}
                            {lead.employee_count && (
                              <div className="text-slate-600 dark:text-slate-400">Size: {lead.employee_count}</div>
                            )}
                            {lead.hiring_signal && (
                              <div className="text-emerald-600 dark:text-emerald-400 font-medium">Hiring signal detected</div>
                            )}
                            {lead.next_action && (
                              <div className="col-span-2 text-slate-600 dark:text-slate-400">Next: {lead.next_action}</div>
                            )}
                            {lead.notes && (
                              <div className="col-span-4 text-slate-500 dark:text-slate-400 italic">{lead.notes}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Lead" size="lg">
        <LeadForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} loading={formLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead" size="lg">
        {editingLead && (
          <LeadForm
            initialData={editingLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditingLead(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to delete this lead? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
