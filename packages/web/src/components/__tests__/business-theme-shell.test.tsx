import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatContainer } from '@/components/ChatContainer';

type MockStoreState = {
  messages: unknown[];
  hasActiveInvocation: boolean;
  intentMode: null;
  targetCats: string[];
  catStatuses: Record<string, string>;
  catInvocations: Record<string, unknown>;
  activeInvocations: Record<string, { catId: string }>;
  setCurrentThread: ReturnType<typeof vi.fn>;
  viewMode: 'single';
  setViewMode: ReturnType<typeof vi.fn>;
  clearUnread: ReturnType<typeof vi.fn>;
  confirmUnreadAck: ReturnType<typeof vi.fn>;
  armUnreadSuppression: ReturnType<typeof vi.fn>;
  uiThinkingExpandedByDefault: boolean;
  workspaceWorktreeId: string | null;
  splitPaneThreadIds: string[];
  setSplitPaneThreadIds: ReturnType<typeof vi.fn>;
  setSplitPaneTarget: ReturnType<typeof vi.fn>;
  threads: Array<{ id: string; title?: string; projectPath?: string; bootcampState?: boolean }>;
  setCurrentProject: ReturnType<typeof vi.fn>;
  showVoteModal: boolean;
  setShowVoteModal: ReturnType<typeof vi.fn>;
  addMessage: ReturnType<typeof vi.fn>;
  pendingChatInsert: { threadId: string; text: string } | null;
  setPendingChatInsert: ReturnType<typeof vi.fn>;
};

const businessConfig = {
  shell: {
    pageBgVar: 'var(--oc-bg-page)',
    sidebarBgVar: 'var(--oc-bg-sidebar)',
    cardBgVar: 'var(--oc-bg-surface)',
    inputBgVar: 'var(--oc-bg-surface-soft)',
  },
  sidebar: {
    bg: 'var(--oc-shell-sidebar-bg)',
    bgVar: 'var(--oc-bg-sidebar)',
    selectedItemBg: 'var(--oc-bg-surface)',
    selectedItemBgVar: 'var(--oc-bg-surface)',
  },
  content: {
    bg: 'var(--oc-shell-page-bg)',
    bgVar: 'var(--oc-bg-page)',
  },
  header: {
    bg: 'var(--oc-card-bg)',
    bgVar: 'var(--oc-bg-surface)',
  },
  footer: {
    bg: 'var(--oc-card-bg)',
    bgVar: 'var(--oc-bg-surface)',
  },
};

const createMockStoreState = (): MockStoreState => ({
  messages: [],
  hasActiveInvocation: false,
  intentMode: null,
  targetCats: [],
  catStatuses: {},
  catInvocations: {},
  activeInvocations: {},
  setCurrentThread: vi.fn(),
  viewMode: 'single',
  setViewMode: vi.fn(),
  clearUnread: vi.fn(),
  confirmUnreadAck: vi.fn(),
  armUnreadSuppression: vi.fn(),
  uiThinkingExpandedByDefault: false,
  workspaceWorktreeId: null,
  splitPaneThreadIds: [],
  setSplitPaneThreadIds: vi.fn(),
  setSplitPaneTarget: vi.fn(),
  threads: [],
  setCurrentProject: vi.fn(),
  showVoteModal: false,
  setShowVoteModal: vi.fn(),
  addMessage: vi.fn(),
  pendingChatInsert: null,
  setPendingChatInsert: vi.fn(),
});

let mockState = createMockStoreState();

