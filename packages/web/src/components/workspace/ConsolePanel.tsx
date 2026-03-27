'use client';

import { useTheme } from '@/hooks/useTheme';

export interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  args: string[];
  timestamp: number;
}

const LEVEL_STYLES: Record<ConsoleEntry['level'], string> = {
  log: 'text-gray-600 dark:text-gray-400',
  info: 'text-blue-600 dark:text-blue-400',
  warn: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
};

const LEVEL_BG: Record<ConsoleEntry['level'], string> = {
  log: '',
  info: '',
  warn: 'bg-amber-50/50 dark:bg-amber-900/10',
  error: 'bg-red-50/50 dark:bg-red-900/10',
};

interface ConsolePanelProps {
  entries: ConsoleEntry[];
  onClear: () => void;
}

export function ConsolePanel({ entries, onClear }: ConsolePanelProps) {
  const { theme } = useTheme();
  const isBusiness = theme === 'business';

  return (
    <div
      data-testid="console-panel-shell"
      className={
        isBusiness
          ? 'flex flex-col border-t border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] text-[11px] font-mono'
          : 'flex flex-col border-t border-[#FFDDD2] bg-white/80 text-[11px] font-mono'
      }
    >
      <div
        data-testid="console-panel-header"
        className={
          isBusiness
            ? 'flex items-center justify-between border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] px-2 py-1'
            : 'flex items-center justify-between border-b border-[#FFDDD2] bg-[#FDF8F3] px-2 py-1'
        }
      >
        <div className="flex items-center gap-1.5">
          <span
            className={
              isBusiness
                ? 'text-[10px] font-semibold uppercase tracking-wider text-[var(--oc-text-secondary)]'
                : 'text-[10px] font-semibold uppercase tracking-wider text-[#5a4a42]/70'
            }
          >
            Console
          </span>
          {entries.length > 0 && (
            <span
              className={
                isBusiness
                  ? 'rounded-full bg-[var(--oc-bg-surface-muted)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--oc-text-heading)]'
                  : 'rounded-full bg-[#E29578]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#E29578]'
              }
            >
              {entries.length}
            </span>
          )}
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className={
              isBusiness
                ? 'text-[10px] text-[var(--oc-text-secondary)] transition-colors hover:text-[var(--oc-text-heading)]'
                : 'text-[10px] text-[#5a4a42]/50 transition-colors hover:text-[#5a4a42]'
            }
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {entries.length === 0 ? (
          <div
            className={
              isBusiness
                ? 'px-3 py-4 text-center text-xs text-[var(--oc-text-muted)]'
                : 'px-3 py-4 text-center text-xs text-[#5a4a42]/30'
            }
          >
            No console output
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className={`flex items-start gap-2 border-b px-2 py-0.5 ${
                isBusiness ? 'border-[var(--oc-border-default)]' : 'border-[#FFDDD2]/30'
              } ${LEVEL_BG[entry.level]}`}
            >
              <span className={`w-10 shrink-0 ${LEVEL_STYLES[entry.level]}`}>{entry.level}</span>
              <span
                className={
                  isBusiness
                    ? 'break-all text-[var(--oc-text-body)]'
                    : 'break-all text-[#5a4a42]/80'
                }
              >
                {entry.args.join(' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
