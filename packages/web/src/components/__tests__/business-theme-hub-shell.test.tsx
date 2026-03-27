import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CatCafeHub } from '@/components/CatCafeHub';
import { HubConnectorConfigTab } from '@/components/HubConnectorConfigTab';

const { apiFetch, closeHub } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  closeHub: vi.fn(),
}));

const mockChatStoreState = {
  hubState: { open: true, tab: 'cats' as const },
  closeHub,
};

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

vi.mock('@/stores/chatStore', () => ({
  useChatStore: (selector?: (state: typeof mockChatStoreState) => unknown) =>
    selector ? selector(mockChatStoreState) : mockChatStoreState,
}));

vi.mock('@/hooks/useCatData', () => ({
  useCatData: () => ({
    cats: [],
    getCatById: () => undefined,
    refresh: vi.fn(async () => []),
  }),
}));

vi.mock('@/components/BrakeSettingsPanel', () => ({ BrakeSettingsPanel: () => null }));
vi.mock('@/components/config-viewer-tabs', () => ({
  CatOverviewTab: () => React.createElement('div', { 'data-testid': 'hub-cat-overview' }),
  SystemTab: () => React.createElement('div', { 'data-testid': 'hub-system-tab' }),
}));
vi.mock('@/components/HubCapabilityTab', () => ({ HubCapabilityTab: () => React.createElement('div', { 'data-testid': 'hub-capability-tab' }) }));
vi.mock('@/components/HubCatEditor', () => ({ HubCatEditor: () => null }));
vi.mock('@/components/HubClaudeRescueSection', () => ({ HubClaudeRescueSection: () => null }));
vi.mock('@/components/HubCoCreatorEditor', () => ({ HubCoCreatorEditor: () => null }));
vi.mock('@/components/HubCommandsTab', () => ({ HubCommandsTab: () => null }));
vi.mock('@/components/HubEnvFilesTab', () => ({ HubEnvFilesTab: () => null }));
vi.mock('@/components/HubGovernanceTab', () => ({ HubGovernanceTab: () => null }));
vi.mock('@/components/HubLeaderboardTab', () => ({ HubLeaderboardTab: () => null }));
vi.mock('@/components/HubProviderProfilesTab', () => ({ HubProviderProfilesTab: () => null }));
vi.mock('@/components/HubRoutingPolicyTab', () => ({ HubRoutingPolicyTab: () => null }));
vi.mock('@/components/HubSkillsTab', () => ({ HubSkillsTab: () => null }));
vi.mock('@/components/PushSettingsPanel', () => ({ PushSettingsPanel: () => null }));
vi.mock('@/components/VoiceSettingsPanel', () => ({ VoiceSettingsPanel: () => null }));

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

describe('business theme hub shell', () => {
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
    closeHub.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('renders the hub modal with OfficeClaw shell surfaces', async () => {
    apiFetch.mockResolvedValue(
      createJsonResponse({
        config: {
          cats: {},
          coCreator: null,
        },
      }),
    );

    await act(async () => {
      root.render(React.createElement(CatCafeHub));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="hub-modal-shell"]');
    const title = container.querySelector('[data-testid="hub-modal-title"]');
    const accordionGroup = container.querySelector('[data-testid="hub-accordion-group-cats"]');

    expect(shell?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(title?.className ?? '').toContain('text-[17px]');
    expect(accordionGroup?.className ?? '').toContain('border-[var(--oc-border-default)]');
  });

  it('renders the connector config tab with OfficeClaw shell and primary action', async () => {
    apiFetch.mockResolvedValue(
      createJsonResponse({
        platforms: [
          {
            id: 'feishu',
            name: '飞书',
            nameEn: 'Feishu',
            configured: false,
            docsUrl: 'https://example.com/docs',
            steps: ['打开平台后台', '填写应用信息'],
            fields: [
              {
                envName: 'FEISHU_APP_ID',
                label: 'App ID',
                sensitive: false,
                currentValue: null,
              },
            ],
          },
        ],
      }),
    );

    await act(async () => {
      root.render(React.createElement(HubConnectorConfigTab));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="connector-config-shell"]');
    const listShell = container.querySelector('[data-testid="connector-platform-list"]');
    const saveButton = container.querySelector('[data-testid="save-feishu"]');

    expect(shell?.className ?? '').toContain('text-[var(--oc-text-body)]');
    expect(listShell?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(saveButton?.className ?? '').toContain('bg-[#171717]');
  });
});
