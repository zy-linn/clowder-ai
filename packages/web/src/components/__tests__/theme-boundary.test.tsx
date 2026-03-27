import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import PixelBrawlPage from '@/app/pixel-brawl/page';
import { GameShell } from '@/components/game/GameShell';

describe('specialized theme boundaries', () => {
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

  it('keeps the werewolf shell inside a specialized theme scope', async () => {
    await act(async () => {
      root.render(React.createElement(GameShell, { onClose: () => undefined, isNight: true }, '狼人杀'));
    });

    const shell = container.querySelector('[data-testid="game-shell"]');
    expect(shell?.getAttribute('data-theme')).toBe('werewolf-cute');
    expect(shell?.getAttribute('data-phase')).toBe('night');
    expect(shell?.getAttribute('data-theme-scope')).toBe('specialized');
  });

  it('marks pixel brawl with its own specialized theme scope', async () => {
    await act(async () => {
      root.render(React.createElement(PixelBrawlPage));
    });

    const shell = container.querySelector('[data-testid="pixel-brawl-shell"]');
    expect(shell?.getAttribute('data-theme')).toBe('pixel-brawl');
    expect(shell?.getAttribute('data-theme-scope')).toBe('specialized');
    expect(shell?.textContent).toContain('PIXEL BRAWL');
  });
});
