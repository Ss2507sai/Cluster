import { useState } from 'react';
import { MessageSquare, Copy, Check, RefreshCw, ChevronRight } from 'lucide-react';
import { classifyReply } from '../lib/outreach';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { cn } from '../lib/utils';

interface ClassificationResult {
  classification: string;
  label: string;
  color: string;
  suggestedResponse: string;
}

const COLOR_STYLES: Record<string, { badge: string; border: string; icon: string }> = {
  green: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-500',
  },
  red: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
  },
  slate: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: 'text-slate-500',
  },
};

const EXAMPLE_REPLIES = [
  { label: 'Positive', text: 'Yes, this sounds interesting! When are you available for a call this week?' },
  { label: 'Not Interested', text: 'No thanks, we\'re not interested. Please remove me from your list.' },
  { label: 'Objection', text: 'We already have a tool for this and the cost seems too high for us.' },
  { label: 'Follow Up Later', text: 'Looks interesting but we\'re busy right now. Check back with me in Q3.' },
  { label: 'Neutral', text: 'Thanks for reaching out. Can you tell me a bit more about what you do?' },
];

export function ReplyAssistant() {
  const [replyText, setReplyText] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  const [editingResponse, setEditingResponse] = useState(false);

  const handleClassify = () => {
    if (!replyText.trim()) return;
    const classification = classifyReply(replyText);
    setResult(classification);
    setEditedResponse(classification.suggestedResponse);
    setEditingResponse(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExample = (text: string) => {
    setReplyText(text);
    setResult(null);
  };

  const styles = result ? (COLOR_STYLES[result.color] || COLOR_STYLES.slate) : null;

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Paste Prospect Reply
            </h3>
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Paste the prospect's reply here..."
              rows={8}
            />
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleClassify} disabled={!replyText.trim()}>
                <ChevronRight className="w-4 h-4" /> Analyze Reply
              </Button>
              {result && (
                <Button variant="ghost" size="sm" onClick={() => { setReplyText(''); setResult(null); }}>
                  <RefreshCw className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Example replies */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Try an example</p>
            <div className="space-y-2">
              {EXAMPLE_REPLIES.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => handleExample(ex.text)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400">{ex.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{ex.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Paste a reply and click Analyze</p>
              <p className="text-xs mt-1">Supports positive, objection, not interested, and neutral detection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Classification badge */}
              <div className={cn('bg-white dark:bg-slate-900 rounded-xl border p-5', styles?.border)}>
                <p className="text-xs text-slate-400 mb-2">Classification</p>
                <div className="flex items-center gap-3">
                  <span className={cn('px-3 py-1 rounded-lg text-sm font-semibold', styles?.badge)}>
                    {result.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {result.classification === 'positive' && 'High buying intent — act quickly'}
                    {result.classification === 'not_interested' && 'Remove from sequence, mark Lost'}
                    {result.classification === 'objection' && 'Address concern directly, then re-qualify'}
                    {result.classification === 'follow_up_later' && 'Schedule follow-up, send case study'}
                    {result.classification === 'neutral' && 'Nurture with value, then ask for call'}
                  </span>
                </div>
              </div>

              {/* Suggested response */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Suggested Response</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingResponse(!editingResponse)}>
                      {editingResponse ? 'Done' : 'Edit'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                {editingResponse ? (
                  <Textarea
                    value={editedResponse}
                    onChange={e => setEditedResponse(e.target.value)}
                    rows={6}
                  />
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {editedResponse}
                  </p>
                )}
              </div>

              {/* Next actions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Recommended Actions</p>
                <ul className="space-y-2">
                  {result.classification === 'positive' && [
                    'Send calendar link immediately',
                    'Move lead to Discovery stage in pipeline',
                    'Prepare discovery call questions',
                    'Research company before the call',
                  ].map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-emerald-500 mt-0.5">✓</span>{a}</li>)}
                  {result.classification === 'not_interested' && [
                    'Remove from outreach sequence',
                    'Mark lead as Lost in pipeline',
                    'Log the rejection reason in notes',
                    'Respect the opt-out immediately',
                  ].map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-red-400 mt-0.5">×</span>{a}</li>)}
                  {result.classification === 'objection' && [
                    'Send a direct response addressing the objection',
                    'Include relevant case study or proof point',
                    'Ask one clarifying question to understand the real blocker',
                    'Offer a no-commitment 15-min discovery call',
                  ].map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-amber-500 mt-0.5">→</span>{a}</li>)}
                  {result.classification === 'follow_up_later' && [
                    'Send a brief case study or relevant asset now',
                    'Set a calendar reminder for the specified timeframe',
                    'Move lead to Engaged stage',
                    'Add note with their indicated timeline',
                  ].map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-blue-500 mt-0.5">◷</span>{a}</li>)}
                  {result.classification === 'neutral' && [
                    'Reply with a one-sentence value hook + calendar link',
                    'Keep message short — under 50 words',
                    'Move lead to Engaged stage',
                    'Follow up once more if no reply in 3 days',
                  ].map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-slate-400 mt-0.5">•</span>{a}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
