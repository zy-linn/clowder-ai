import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsolePanel } from '@/components/workspace/ConsolePanel';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: {},
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));

describe('ConsolePanel', () => {
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

  it('renders OfficeClaw business shell styles for console output', async () => {
    await act(async () => {
      root.render(
        React.createElement(ConsolePanel, {
          entries: [
            {
              level: 'info',
              args: ['Preview ready'],
              timestamp: 1,
            },
          ],
          onClear: vi.fn(),
        }),
      );
    });

    const shell = container.querySelector('[data-testid="console-panel-shell"]');
    const header = container.querySelector('[data-testid="console-panel-header"]');

    expect(shell?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(header?.className ?? '').toContain('bg-[var(--oc-bg-surface-soft)]');
  });
});
