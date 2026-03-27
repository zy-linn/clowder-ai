import { create } from 'zustand';
import { BUSINESS_THEME_VARS } from '@/lib/businessTheme';

export type ThemeType = 'default' | 'business';

export interface ThemeSurfaceConfig {
  bg: string;
  bgVar: string;
}

export interface ThemeSidebarConfig extends ThemeSurfaceConfig {
  selectedItemBg?: string;
  selectedItemBgVar?: string;
}

export interface ThemeShellConfig {
  pageBgVar: string;
  sidebarBgVar: string;
  cardBgVar: string;
  inputBgVar: string;
}

export interface ThemeConfig {
  shell: ThemeShellConfig;
  sidebar: ThemeSidebarConfig;
  content: ThemeSurfaceConfig;
  header?: ThemeSurfaceConfig;
  footer?: ThemeSurfaceConfig;
}

const THEME_STORAGE_KEY = 'clowder-ai-theme';

const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  default: {
    shell: {
      pageBgVar: 'var(--bg-app)',
      sidebarBgVar: 'white',
      cardBgVar: 'white',
      inputBgVar: 'white',
    },
    sidebar: {
      bg: 'white',
      bgVar: 'white',
      selectedItemBg: 'white',
      selectedItemBgVar: 'white',
    },
    content: {
      bg: '',
      bgVar: 'var(--bg-app)',
    },
    header: {
      bg: 'white',
      bgVar: 'white',
    },
    footer: {
      bg: 'white',
      bgVar: 'white',
    },
  },
  business: {
    shell: {
      pageBgVar: BUSINESS_THEME_VARS.bgPage,
      sidebarBgVar: BUSINESS_THEME_VARS.bgSidebar,
      cardBgVar: BUSINESS_THEME_VARS.bgSurface,
      inputBgVar: BUSINESS_THEME_VARS.bgSurfaceSoft,
    },
    sidebar: {
      bg: BUSINESS_THEME_VARS.shellSidebarBg,
      bgVar: BUSINESS_THEME_VARS.bgSidebar,
      selectedItemBg: BUSINESS_THEME_VARS.bgSurface,
      selectedItemBgVar: BUSINESS_THEME_VARS.bgSurface,
    },
    content: {
      bg: BUSINESS_THEME_VARS.shellPageBg,
      bgVar: BUSINESS_THEME_VARS.bgPage,
    },
    header: {
      bg: BUSINESS_THEME_VARS.cardBg,
      bgVar: BUSINESS_THEME_VARS.bgSurface,
    },
    footer: {
      bg: BUSINESS_THEME_VARS.inputBg,
      bgVar: BUSINESS_THEME_VARS.bgSurfaceSoft,
    },
  },
};

interface ThemeStore {
  theme: ThemeType;
  isLoaded: boolean;
  config: ThemeConfig;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'default',
  isLoaded: false,
  config: THEME_CONFIGS.default,

  setTheme: (newTheme: ThemeType) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    set({
      theme: newTheme,
      config: THEME_CONFIGS[newTheme],
    });
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'default' ? 'business' : 'default';
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    const theme = savedTheme && (savedTheme === 'default' || savedTheme === 'business') ? savedTheme : 'default';
    set({
      theme,
      config: THEME_CONFIGS[theme],
      isLoaded: true,
    });
  },
}));
