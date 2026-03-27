'use client';

import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { ThreadState } from '@/stores/chat-types';
import type { ChatMessage } from '@/stores/chatStore';
import { CatAvatar } from './CatAvatar';
import { getCatStatusType } from './ThreadCatStatus';

const VISIBLE_MESSAGES = 5;

interface SplitPaneCellProps {
  threadId: string;
  threadTitle: string;
  threadState: ThreadState;
  isSelected: boolean;
  onSelect: (threadId: string) => void;
  onDoubleClick: (threadId: string) => void;
}

function MiniMessage({ msg }: { msg: ChatMessage }) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const isUser = msg.type === 'user' && !msg.catId;

  return (
    <div className={`flex gap-1.5 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && msg.catId && <CatAvatar catId={msg.catId} size={16} />}
      <p
        className={`max-w-[90%] truncate rounded-lg px-2 py-1 text-xs leading-relaxed ${
          isBusinessTheme
            ? isUser
              ? 'bg-[var(--oc-bg-surface-soft)] text-[var(--oc-text-body)]'
              : 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-secondary)]'
            : isUser
              ? 'bg-cocreator-bg text-cafe-black'
              : 'bg-gray-50 text-gray-700'
        } ${msg.isStreaming ? 'opacity-70' : ''}`}
      >
        {msg.content.slice(0, 120)}
        {msg.content.length > 120 ? '...' : ''}
        {msg.isStreaming && <span className="ml-1 animate-pulse">|</span>}
      </p>
    </div>
  );
}

export function SplitPaneCell({
  threadId,
  threadTitle,
  threadState,
  isSelected,
  onSelect,
  onDoubleClick,
}: SplitPaneCellProps) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const catStatus = getCatStatusType(threadState.catStatuses);
  const recentMessages = useMemo(() => threadState.messages.slice(-VISIBLE_MESSAGES), [threadState.messages]);

  const statusColor =
    catStatus === 'error'
      ? 'text-red-500'
      : catStatus === 'working'
        ? 'text-amber-500'
        : catStatus === 'done'
          ? 'text-green-500'
          : 'text-gray-400';

  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 transition-colors ${
        isBusinessTheme
          ? isSelected
            ? 'border-[#4F6BFF] bg-[var(--oc-bg-surface)] shadow-none'
            : 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] hover:border-[#C7D2FE]'
          : isSelected
            ? 'border-cocreator-primary shadow-sm'
            : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(threadId)}
      onDoubleClick={() => onDoubleClick(threadId)}
    >
      <div
        className={
          isBusinessTheme
            ? 'flex flex-shrink-0 items-center gap-1.5 border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] px-3 py-1.5'
            : 'flex flex-shrink-0 items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-1.5'
        }
      >
        <span className={`text-xs ${statusColor}`}>{catStatus !== 'idle' ? '●' : ''}</span>
        <span className={isBusinessTheme ? 'flex-1 truncate text-xs font-medium text-[var(--oc-text-heading)]' : 'flex-1 truncate text-xs font-medium text-gray-700'}>
          {threadTitle}
        </span>
        {threadState.isLoading && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
        {threadState.unreadCount > 0 && (
          <span className="min-w-[14px] rounded-full bg-amber-500 px-1 text-center text-[9px] text-white">
            {threadState.unreadCount > 99 ? '99+' : threadState.unreadCount}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {recentMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className={isBusinessTheme ? 'text-xs text-[var(--oc-text-tertiary)]' : 'text-xs text-gray-300'}>
              无消息
            </span>
          </div>
        ) : (
          recentMessages.map((msg) => <MiniMessage key={msg.id} msg={msg} />)
        )}
      </div>
    </div>
  );
}

export function SplitPanePlaceholder({ index }: { index: number }) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';

  return (
    <div
      className={
        isBusinessTheme
          ? 'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] transition-colors'
          : 'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 transition-colors'
      }
    >
      <span className={isBusinessTheme ? 'mb-1 text-2xl text-[var(--oc-text-tertiary)]' : 'mb-1 text-2xl text-gray-200'}>+</span>
      <span className={isBusinessTheme ? 'text-xs text-[var(--oc-text-secondary)]' : 'text-xs text-gray-400'}>窗格 {index + 1}</span>
      <span className={isBusinessTheme ? 'mt-0.5 text-[10px] text-[var(--oc-text-tertiary)]' : 'mt-0.5 text-[10px] text-gray-300'}>
        点击左侧对话分配到此处
      </span>
    </div>
  );
}
