import { useState } from 'react';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { INDUSTRIES, BUYER_ROLES, EMPLOYEE_COUNTS, PIPELINE_STAGES } from '../../lib/utils';
import type { Lead } from '../../types';

type LeadFormData = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'icp_score' | 'pain_score' | 'intent_score'>;

interface LeadFormProps {
  initialData?: Partial<Lead>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const emptyForm: LeadFormData = {
  name: '',
  title: '',
  company: '',
  industry: '',
  website: '',
  linkedin: '',
  email: '',
  phone: '',
  employee_count: '',
  geography: '',
  hiring_signal: false,
  stage: 'New',
  notes: '',
  next_action: '',
};

export function LeadForm({ initialData, onSubmit, onCancel, loading }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    ...emptyForm,
    ...(initialData || {}),
  });

  const set = (key: keyof LeadFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const industryOptions = [
    { value: '', label: 'Select industry...' },
    ...INDUSTRIES.map(i => ({ value: i, label: i })),
  ];

  const roleOptions = [
    { value: '', label: 'Select role...' },
    ...BUYER_ROLES.map(r => ({ value: r, label: r })),
  ];

  const sizeOptions = [
    { value: '', label: 'Select size...' },
    ...EMPLOYEE_COUNTS.map(s => ({ value: s, label: s })),
  ];

  const stageOptions = PIPELINE_STAGES.map(s => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" required />
        <Select label="Title / Role" value={form.title} onChange={e => set('title', e.target.value)} options={roleOptions} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
        <Select label="Industry" value={form.industry} onChange={e => set('industry', e.target.value)} options={industryOptions} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
        <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Website" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" />
        <Input label="LinkedIn URL" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/jane" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Select label="Employee Count" value={form.employee_count} onChange={e => set('employee_count', e.target.value)} options={sizeOptions} />
        <Input label="Geography" value={form.geography} onChange={e => set('geography', e.target.value)} placeholder="US, UK, etc." />
        <Select label="Stage" value={form.stage} onChange={e => set('stage', e.target.value as Lead['stage'])} options={stageOptions} />
      </div>
      <div className="flex items-center gap-3 py-1">
        <input
          id="hiring_signal"
          type="checkbox"
          checked={form.hiring_signal}
          onChange={e => set('hiring_signal', e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="hiring_signal" className="text-sm text-slate-600 dark:text-slate-400">
          Hiring signal detected (active job listings for relevant roles)
        </label>
      </div>
      <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Background, context, previous interactions..." rows={3} />
      <Input label="Next Action" value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="Send cold email, schedule call..." />

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initialData?.id ? 'Save Changes' : 'Add Lead'}
        </Button>
      </div>
    </form>
  );
}
