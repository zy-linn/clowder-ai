import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/stores/chatStore';
import { ExportButton } from './ExportButton';
import { HubButton } from './HubButton';
import { VoiceCompanionButton } from './VoiceCompanionButton';

interface ChatContainerHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  threadId: string;
  authPendingCount: number;
  viewMode: 'single' | 'split';
  onToggleViewMode: () => void;
  onOpenMobileStatus: () => void;
  /** F092: Default cat for voice companion */
  defaultCatId: string;
}

export function ChatContainerHeader({
  sidebarOpen,
  onToggleSidebar,
  threadId,
  authPendingCount,
  // F099/OQ-4: viewMode toggle hidden - candidate for removal (KD-7)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewMode: _viewMode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleViewMode: _onToggleViewMode,
  onOpenMobileStatus,
  defaultCatId,
}: ChatContainerHeaderProps) {
  const { theme, config, toggleTheme } = useTheme();
  const isBusinessTheme = theme === 'business';

  const headerBgColor = isBusinessTheme ? config?.header?.bgVar : undefined;
  const headerClassName = isBusinessTheme
    ? 'safe-area-top border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)]'
    : 'border-b border-cocreator-light bg-cocreator-bg safe-area-top';
  const iconButtonClassName = isBusinessTheme
    ? 'rounded-[10px] border border-transparent p-1.5 text-[var(--oc-text-secondary)] transition-colors hover:border-[var(--oc-border-default)] hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
    : 'p-1 rounded-lg hover:bg-cocreator-light transition-colors';

  return (
    <header className={headerClassName} style={headerBgColor ? { backgroundColor: headerBgColor } : undefined}>
      <div className={`flex items-center gap-2 ${isBusinessTheme ? 'px-5 py-3.5' : 'px-5 py-3'}`}>
        <button
          onClick={onToggleSidebar}
          className={`${iconButtonClassName} mr-1`}
          title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg className={`h-5 w-5 ${isBusinessTheme ? 'text-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <img src="/images/lobster.svg" alt="OfficeClaw" className={isBusinessTheme ? 'h-9 w-9 rounded-[10px]' : 'w-10 h-10'} />
        <div className="flex-1 min-w-0">
          <h1 className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-title)]' : 'text-lg font-bold text-cafe-black'}>
            OfficeClaw
          </h1>
          <ThreadIndicator threadId={threadId} />
        </div>
        <ExportButton threadId={threadId} />
        <VoiceCompanionButton threadId={threadId} defaultCatId={defaultCatId} />
        <Link
          href={`/signals?from=${encodeURIComponent(threadId)}`}
          className={iconButtonClassName}
          title="Signal Inbox"
          aria-label="Signal Inbox"
        >
          <svg className={`h-5 w-5 ${isBusinessTheme ? 'text-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a9 9 0 010 12.728 1 1 0 01-1.414-1.414 7 7 0 000-9.9 1 1 0 011.414-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 011.415-1.415zM10 9a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        {authPendingCount > 0 && (
          <span
            className={`inline-flex min-w-[20px] items-center justify-center px-1 text-[10px] font-bold ${isBusinessTheme ? 'h-6 rounded-full bg-[#171717] text-white' : 'h-5 rounded-full bg-amber-500 text-white animate-pulse-subtle'}`}
            title={`${authPendingCount} 个授权请求等待处理`}
          >
            🔐 {authPendingCount}
          </span>
        )}
        <HubButton />
        <button
          onClick={toggleTheme}
          className={iconButtonClassName}
          title={theme === 'default' ? '切换到商务主题' : '切换到默认主题'}
          aria-label={theme === 'default' ? 'Switch to business theme' : 'Switch to default theme'}
        >
          {theme === 'default' ? (
            <svg
              className={`h-5 w-5 ${isBusinessTheme ? 'text-current' : 'text-gray-500'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 11h6M9 15h6M9 7h6" />
            </svg>
          ) : (
            <svg
              className={`h-5 w-5 ${isBusinessTheme ? 'text-current' : 'text-gray-500'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <path d="M2 17h20" />
            </svg>
          )}
        </button>
        <button
          onClick={onOpenMobileStatus}
          className={`${iconButtonClassName} ml-1 lg:hidden`}
          title="打开状态面板"
          aria-label="打开状态面板"
        >
          <svg className={`h-5 w-5 ${isBusinessTheme ? 'text-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

function ThreadIndicator({ threadId }: { threadId: string }) {
  const threads = useChatStore((s) => s.threads);
  const currentThread = threads.find((t) => t.id === threadId);

  if (threadId === 'default') {
    return <p className="text-xs text-gray-500">大厅 · Your AI team collaboration space</p>;
  }

  const title = currentThread?.title ?? '未命名对话';
  const rawPath = currentThread?.projectPath ?? '';
  const rawBasename = rawPath === 'default' ? '' : (rawPath.split(/[/\\]/).pop() ?? '');
  const internalBasenames = ['cat-cafe', 'cat-cafe-runtime', 'clowder-ai'];
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? '';
  const projectName = internalBasenames.includes(rawBasename) && brandName ? brandName : rawBasename;

  return (
    <p className="text-xs text-gray-500 truncate" title={`${title}${projectName ? ` · ${projectName}` : ''}`}>
      <span className="font-medium text-gray-700">{title}</span>
      {projectName && <span className="text-gray-400"> · {projectName}</span>}
    </p>
  );
}
