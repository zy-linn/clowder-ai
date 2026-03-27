import type { BacklogItem } from '@cat-cafe/shared';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionControlCard } from '@/components/mission-control/MissionControlCard';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: {},
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));

function createBacklogItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
  const now = Date.now();
  return {
    id: 'backlog-1',
    userId: 'u_test',
    title: 'Business theme rollout',
    summary: 'Align mission hub visuals with OfficeClaw shell tokens.',
    priority: 'p1',
    tags: ['theme'],
    status: 'open',
    createdBy: 'user',
    createdAt: now,
    updatedAt: now,
    audit: [
      {
        id: 'audit-1',
        action: 'created',
        actor: { kind: 'user', id: 'u_test' },
        timestamp: now,
      },
    ],
    ...overrides,
  };
}

describe('MissionControlCard', () => {
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

  it('renders OfficeClaw business shell classes for selected cards', async () => {
    await act(async () => {
      root.render(
        React.createElement(MissionControlCard, {
          item: createBacklogItem(),
          selected: true,
          onSelect: vi.fn(),
        }),
      );
    });

    const card = container.querySelector('[data-testid="mission-control-card"]');
    expect(card?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(card?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
  });
});
