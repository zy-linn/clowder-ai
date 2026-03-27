import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignalStatsCards } from '@/components/signals/SignalStatsCards';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: {},
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));

describe('SignalStatsCards', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { React?: typeof React }).React = React;
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('renders OfficeClaw business cards for signal stats', async () => {
    await act(async () => {
      root.render(
        React.createElement(SignalStatsCards, {
          stats: {
            todayCount: 3,
            unreadCount: 5,
            weekCount: 11,
            byTier: {},
            bySource: {},
          },
        }),
      );
    });

    const section = container.querySelector('[data-testid="signal-stats-shell"]');
    const card = container.querySelector('[data-testid="signal-stat-card-today"]');

    expect(section?.className ?? '').toContain('gap-3');
    expect(card?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(card?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
  });
});