vi.mock('@/stores/chatStore', () => ({
  useChatStore: (selector?: (state: MockStoreState) => unknown) => (selector ? selector(mockState) : mockState),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));
vi.mock('@/stores/taskStore', () => ({
  useTaskStore: () => ({ clearTasks: vi.fn() }),
}));
vi.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    gameView: null,
    isGameActive: false,
    isNight: false,
    selectedTarget: null,
    godScopeFilter: 'all',
    myRole: null,
    myRoleIcon: null,
    myActionLabel: null,
    myActionHint: null,
    isGodView: false,
    isDetective: false,
    detectiveBoundName: null,
    godSeats: [],
    godNightSteps: [],
    hasTargetedAction: false,
    altActionName: null,
    clearGame: vi.fn(),
    setSelectedTarget: vi.fn(),
    setGodScopeFilter: vi.fn(),
  }),
}));
vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({ cancelInvocation: vi.fn(), syncRooms: vi.fn() }),
}));
vi.mock('@/hooks/useAgentMessages', () => ({
  useAgentMessages: () => ({
    handleAgentMessage: vi.fn(),
    handleStop: vi.fn(),
    resetRefs: vi.fn(),
    resetTimeout: vi.fn(),
    clearDoneTimeout: vi.fn(),
  }),
}));
vi.mock('@/hooks/useChatHistory', () => ({
  useChatHistory: () => ({
    handleScroll: vi.fn(),
    scrollContainerRef: { current: null },
    messagesEndRef: { current: null },
    isLoadingHistory: false,
    hasMore: false,
  }),
}));
vi.mock('@/hooks/useSendMessage', () => ({
  useSendMessage: () => ({ handleSend: vi.fn(), uploadStatus: 'idle', uploadError: null }),
}));
vi.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: () => ({ pending: [], respond: vi.fn(), handleAuthRequest: vi.fn(), handleAuthResponse: vi.fn() }),
}));
vi.mock('@/hooks/useSplitPaneKeys', () => ({ useSplitPaneKeys: vi.fn() }));
vi.mock('@/hooks/useChatSocketCallbacks', () => ({
  useChatSocketCallbacks: () => ({}),
}));
vi.mock('@/hooks/useCatData', () => ({
  useCatData: () => ({ cats: [], getCatById: vi.fn() }),
}));
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: businessConfig,
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));
vi.mock('@/hooks/usePreviewAutoOpen', () => ({ usePreviewAutoOpen: vi.fn() }));
vi.mock('@/hooks/useWorkspaceNavigate', () => ({ useWorkspaceNavigate: vi.fn() }));
vi.mock('@/hooks/useVoiceAutoPlay', () => ({ useVoiceAutoPlay: vi.fn() }));
vi.mock('@/hooks/useVoiceStream', () => ({ useVoiceStream: vi.fn() }));
vi.mock('@/hooks/useVadInterrupt', () => ({ useVadInterrupt: vi.fn() }));
vi.mock('@/hooks/usePersistedState', () => ({
  usePersistedState: (_key: string, initialValue: number) => [initialValue, vi.fn(), vi.fn()],
}));
vi.mock('@/hooks/usePathCompletion', () => ({
  usePathCompletion: () => ({
    isOpen: false,
    entries: [],
    selectedIdx: 0,
    setSelectedIdx: vi.fn(),
    selectEntry: vi.fn(),
    close: vi.fn(),
  }),
}));
vi.mock('@/hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    state: 'idle',
    transcript: '',
    partialTranscript: '',
    duration: 0,
    error: null,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));
vi.mock('@/stores/inputHistoryStore', () => ({
  useInputHistoryStore: (selector?: (state: { addEntry: ReturnType<typeof vi.fn>; findMatch: () => null }) => unknown) =>
    selector ? selector({ addEntry: vi.fn(), findMatch: () => null }) : { addEntry: vi.fn(), findMatch: () => null },
}));
vi.mock('@/utils/api-client', () => ({
  apiFetch: vi.fn(() => new Promise(() => {})),
}));
vi.mock('@/utils/userId', () => ({ getUserId: () => 'test-user' }));
vi.mock('@/utils/compressImage', () => ({ compressImage: vi.fn(async (file: File) => file) }));

