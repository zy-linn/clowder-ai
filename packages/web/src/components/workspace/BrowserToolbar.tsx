'use client';

import { useTheme } from '@/hooks/useTheme';

interface BrowserToolbarProps {
  urlInput: string;
  onUrlChange: (value: string) => void;
  onNavigate: () => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onScreenshot: () => void;
  isCapturing: boolean;
  hasTarget: boolean;
  consoleOpen: boolean;
  onConsoleToggle: () => void;
  consoleCount: number;
}

export function BrowserToolbar({
  urlInput,
  onUrlChange,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onScreenshot,
  isCapturing,
  hasTarget,
  consoleOpen,
  onConsoleToggle,
  consoleCount,
}: BrowserToolbarProps) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';

  return (
    <div
      className={
        isBusinessTheme
          ? 'flex items-center gap-1 border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-2 py-2'
          : 'flex items-center gap-1 border-b border-[#FFDDD2] bg-white/60 px-2 py-1.5'
      }
      data-testid="browser-toolbar"
    >
      <button
        type="button"
        onClick={onBack}
        className={
          isBusinessTheme
            ? 'rounded-[10px] px-2 py-1 text-xs text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
            : 'rounded p-1 text-sm text-[#5a4a42]/60 hover:bg-[#FFF5F2]'
        }
        title="Back"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onForward}
        className={
          isBusinessTheme
            ? 'rounded-[10px] px-2 py-1 text-xs text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
            : 'rounded p-1 text-sm text-[#5a4a42]/60 hover:bg-[#FFF5F2]'
        }
        title="Forward"
      >
        Next
      </button>
      <button
        type="button"
        onClick={onRefresh}
        className={
          isBusinessTheme
            ? 'rounded-[10px] px-2 py-1 text-xs text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
            : 'rounded p-1 text-sm text-[#5a4a42]/60 hover:bg-[#FFF5F2]'
        }
        title="Refresh"
      >
        Reload
      </button>

      <div className="flex flex-1 items-center">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onNavigate();
          }}
          placeholder="localhost:3000"
          className={
            isBusinessTheme
              ? 'w-full rounded-[10px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] px-3 py-1.5 text-xs text-[var(--oc-text-body)] placeholder:text-[var(--oc-text-placeholder)] focus:border-[#4F6BFF] focus:outline-none'
              : 'w-full rounded border border-[#FFDDD2] bg-white px-2 py-1 text-xs placeholder:text-[#5a4a42]/30 focus:border-[#E29578] focus:outline-none'
          }
        />
      </div>

      <button
        type="button"
        onClick={onNavigate}
        className={
          isBusinessTheme
            ? 'rounded-[10px] bg-[#171717] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0f172a]'
            : 'rounded bg-[#E29578] px-2.5 py-1 text-xs text-white transition-colors hover:bg-[#d4856a]'
        }
      >
        Go
      </button>

      <button
        type="button"
        onClick={onScreenshot}
        disabled={isCapturing || !hasTarget}
        className={
          isBusinessTheme
            ? 'rounded-[10px] px-2 py-1 text-xs text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)] disabled:opacity-30'
            : 'rounded p-1 text-sm text-[#5a4a42]/60 hover:bg-[#FFF5F2] disabled:opacity-30'
        }
        title="Capture Screenshot"
      >
        {isCapturing ? '...' : 'Shot'}
      </button>

      <button
        type="button"
        onClick={onConsoleToggle}
        className={`transition-colors ${
          isBusinessTheme
            ? consoleOpen
              ? 'rounded-[10px] bg-[var(--oc-bg-surface-soft)] px-2 py-1 text-xs text-[var(--oc-accent-link)]'
              : 'rounded-[10px] px-2 py-1 text-xs text-[var(--oc-text-secondary)] hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
            : consoleOpen
              ? 'rounded bg-[#E29578]/20 p-1 text-sm text-[#E29578]'
              : 'rounded p-1 text-sm text-[#5a4a42]/60 hover:bg-[#FFF5F2]'
        }`}
        title="Toggle Console"
      >
        {consoleCount > 0 ? `Logs ${consoleCount}` : 'Logs'}
      </button>
    </div>
  );
}
