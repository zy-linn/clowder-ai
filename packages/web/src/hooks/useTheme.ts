import { useEffect } from 'react';
import { useThemeStore, type ThemeConfig, type ThemeType } from '@/stores/themeStore';

export type { ThemeType, ThemeConfig };

export function useTheme() {
  const themeState = useThemeStore();
  const { theme, config, setTheme, toggleTheme, isLoaded, initializeTheme } = themeState;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!isLoaded) {
      initializeTheme();
    }
  }, [isLoaded, initializeTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    config,
    isLoaded,
  };
}