vi.mock('@/components/A2ACollapsible', () => ({ A2ACollapsible: () => null }));
vi.mock('@/components/AgentsPanel', () => ({ AgentsPanel: () => null }));
vi.mock('@/components/AuthorizationCard', () => ({ AuthorizationCard: () => null }));
vi.mock('@/components/BootcampListModal', () => ({ BootcampListModal: () => null }));
vi.mock('@/components/CatCafeHub', () => ({ CatCafeHub: () => null }));
vi.mock('@/components/ChannelsPanel', () => ({ ChannelsPanel: () => null }));
vi.mock('@/components/ChatMessage', () => ({ ChatMessage: () => null }));
vi.mock('@/components/game/GameOverlayConnector', () => ({ GameOverlayConnector: () => null }));
vi.mock('@/components/HubListModal', () => ({ HubListModal: () => null }));
vi.mock('@/components/MessageActions', () => ({
  MessageActions: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/MobileStatusSheet', () => ({ MobileStatusSheet: () => null }));
vi.mock('@/components/ModelsPanel', () => ({ ModelsPanel: () => null }));
vi.mock('@/components/ParallelStatusBar', () => ({ ParallelStatusBar: () => null }));
vi.mock('@/components/QueuePanel', () => ({ QueuePanel: () => null }));
vi.mock('@/components/ScrollToBottomButton', () => ({ ScrollToBottomButton: () => null }));
vi.mock('@/components/SkillsPanel', () => ({ SkillsPanel: () => null }));
vi.mock('@/components/SplitPaneView', () => ({ SplitPaneView: () => null }));
vi.mock('@/components/ThinkingIndicator', () => ({ ThinkingIndicator: () => null }));
vi.mock('@/components/ThreadExecutionBar', () => ({ ThreadExecutionBar: () => null }));
vi.mock('@/components/ThreadSidebar', () => ({
  ThreadSidebar: () => React.createElement('div', { 'data-testid': 'thread-sidebar-inner' }),
}));
vi.mock('@/components/VoteConfigModal', () => ({ VoteConfigModal: () => null }));
vi.mock('@/components/VoteActiveBar', () => ({ VoteActiveBar: () => null }));
vi.mock('@/components/workspace/ResizeHandle', () => ({ ResizeHandle: () => null }));
vi.mock('@/components/ExportButton', () => ({ ExportButton: () => null }));
vi.mock('@/components/HubButton', () => ({ HubButton: () => null }));
vi.mock('@/components/VoiceCompanionButton', () => ({ VoiceCompanionButton: () => null }));
vi.mock('@/components/ChatInputMenus', () => ({ ChatInputMenus: () => null }));
vi.mock('@/components/game/GameLobby', () => ({ GameLobby: () => null }));
vi.mock('@/components/HistorySearchModal', () => ({ HistorySearchModal: () => null }));
vi.mock('@/components/ImagePreview', () => ({ ImagePreview: () => null }));
vi.mock('@/components/MobileInputToolbar', () => ({ MobileInputToolbar: () => null }));
vi.mock('@/components/PathCompletionMenu', () => ({ PathCompletionMenu: () => null }));
vi.mock('@/components/ChatInputActionButton', () => ({
  ChatInputActionButton: () => React.createElement('div', { 'data-testid': 'chat-input-action' }),
}));

describe('business theme shell', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { React?: typeof React }).React = React;
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width: 768px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockState = createMockStoreState();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('renders the chat shell with OfficeClaw business surfaces', () => {
    act(() => {
      root.render(React.createElement(ChatContainer, { threadId: 'default' }));
    });

    const shellRoot = container.querySelector('[data-testid="chat-shell-root"]');
    const sidebarShell = container.querySelector('[data-testid="thread-sidebar-shell"]');
    const chatInputShell = container.querySelector('[data-testid="chat-input-shell"]');

    expect(shellRoot?.getAttribute('style') ?? '').toContain('var(--oc-bg-page)');
    expect(sidebarShell?.getAttribute('style') ?? '').toContain('var(--oc-bg-sidebar)');
    expect(chatInputShell?.getAttribute('style') ?? '').toContain('var(--oc-bg-surface)');
  });
});
