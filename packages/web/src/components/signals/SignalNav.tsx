import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/stores/chatStore';

export type SignalNavItem = 'chat' | 'signals' | 'sources';

interface SignalNavProps {
  readonly active: SignalNavItem;
}

interface ItemConfig {
  readonly id: SignalNavItem;
  readonly href: string;
  readonly label: string;
}

function useReferrerThread(): string | null {
  const storeThreadId = useChatStore((s) => s.currentThreadId);
  return useMemo(() => {
    if (typeof window !== 'undefined') {
      const fromParam = new URLSearchParams(window.location.search).get('from');
      if (fromParam) return fromParam;
    }
    return storeThreadId && storeThreadId !== 'default' ? storeThreadId : null;
  }, [storeThreadId]);
}

export function SignalNav({ active }: SignalNavProps) {
  const { theme } = useTheme();
  const isBusiness = theme === 'business';
  const referrerThread = useReferrerThread();
  const fromSuffix = referrerThread ? `?from=${encodeURIComponent(referrerThread)}` : '';

  const items: readonly ItemConfig[] = useMemo(
    () => [
      { id: 'signals' as const, href: `/signals${fromSuffix}`, label: 'Signals' },
      { id: 'sources' as const, href: `/signals/sources${fromSuffix}`, label: 'Sources' },
    ],
    [fromSuffix],
  );

  const backHref = referrerThread && referrerThread !== 'default' ? `/thread/${referrerThread}` : '/';

  return (
    <nav
      aria-label="Signal navigation"
      data-testid="signal-nav-shell"
      className={
        isBusiness ? 'flex items-center gap-2 text-[var(--oc-text-secondary)]' : 'flex items-center gap-2'
      }
    >
      <Link
        href={backHref}
        data-testid="signal-nav-back-link"
        className={[
          'inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors',
          isBusiness
            ? 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] text-[var(--oc-text-heading)] hover:bg-[var(--oc-bg-surface-soft)]'
            : 'border-[#D8C6AD] bg-[#FCF7EE] text-[#8B6F47] hover:bg-[#F7EEDB]',
        ].join(' ')}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        返回线程
      </Link>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              isBusiness
                ? isActive
                  ? 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] text-[var(--oc-text-title)]'
                  : 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] text-[var(--oc-text-secondary)] hover:bg-[var(--oc-bg-surface)] hover:text-[var(--oc-text-heading)]'
                : isActive
                  ? 'border-cocreator-primary bg-cocreator-light text-cocreator-dark'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-cocreator-light hover:text-cocreator-dark',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
