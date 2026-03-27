import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserPanel } from '@/components/workspace/BrowserPanel';
import { RightStatusPanel } from '@/components/RightStatusPanel';
import { SplitPaneView } from '@/components/SplitPaneView';
import { WorkspacePanel } from '@/components/WorkspacePanel';

const mocks = vi.hoisted(() => ({
  useWorkspace: vi.fn(),
  useFileManagement: vi.fn(),
  useChatStore: vi.fn(),
  apiFetch: vi.fn(),
  usePersistedState: vi.fn(),
  useHmrStatus: vi.fn(),
  usePreviewBridge: vi.fn(),
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

vi.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: (...args: unknown[]) => mocks.useWorkspace(...args),
}));
vi.mock('@/hooks/useFileManagement', () => ({
  useFileManagement: (...args: unknown[]) => mocks.useFileManagement(...args),
}));
vi.mock('@/stores/chatStore', () => ({
  useChatStore: (selector?: (state: Record<string, unknown>) => unknown) => {
    const state: Record<string, unknown> = {
      threads: [
        { id: 'thread-a', title: 'Thread A', participants: ['codex'] },
        { id: 'thread-b', title: 'Thread B', participants: ['opus'] },
      ],
      splitPaneThreadIds: ['thread-a'],
      splitPaneTargetId: 'thread-a',
      setSplitPaneTarget: vi.fn(),
      setSplitPaneThreadIds: vi.fn(),
      getThreadState: vi.fn((id: string) => ({
        hasActiveInvocation: id === 'thread-a',
        messages: [{ id: `${id}-1`, type: 'assistant', catId: 'codex', content: 'hello world' }],
        catStatuses: {},
        isLoading: false,
        unreadCount: 0,
      })),
      setViewMode: vi.fn(),
      setWorkspaceWorktreeId: vi.fn(),
      setWorkspaceOpenFile: vi.fn(),
      workspaceOpenTabs: [],
      restoreWorkspaceTabs: vi.fn(),
      workspaceOpenFilePath: null,
      workspaceOpenFileLine: null,
      setRightPanelMode: vi.fn(),
      setPendingChatInsert: vi.fn(),
      currentThreadId: 'thread-a',
      workspaceEditToken: null,
      workspaceEditTokenExpiry: null,
      setWorkspaceEditToken: vi.fn(),
      pendingPreviewAutoOpen: null,
      consumePreviewAutoOpen: vi.fn(() => null),
      workspaceRevealPath: null,
      setWorkspaceRevealPath: vi.fn(),
      hubState: { open: false },
      openHub: vi.fn(),
      closeHub: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));
vi.mock('@/utils/api-client', () => ({
  API_URL: 'http://localhost:3004',
  apiFetch: (...args: unknown[]) => mocks.apiFetch(...args),
}));
vi.mock('@/hooks/usePersistedState', () => ({
  usePersistedState: (...args: unknown[]) => mocks.usePersistedState(...args),
}));
vi.mock('@/hooks/useCatData', () => ({
  useCatData: () => ({
    cats: [],
    refresh: vi.fn(async () => []),
    getCatById: vi.fn(() => null),
  }),
  formatCatName: (cat: { displayName?: string; nickname?: string; id?: string }) =>
    cat.displayName ?? cat.nickname ?? cat.id ?? 'Cat',
}));
vi.mock('@/components/ChatInput', () => ({
  ChatInput: () => React.createElement('div', { 'data-testid': 'split-pane-chat-input' }),
}));
vi.mock('@/components/MiniThreadSidebar', () => ({
  MiniThreadSidebar: () => React.createElement('div', { 'data-testid': 'split-pane-sidebar' }),
}));
vi.mock('@/components/SplitPaneCell', () => ({
  SplitPaneCell: () => React.createElement('div', { 'data-testid': 'split-pane-cell' }),
  SplitPanePlaceholder: ({ index }: { index: number }) =>
    React.createElement('div', { 'data-testid': `split-pane-placeholder-${index}` }),
}));
vi.mock('@/components/MarkdownContent', () => ({
  MarkdownContent: () => React.createElement('div', { 'data-testid': 'workspace-markdown' }),
}));
vi.mock('@/components/useConfirm', () => ({
  useConfirm: () => vi.fn(async () => true),
}));
vi.mock('@/components/workspace/ChangesPanel', () => ({ ChangesPanel: () => null }));
vi.mock('@/components/workspace/GitPanel', () => ({ GitPanel: () => null }));
vi.mock('@/components/workspace/TerminalTab', () => ({ TerminalTab: () => null }));
vi.mock('@/components/workspace/JsxPreview', () => ({ JsxPreview: () => null }));
vi.mock('@/components/workspace/LinkedRootsManager', () => ({
  LinkedRootsManager: () => null,
  LinkedRootRemoveButton: () => null,
}));
vi.mock('@/components/workspace/CodeViewer', () => ({
  CodeViewer: () => React.createElement('div', { 'data-testid': 'workspace-code-viewer' }),
}));
vi.mock('@/components/workspace/FileIcons', () => ({ FileIcon: () => null }));
vi.mock('@/components/workspace/ResizeHandle', () => ({ ResizeHandle: () => null }));
vi.mock('@/components/workspace/WorkspaceTree', () => ({
  WorkspaceTree: () => React.createElement('div', { 'data-testid': 'workspace-tree' }),
}));
vi.mock('@/components/audit/AuditExplorerPanel', () => ({ AuditExplorerPanel: () => null }));
vi.mock('@/components/CatTokenUsage', () => ({ CatTokenUsage: () => null }));
vi.mock('@/components/PlanBoardPanel', () => ({ PlanBoardPanel: () => null }));
vi.mock('@/components/SessionChainPanel', () => ({ SessionChainPanel: () => null }));
vi.mock('@/components/workspace/useHmrStatus', () => ({
  useHmrStatus: (...args: unknown[]) => mocks.useHmrStatus(...args),
}));
vi.mock('@/components/workspace/usePreviewBridge', () => ({
  usePreviewBridge: (...args: unknown[]) => mocks.usePreviewBridge(...args),
}));

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

function setupWorkspaceMocks() {
  mocks.useWorkspace.mockReturnValue({
    worktrees: [{ id: 'main', branch: 'main', head: 'abc123', root: '/tmp/repo', isBare: false, isMain: true }],
    worktreeId: 'main',
    tree: [],
    file: null,
    searchResults: [],
    loading: false,
    error: null,
    search: vi.fn(),
    setSearchResults: vi.fn(),
    fetchFile: vi.fn(),
    fetchTree: vi.fn(),
    fetchSubtree: vi.fn(),
    fetchWorktrees: vi.fn(),
    revealInFinder: vi.fn(),
  });
  mocks.useFileManagement.mockReturnValue({
    createFile: vi.fn(),
    createDir: vi.fn(),
    deleteItem: vi.fn(),
    renameItem: vi.fn(),
    uploadFile: vi.fn(),
  });
  mocks.usePersistedState.mockImplementation((_key: string, initialValue: unknown) => [initialValue, vi.fn(), vi.fn()]);
}

describe('business theme auxiliary panes', () => {
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
    mocks.apiFetch.mockReset();
    mocks.useWorkspace.mockReset();
    mocks.useFileManagement.mockReset();
    mocks.usePersistedState.mockReset();
    mocks.useHmrStatus.mockReset();
    mocks.usePreviewBridge.mockReset();
    mocks.useHmrStatus.mockReturnValue('idle');
    mocks.usePreviewBridge.mockReturnValue({
      consoleEntries: [],
      consoleOpen: false,
      setConsoleOpen: vi.fn(),
      isCapturing: false,
      screenshotUrl: null,
      handleScreenshot: vi.fn(),
      clearConsole: vi.fn(),
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('renders the split pane view with OfficeClaw shell surfaces', async () => {
    await act(async () => {
      root.render(
        React.createElement(SplitPaneView, {
          onSend: vi.fn(),
          onStop: vi.fn(),
          onZoomToThread: vi.fn(),
        }),
      );
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="split-pane-shell"]');
    const header = container.querySelector('[data-testid="split-pane-header"]');
    const inputShell = container.querySelector('[data-testid="split-pane-input-shell"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-page)]');
    expect(header?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(inputShell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
  });

  it('renders the browser panel with OfficeClaw shell and toolbar', async () => {
    mocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ available: true, gatewayPort: 9010 }),
    });

    await act(async () => {
      root.render(React.createElement(BrowserPanel, { initialPort: 5173 }));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="browser-panel-shell"]');
    const toolbar = container.querySelector('[data-testid="browser-toolbar"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(toolbar?.className ?? '').toContain('border-[var(--oc-border-default)]');
  });

  it('renders the workspace panel with OfficeClaw shell and header', async () => {
    setupWorkspaceMocks();

    await act(async () => {
      root.render(React.createElement(WorkspacePanel));
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="workspace-panel-shell"]');
    const title = container.querySelector('[data-testid="workspace-panel-title"]');

    expect(shell?.className ?? '').toContain('border-[var(--oc-border-default)]');
    expect(title?.className ?? '').toContain('text-[var(--oc-text-title)]');
  });

  it('renders the right status panel with OfficeClaw shell surfaces', async () => {
    await act(async () => {
      root.render(
        React.createElement(RightStatusPanel, {
          intentMode: 'execute',
          targetCats: [],
          catStatuses: {},
          catInvocations: {},
          threadId: 'thread-a',
          messageSummary: {
            total: 0,
            assistant: 0,
            system: 0,
            evidence: 0,
            followup: 0,
          },
        }),
      );
    });
    await flushEffects();

    const shell = container.querySelector('[data-testid="right-status-shell"]');
    const section = container.querySelector('[data-testid="right-status-active-section"]');

    expect(shell?.className ?? '').toContain('bg-[var(--oc-bg-surface)]');
    expect(section?.className ?? '').toContain('border-[var(--oc-border-default)]');
  });
});
