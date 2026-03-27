import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

describe('themeStore business config', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({
      theme: 'default',
      isLoaded: false,
    });
    useThemeStore.getState().setTheme('default');
  });

  it('exposes business theme semantics instead of partial background overrides', () => {
    const state = useThemeStore.getState();
    state.setTheme('business');

    expect(useThemeStore.getState().config.shell.pageBgVar).toBe('var(--oc-bg-page)');
    expect(useThemeStore.getState().config.sidebar.selectedItemBgVar).toBe('var(--oc-bg-surface)');
  });
});