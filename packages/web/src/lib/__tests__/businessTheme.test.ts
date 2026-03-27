import { describe, expect, it } from 'vitest';
import { BUSINESS_THEME_TOKENS } from '@/lib/businessTheme';

describe('BUSINESS_THEME_TOKENS', () => {
  it('matches the OfficeClaw business palette and radii', () => {
    expect(BUSINESS_THEME_TOKENS.bg.page).toBe('#FAFAFB');
    expect(BUSINESS_THEME_TOKENS.bg.sidebar).toBe('#F5F7FB');
    expect(BUSINESS_THEME_TOKENS.radius.shell).toBe('20px');
    expect(BUSINESS_THEME_TOKENS.font.family).toBe(
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    );
  });
});