import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentsPanel } from '@/components/AgentsPanel';
import { ChannelsPanel } from '@/components/ChannelsPanel';
import { ModelsPanel } from '@/components/ModelsPanel';
import { SkillsPanel } from '@/components/SkillsPanel';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/utils/api-client', () => ({
  apiFetch,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: {},
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));

vi.mock('@/hooks/useCatData', () => ({
  useCatData: () => ({
    cats: [
      {
        id: 'codex',
        displayName: 'Codex',
        breedDisplayName: 'Maine Coon',
        nickname: 'Code Review',
        provider: 'openai',
        defaultModel: 'gpt-5.4',
        mentionPatterns: ['@codex'],
        roster: { available: true },
      },
    ],
    refresh: vi.fn(async () => []),
  }),
}));

vi.mock('@/components/HubConnectorConfigTab', () => ({
  HubConnectorConfigTab: () => React.createElement('div', { 'data-testid': 'hub-connector-config-tab' }),
}));

vi.mock('@/components/HubCapabilityTab', () => ({
  HubCapabilityTab: () => React.createElement('div', { 'data-testid': 'hub-capability-tab' }),
}));

vi.mock('@/components/HubSkillsTab', () => ({
  HubSkillsTab: () => React.createElement('div', { 'data-testid': 'hub-skills-tab' }),
}));

vi.mock('@/components/HubCatEditor', () => ({
  HubCatEditor: () => null,
}));

type MockResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

function createJsonResponse(payload: unknown): MockResponse {
  return {
    ok: true,
    json: async () => payload,
  };
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('business theme panels', () => {
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
    apiFetch.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('renders the channels panel with OfficeClaw shell, title, and primary action', async () => {
    apiFetch.mockResolvedValue(
      createJsonResponse({
        platforms: [
          {
            id: 'slack',
            name: 'Slack',
            nameEn: 'Slack',
            configured: true,
            fields: [],
            docsUrl: '',
            steps: [],
          },
        ],
      }),
    );

    await act(async () => {
      root.render(React.createElement(ChannelsPanel));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="channels-panel-shell"]');
    const title = container.querySelector('[data-testid="channels-panel-title"]');
    const primaryAction = container.querySelector('[data-testid="channels-panel-primary-action"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(title?.className ?? '').toContain('text-[26px]');
    expect(primaryAction?.className ?? '').toContain('bg-[#171717]');
  });

  it('renders the models panel with OfficeClaw shell, title, and primary action', async () => {
    apiFetch.mockResolvedValue(createJsonResponse({ list: [] }));

    await act(async () => {
      root.render(React.createElement(ModelsPanel));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="models-panel-shell"]');
    const title = container.querySelector('[data-testid="models-panel-title"]');
    const primaryAction = container.querySelector('[data-testid="models-panel-primary-action"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(title?.className ?? '').toContain('text-[26px]');
    expect(primaryAction?.className ?? '').toContain('bg-[#171717]');
  });

  it('renders the skills panel with OfficeClaw shell and segmented tabs', async () => {
    await act(async () => {
      root.render(React.createElement(SkillsPanel));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="skills-panel-shell"]');
    const title = container.querySelector('[data-testid="skills-panel-title"]');
    const segments = container.querySelector('[data-testid="skills-panel-segments"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(title?.className ?? '').toContain('text-[26px]');
    expect(segments?.className ?? '').toContain('rounded-[14px]');
  });

  it('renders the agents panel with OfficeClaw shell, title, and primary action', async () => {
    apiFetch.mockResolvedValue(
      createJsonResponse({
        config: {
          cats: {
            codex: {
              provider: 'openai',
              model: 'gpt-5.4',
            },
          },
          coCreator: null,
        },
      }),
    );

    await act(async () => {
      root.render(React.createElement(AgentsPanel));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="agents-panel-shell"]');
    const title = container.querySelector('[data-testid="agents-panel-title"]');
    const primaryAction = container.querySelector('[data-testid="agents-panel-primary-action"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(title?.className ?? '').toContain('text-[26px]');
    expect(primaryAction?.className ?? '').toContain('bg-[#171717]');
  });
});
