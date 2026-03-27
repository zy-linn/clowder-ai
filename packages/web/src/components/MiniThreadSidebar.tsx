'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { CatStatusType } from '@/stores/chat-types';
import { type Thread, useChatStore } from '@/stores/chatStore';
import { CatAvatar } from './CatAvatar';
import { getCatStatusType } from './ThreadCatStatus';

interface MiniThreadSidebarProps {
  onAssignToPane: (threadId: string) => void;
}

const MIN_WIDTH = 40;
const DEFAULT_WIDTH = 160;
const MAX_WIDTH = 300;

export function MiniThreadSidebar({ onAssignToPane }: MiniThreadSidebarProps) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const { threads, splitPaneThreadIds, getThreadState } = useChatStore();
  const assignedSet = new Set(splitPaneThreadIds);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const available = threads.filter((thread) => thread.id !== 'default' && !assignedSet.has(thread.id));
  const assigned = threads.filter((thread) => assignedSet.has(thread.id));
  const isCollapsed = width < 80;

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      dragging.current = true;
      const startX = event.clientX;
      const startWidth = width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;
        const delta = moveEvent.clientX - startX;
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta)));
      };
      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        cleanupRef.current = null;
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      cleanupRef.current = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    },
    [width],
  );

  return (
    <aside
      className={
        isBusinessTheme
          ? 'relative flex h-full flex-shrink-0 flex-col border-r border-[var(--oc-border-default)] bg-[var(--oc-bg-sidebar)]'
          : 'relative flex h-full flex-shrink-0 flex-col border-r border-cocreator-light bg-white'
      }
      style={{ width }}
    >
      <div className="flex-1 space-y-0.5 overflow-y-auto px-1 py-2">
        {assigned.length > 0 && (
          <div className="mb-1 px-1">
            <span className={isBusinessTheme ? 'text-[9px] uppercase tracking-wider text-[var(--oc-text-secondary)]' : 'text-[9px] uppercase tracking-wider text-gray-400'}>
              {isCollapsed ? '' : '窗格中'}
            </span>
          </div>
        )}
        {assigned.map((thread) => (
          <MiniThreadRow key={thread.id} thread={thread} isInPane isCollapsed={isCollapsed} getThreadState={getThreadState} />
        ))}

        {assigned.length > 0 && available.length > 0 && <div className="mx-1 my-1.5 border-t border-gray-200" />}

        {available.length > 0 && (
          <div className="mb-1 px-1">
            <span className={isBusinessTheme ? 'text-[9px] uppercase tracking-wider text-[var(--oc-text-secondary)]' : 'text-[9px] uppercase tracking-wider text-gray-400'}>
              {isCollapsed ? '' : '可添加'}
            </span>
          </div>
        )}
        {available.map((thread) => (
          <MiniThreadRow
            key={thread.id}
            thread={thread}
            isCollapsed={isCollapsed}
            getThreadState={getThreadState}
            onClick={() => onAssignToPane(thread.id)}
          />
        ))}
      </div>

      <div
        className={
          isBusinessTheme
            ? 'absolute right-0 top-0 h-full w-1.5 cursor-col-resize transition-colors hover:bg-[rgba(79,107,255,0.16)] active:bg-[rgba(79,107,255,0.22)]'
            : 'absolute right-0 top-0 h-full w-1.5 cursor-col-resize transition-colors hover:bg-cocreator-primary/20 active:bg-cocreator-primary/30'
        }
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}

function MiniThreadRow({
  thread,
  isInPane,
  isCollapsed,
  getThreadState,
  onClick,
}: {
  thread: Thread;
  isInPane?: boolean;
  isCollapsed: boolean;
  getThreadState: (id: string) => {
    catStatuses: Record<string, CatStatusType>;
    unreadCount: number;
    hasUserMention: boolean;
  };
  onClick?: () => void;
}) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const threadState = getThreadState(thread.id);
  const status = getCatStatusType(threadState.catStatuses);
  const dotColor =
    status === 'error'
      ? 'bg-red-400'
      : status === 'working'
        ? 'bg-amber-400 animate-pulse'
        : status === 'done'
          ? 'bg-green-400'
          : '';

  const firstCat = thread.participants[0];
  const title = thread.title ?? thread.id;

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors ${
        isBusinessTheme
          ? isInPane
            ? 'bg-[var(--oc-bg-surface)]'
            : 'hover:bg-[var(--oc-bg-surface-soft)]'
          : isInPane
            ? 'bg-cocreator-bg/60'
            : 'hover:bg-gray-100'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      title={title}
    >
      <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
        {firstCat ? (
          <CatAvatar catId={firstCat} size={20} />
        ) : (
          <span className="text-xs font-medium text-gray-500">{title.charAt(0).toUpperCase()}</span>
        )}
        {dotColor && <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${dotColor}`} />}
      </div>
      {!isCollapsed && (
        <span className={isBusinessTheme ? 'min-w-0 flex-1 truncate text-xs text-[var(--oc-text-body)]' : 'min-w-0 flex-1 truncate text-xs text-gray-700'}>
          {title}
        </span>
      )}
      {threadState.unreadCount > 0 && (
        <span
          className={`min-w-[14px] flex-shrink-0 rounded-full px-0.5 text-center text-[8px] leading-3 ${
            threadState.hasUserMention ? 'bg-red-500' : 'bg-amber-500'
          } text-white`}
        >
          {threadState.unreadCount > 9 ? '9+' : threadState.unreadCount}
        </span>
      )}
    </button>
  );
}
