import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/stores/themeStore';

function ThemeProbe() {
  const { theme } = useTheme();
  return React.createElement('span', null, theme);
}

async function flushEffects(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('useTheme business wiring', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({
      theme: 'default',
      isLoaded: false,
    });
    useThemeStore.getState().setTheme('default');

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    document.body.removeAttribute('data-theme');
    useThemeStore.setState({
      theme: 'default',
      isLoaded: false,
    });
    useThemeStore.getState().setTheme('default');
  });

  afterAll(() => {
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('syncs the active theme to the body data-theme attribute', async () => {
    useThemeStore.getState().setTheme('business');

    act(() => {
      root.render(React.createElement(ThemeProbe));
    });
    await act(async () => {
      await flushEffects();
    });

    expect(document.body.dataset.theme).toBe('business');
    expect(container.textContent).toBe('business');
  });
});