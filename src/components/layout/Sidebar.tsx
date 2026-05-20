import {
  LayoutDashboard, Users, Target, Zap, MessageSquare, KanbanSquare,
  BarChart3, Settings, ChevronLeft, ChevronRight, Brain, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type Page =
  | 'dashboard'
  | 'leads'
  | 'scoring'
  | 'outreach'
  | 'reply'
  | 'pipeline'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'leads', label: 'Leads', icon: Users },
  { page: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
  { page: 'scoring', label: 'ICP Scoring', icon: Target },
  { page: 'outreach', label: 'Outreach', icon: Zap },
  { page: 'reply', label: 'Reply Assistant', icon: MessageSquare },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={cn(
      'flex flex-col h-full border-r border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-950',
      'transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-slate-100 dark:border-slate-800/80',
        collapsed ? 'justify-center px-2' : 'px-4 gap-2.5'
      )}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">ClusterX</span>
            <span className="block text-[10px] text-slate-400 leading-none">Command Center</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={cn(
              'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
              'group',
              collapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-3',
              currentPage === page
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className={cn(
              'w-4 h-4 flex-shrink-0',
              currentPage === page ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            )} />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
