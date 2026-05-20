import { useState } from 'react';
import { useLeads } from '../contexts/LeadsContext';
import { PIPELINE_STAGES, cn } from '../lib/utils';
import type { Lead } from '../types';
import { ScoreBar } from '../components/ui/ScoreBar';
import { Badge } from '../components/ui/Badge';
import { CreditCard as Edit2, GripVertical } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { LeadForm } from '../components/leads/LeadForm';

const STAGE_HEADER_COLORS: Record<string, string> = {
  New: 'border-slate-300 dark:border-slate-600',
  Contacted: 'border-blue-400 dark:border-blue-600',
  Engaged: 'border-cyan-400 dark:border-cyan-600',
  Discovery: 'border-violet-400 dark:border-violet-600',
  Qualified: 'border-amber-400 dark:border-amber-600',
  Proposal: 'border-orange-400 dark:border-orange-600',
  Negotiation: 'border-yellow-400 dark:border-yellow-600',
  Won: 'border-emerald-400 dark:border-emerald-600',
  Lost: 'border-red-400 dark:border-red-600',
};

const STAGE_DOT: Record<string, string> = {
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

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onEdit: (lead: Lead) => void;
}

function LeadCard({ lead, onDragStart, onEdit }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800',
        'p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-150',
        'group'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{lead.name}</p>
          <p className="text-xs text-slate-400 truncate">{lead.title}{lead.title && lead.company ? ' · ' : ''}{lead.company}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit(lead); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {lead.industry && (
        <p className="text-xs text-slate-400 mt-1">{lead.industry}</p>
      )}
      <div className="mt-2">
        <ScoreBar score={lead.icp_score} label="ICP" size="sm" />
      </div>
    </div>
  );
}

export function Pipeline() {
  const { leads, updateLeadStage, updateLead } = useLeads();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.stage === stage);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (draggedId && stage) {
      await updateLeadStage(draggedId, stage as Lead['stage']);
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  const handleUpdate = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingLead) return;
    setFormLoading(true);
    await updateLead(editingLead.id, data);
    setFormLoading(false);
    setEditingLead(null);
  };

  return (
    <div className="p-6 h-full">
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leadsByStage[stage] || [];
          return (
            <div
              key={stage}
              className="flex-shrink-0 w-56"
              onDragOver={e => handleDragOver(e, stage)}
              onDrop={e => handleDrop(e, stage)}
              onDragLeave={() => setDragOverStage(null)}
            >
              {/* Stage header */}
              <div className={cn(
                'flex items-center justify-between mb-2 pb-2 border-b-2',
                STAGE_HEADER_COLORS[stage]
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', STAGE_DOT[stage])} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stage}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {stageLeads.length}
                </span>
              </div>

              {/* Drop zone */}
              <div className={cn(
                'min-h-24 rounded-lg space-y-2 p-1.5 transition-all duration-150',
                dragOverStage === stage
                  ? 'bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-300 dark:ring-blue-800'
                  : 'bg-slate-50/50 dark:bg-slate-900/30'
              )}>
                {stageLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={handleDragStart}
                    onEdit={setEditingLead}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-slate-300 dark:text-slate-700 text-xs">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
