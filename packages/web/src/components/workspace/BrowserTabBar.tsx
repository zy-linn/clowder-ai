'use client';

import { useTheme } from '@/hooks/useTheme';
import type { BrowserTab } from './BrowserPanel';

interface BrowserTabBarProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onAdd: () => void;
}

export function BrowserTabBar({ tabs, activeTabId, onSelect, onClose, onAdd }: BrowserTabBarProps) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';

  return (
    <div
      className={
        isBusinessTheme
          ? 'flex items-center overflow-x-auto border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)]'
          : 'flex items-center overflow-x-auto border-b border-[#FFDDD2] bg-[#F5F0EB]'
      }
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`group flex max-w-[180px] shrink-0 items-center gap-1 px-3 py-1.5 text-[11px] transition-colors ${
              isBusinessTheme
                ? isActive
                  ? 'border-r border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] font-medium text-[var(--oc-text-title)]'
                  : 'border-r border-[var(--oc-border-default)] text-[var(--oc-text-secondary)] hover:bg-[var(--oc-bg-surface)] hover:text-[var(--oc-text-title)]'
                : isActive
                  ? 'border-r border-[#FFDDD2]/50 bg-[#FDF8F3] font-medium text-[#5a4a42]'
                  : 'border-r border-[#FFDDD2]/50 text-[#5a4a42]/60 hover:bg-[#FDF8F3]/50 hover:text-[#5a4a42]'
            }`}
          >
            <span className="truncate">{tab.title}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className={
                isBusinessTheme
                  ? 'ml-1 opacity-0 text-[var(--oc-text-secondary)] group-hover:opacity-100 hover:text-[var(--oc-text-title)]'
                  : 'ml-1 opacity-0 text-[#5a4a42]/40 group-hover:opacity-100 hover:text-[#5a4a42]'
              }
              role="button"
              tabIndex={-1}
              onKeyDown={() => {}}
            >
              x
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className={
          isBusinessTheme
            ? 'shrink-0 px-2 py-1.5 text-[11px] text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface)] hover:text-[var(--oc-text-title)]'
            : 'shrink-0 px-2 py-1.5 text-[11px] text-[#5a4a42]/40 transition-colors hover:bg-[#FDF8F3]/50 hover:text-[#5a4a42]'
        }
        title="New tab"
      >
        +
      </button>
    </div>
  );
}
