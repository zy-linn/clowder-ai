'use client';

import { useCallback, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { UploadStatus, WhisperOptions } from '@/hooks/useSendMessage';
import type { DeliveryMode } from '@/stores/chat-types';
import { type Thread, useChatStore } from '@/stores/chatStore';
import { ChatInput } from './ChatInput';
import { PawIcon } from './icons/PawIcon';
import { MiniThreadSidebar } from './MiniThreadSidebar';
import { SplitPaneCell, SplitPanePlaceholder } from './SplitPaneCell';

interface SplitPaneViewProps {
  onSend: (
    content: string,
    images?: File[],
    overrideThreadId?: string,
    whisper?: WhisperOptions,
    deliveryMode?: DeliveryMode,
  ) => void;
  onStop: (overrideThreadId?: string) => void;
  uploadStatus?: UploadStatus;
  uploadError?: string | null;
  onZoomToThread: (threadId: string) => void;
}

const PANE_COUNT = 4;

export function SplitPaneView({ onSend, onStop, uploadStatus, uploadError, onZoomToThread }: SplitPaneViewProps) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const { threads, splitPaneThreadIds, splitPaneTargetId, setSplitPaneTarget, setSplitPaneThreadIds, getThreadState } =
    useChatStore();

  const threadMap = new Map<string, Thread>();
  for (const thread of threads) threadMap.set(thread.id, thread);

  const paneSlots = useMemo(() => {
    const slots: (string | null)[] = [];
    for (let index = 0; index < PANE_COUNT; index++) {
      slots.push(splitPaneThreadIds[index] ?? null);
    }
    return slots;
  }, [splitPaneThreadIds]);

  const handleSelectPane = useCallback((threadId: string) => setSplitPaneTarget(threadId), [setSplitPaneTarget]);
  const handleDoubleClick = useCallback((threadId: string) => onZoomToThread(threadId), [onZoomToThread]);

  const handleAssignToPane = useCallback(
    (threadId: string) => {
      if (splitPaneThreadIds.includes(threadId)) return;
      const next = [...splitPaneThreadIds];
      const emptyIndex = paneSlots.indexOf(null);
      if (emptyIndex >= 0) {
        while (next.length <= emptyIndex) next.push('');
        next[emptyIndex] = threadId;
      } else {
        const selectedIndex = splitPaneTargetId ? paneSlots.indexOf(splitPaneTargetId) : 0;
        const replaceIndex = selectedIndex >= 0 ? selectedIndex : 0;
        next[replaceIndex] = threadId;
      }
      setSplitPaneThreadIds(next.filter(Boolean));
      setSplitPaneTarget(threadId);
    },
    [paneSlots, setSplitPaneTarget, setSplitPaneThreadIds, splitPaneTargetId, splitPaneThreadIds],
  );

  const targetThreadState = splitPaneTargetId ? getThreadState(splitPaneTargetId) : null;
  const isTargetActiveInvocation = targetThreadState?.hasActiveInvocation ?? false;

  const handleBackToSingle = useCallback(() => {
    const target = splitPaneTargetId ?? splitPaneThreadIds[0];
    if (target) {
      onZoomToThread(target);
    } else {
      useChatStore.getState().setViewMode('single');
    }
  }, [onZoomToThread, splitPaneTargetId, splitPaneThreadIds]);

  return (
    <div
      className={`flex h-screen h-dvh flex-col ${isBusinessTheme ? 'bg-[var(--oc-bg-page)] text-[var(--oc-text-body)]' : ''}`}
      data-testid="split-pane-shell"
    >
      <header
        className={
          isBusinessTheme
            ? 'flex flex-shrink-0 items-center gap-2 border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-5 py-3'
            : 'flex flex-shrink-0 items-center gap-2 border-b border-cocreator-light bg-cocreator-bg px-5 py-3'
        }
        data-testid="split-pane-header"
      >
        <PawIcon className="h-6 w-6 text-cocreator-primary" />
        <div className="min-w-0 flex-1">
          <h1 className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-title)]' : 'text-lg font-bold text-cafe-black'}>
            OfficeClaw
          </h1>
          <p className={isBusinessTheme ? 'text-xs text-[var(--oc-text-secondary)]' : 'text-xs text-gray-500'}>分屏模式</p>
        </div>
        <span className={isBusinessTheme ? 'mr-1 hidden text-[10px] text-[var(--oc-text-secondary)] sm:inline' : 'mr-1 hidden text-[10px] text-gray-400 sm:inline'}>
          双击切换
        </span>
        <button
          onClick={handleBackToSingle}
          className={
            isBusinessTheme
              ? 'rounded-[10px] p-2 text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
              : 'rounded-lg p-1 transition-colors hover:bg-cocreator-light'
          }
          aria-label="切换单屏模式"
          title="返回单屏"
        >
          <svg className={isBusinessTheme ? 'h-5 w-5 text-current' : 'h-5 w-5 text-gray-500'} viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="2" width="16" height="16" rx="2" />
          </svg>
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <MiniThreadSidebar onAssignToPane={handleAssignToPane} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 p-2">
            {paneSlots.map((threadId, index) => {
              if (!threadId) {
                return <SplitPanePlaceholder key={`empty-${index}`} index={index} />;
              }
              const thread = threadMap.get(threadId);
              return (
                <SplitPaneCell
                  key={threadId}
                  threadId={threadId}
                  threadTitle={thread?.title ?? '未命名对话'}
                  threadState={getThreadState(threadId)}
                  isSelected={splitPaneTargetId === threadId}
                  onSelect={handleSelectPane}
                  onDoubleClick={handleDoubleClick}
                />
              );
            })}
          </div>

          <div
            className={
              isBusinessTheme
                ? 'border-t border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-3 py-2'
                : 'border-t border-cocreator-light bg-white px-3 py-2'
            }
            data-testid="split-pane-input-shell"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={isBusinessTheme ? 'text-[10px] text-[var(--oc-text-secondary)]' : 'text-[10px] text-gray-400'}>
                {splitPaneTargetId
                  ? `发送至: ${threadMap.get(splitPaneTargetId)?.title ?? splitPaneTargetId}`
                  : '请选择一个窗格'}
              </span>
            </div>
            <ChatInput
              key={splitPaneTargetId ?? 'no-target'}
              threadId={splitPaneTargetId ?? undefined}
              onSend={(content, images, whisper, deliveryMode) =>
                onSend(content, images, splitPaneTargetId ?? undefined, whisper, deliveryMode)
              }
              onStop={() => onStop(splitPaneTargetId ?? undefined)}
              disabled={!splitPaneTargetId}
              hasActiveInvocation={isTargetActiveInvocation}
              uploadStatus={uploadStatus}
              uploadError={uploadError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
