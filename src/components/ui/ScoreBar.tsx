import { cn } from '../../lib/utils';

interface ScoreBarProps {
  score: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ScoreBar({ score, label, showValue = true, size = 'md' }: ScoreBarProps) {
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-blue-500' :
    score >= 40 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="flex flex-col gap-1">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{score}</span>}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full bg-slate-100 dark:bg-slate-800',
        size === 'sm' ? 'h-1' : 'h-1.5'
      )}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}
