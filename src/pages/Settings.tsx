import { useState, useEffect } from 'react';
import { Sun, Moon, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { cn } from '../lib/utils';

interface ScoringWeight {
  id: string;
  key: string;
  label: string;
  weight: number;
  description: string;
}

interface Template {
  id: string;
  type: string;
  name: string;
  content: string;
}

function ScoringSettings() {
  const [weights, setWeights] = useState<ScoringWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('scoring_settings').select('*').order('label').then(({ data }) => {
      if (data) setWeights(data as ScoringWeight[]);
      setLoading(false);
    });
  }, []);

  const total = weights.reduce((s, w) => s + w.weight, 0);

  const handleChange = (id: string, weight: number) => {
    setWeights(prev => prev.map(w => w.id === id ? { ...w, weight } : w));
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all(weights.map(w =>
      supabase.from('scoring_settings').update({ weight: w.weight }).eq('id', w.id)
    ));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-sm text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Total weight: <span className={cn('font-semibold', total === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>{total}%</span> (should equal 100%)</p>
        <Button size="sm" onClick={handleSave} loading={saving} variant={saved ? 'secondary' : 'primary'}>
          <Save className="w-3 h-3" /> {saved ? 'Saved!' : 'Save Weights'}
        </Button>
      </div>
      <div className="space-y-3">
        {weights.map(w => (
          <div key={w.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.label}</p>
              <p className="text-xs text-slate-400">{w.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={50}
                value={w.weight}
                onChange={e => handleChange(w.id, Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-8">{w.weight}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateSettings() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('templates').select('*').order('type').then(({ data }) => {
      if (data) setTemplates(data as Template[]);
      setLoading(false);
    });
  }, []);

  const startEdit = (t: Template) => {
    setEditingId(t.id);
    setEditContent(t.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await supabase.from('templates').update({ content: editContent }).eq('id', editingId);
    setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, content: editContent } : t));
    setSaving(false);
    setEditingId(null);
  };

  if (loading) return <div className="text-sm text-slate-400">Loading templates...</div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Available template variables: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{name}}'}</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{first_name}}'}</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{company}}'}</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{industry}}'}</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{pain_point}}'}</code></p>
      {templates.map(t => (
        <div key={t.id} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.name}</p>
              <p className="text-xs text-slate-400">{t.type}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editingId === t.id ? setEditingId(null) : startEdit(t)}
            >
              {editingId === t.id ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          {editingId === t.id ? (
            <div className="p-4 space-y-3">
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
              <Button size="sm" onClick={saveEdit} loading={saving}>
                <Save className="w-3 h-3" /> Save Template
              </Button>
            </div>
          ) : (
            <div className="px-4 py-3">
              <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-sans line-clamp-3">{t.content}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('appearance');

  const sections = [
    { key: 'appearance', label: 'Appearance' },
    { key: 'scoring', label: 'Scoring Weights' },
    { key: 'templates', label: 'Outreach Templates' },
  ];

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      {sections.map(sec => (
        <div key={sec.key} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            onClick={() => setActiveSection(activeSection === sec.key ? '' : sec.key)}
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{sec.label}</span>
            {activeSection === sec.key ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === sec.key && (
            <div className="px-5 pb-5 border-t border-slate-50 dark:border-slate-800 pt-4">
              {sec.key === 'appearance' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose your preferred color theme.</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Light</span>
                    </button>
                    <button
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark</span>
                    </button>
                  </div>
                </div>
              )}
              {sec.key === 'scoring' && <ScoringSettings />}
              {sec.key === 'templates' && <TemplateSettings />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
