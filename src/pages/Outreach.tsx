import { useState } from 'react';
import { Copy, Check, Zap, Users, RefreshCw, CreditCard as Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { generateOutreach, type GeneratedOutreach } from '../lib/outreach';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { cn } from '../lib/utils';
import type { Lead } from '../types';

interface OutreachCardProps {
  item: GeneratedOutreach;
}

function OutreachCard({ item }: OutreachCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(item.body);
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    const text = item.subject ? `Subject: ${item.subject}\n\n${editedBody}` : editedBody;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
          {item.subject && <span className="text-xs text-slate-400 hidden sm:block">· {item.subject}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-50 dark:border-slate-800">
          {item.subject && (
            <div className="mt-4 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Subject line</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.subject}</p>
            </div>
          )}
          <div className="mt-4">
            {editing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedBody}
                  onChange={e => setEditedBody(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setEditing(false)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditedBody(item.body); setEditing(false); }}>
                    <RefreshCw className="w-3 h-3" /> Reset
                  </Button>
                </div>
              </div>
            ) : (
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {editedBody}
              </pre>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
            <Button size="sm" onClick={handleCopy} variant={copied ? 'secondary' : 'outline'}>
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
              <Edit3 className="w-3 h-3" /> {editing ? 'Done' : 'Edit'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Outreach() {
  const { leads } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [messages, setMessages] = useState<GeneratedOutreach[]>([]);
  const [generated, setGenerated] = useState(false);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleGenerate = () => {
    if (!selectedLead) return;
    setMessages(generateOutreach(selectedLead));
    setGenerated(true);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Lead selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Select Lead
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedLeadId}
            onChange={e => { setSelectedLeadId(e.target.value); setGenerated(false); }}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Select a lead...</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.name}{l.company ? ` — ${l.company}` : ''}{l.industry ? ` (${l.industry})` : ''}
              </option>
            ))}
          </select>
          <Button onClick={handleGenerate} disabled={!selectedLeadId}>
            <Zap className="w-4 h-4" /> Generate Outreach
          </Button>
        </div>
        {selectedLead && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedLead.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Company</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLead.company || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Industry</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLead.industry || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ICP Score</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{selectedLead.icp_score}</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!generated && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Zap className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">{leads.length === 0 ? 'Add leads first, then generate outreach' : 'Select a lead and click Generate Outreach'}</p>
        </div>
      )}

      {/* Generated messages */}
      {generated && messages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generated {messages.length} outreach templates for <strong className="text-slate-900 dark:text-slate-100">{selectedLead?.name}</strong>
            </p>
            <Button size="sm" variant="ghost" onClick={handleGenerate}>
              <RefreshCw className="w-3 h-3" /> Regenerate
            </Button>
          </div>
          {messages.map(msg => (
            <OutreachCard key={msg.type} item={msg} />
          ))}
        </div>
      )}
    </div>
  );
}
