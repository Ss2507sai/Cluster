import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Page } from './Sidebar';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  leads: 'Lead Management',
  pipeline: 'Pipeline',
  scoring: 'ICP Scoring Engine',
  outreach: 'Outreach Generator',
  reply: 'Reply Assistant',
  analytics: 'Analytics',
  settings: 'Settings',
};

const PAGE_DESCRIPTIONS: Record<Page, string> = {
  dashboard: 'Overview of your outbound pipeline',
  leads: 'Manage and qualify your prospects',
  pipeline: 'Visual pipeline management',
  scoring: 'Analyze and score your leads',
  outreach: 'Generate personalized outreach',
  reply: 'Classify and respond to replies',
  analytics: 'Performance metrics and insights',
  settings: 'Configure your workspace',
};

interface TopBarProps {
  page: Page;
}

export function TopBar({ page }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{PAGE_TITLES[page]}</h1>
        <p className="text-xs text-slate-400">{PAGE_DESCRIPTIONS[page]}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
