'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { apiFetch } from '@/utils/api-client';
import { DEFAULT_VISUAL, PLATFORM_VISUALS, StatusDotConnected, StatusDotIdle } from './HubConfigIcons';
import { HubConnectorConfigTab } from './HubConnectorConfigTab';

const CHANNEL_TITLE = '\u6e20\u9053';
const CHANNEL_STATUS = '\u5df2\u66f4\u65b0\u6e20\u9053';
const CHANNEL_MANAGE = '\u6e20\u9053\u7ba1\u7406';
const PLATFORM_CONFIG = '\u5e73\u53f0\u914d\u7f6e';
const CLOSE_TEXT = '\u5173\u95ed';
const LOADING_TEXT = '\u52a0\u8f7d\u4e2d...';
const EMPTY_TEXT = '\u6682\u65e0\u53ef\u7528\u6e20\u9053';

interface PlatformFieldStatus {
  envName: string;
  label: string;
  sensitive: boolean;
  currentValue: string | null;
}

interface PlatformStatus {
  id: string;
  name: string;
  nameEn: string;
  configured: boolean;
  fields: PlatformFieldStatus[];
  docsUrl: string;
  steps: string[];
}

export function ChannelsPanel() {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/connector/status');
      if (!res.ok) return;
      const data = (await res.json()) as { platforms?: PlatformStatus[] };
      setPlatforms(data.platforms ?? []);
    } catch {
      setPlatforms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const activeChannel = useMemo(
    () => platforms.find((channel) => channel.id === activeChannelId) ?? null,
    [platforms, activeChannelId],
  );

  const openPlatformConfig = (channelId: string) => setActiveChannelId(channelId);

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${isBusinessTheme ? 'gap-4 bg-[var(--oc-bg-surface)] text-[var(--oc-text-body)]' : 'gap-3 bg-[#FFFFFF]'}`}
      data-testid="channels-panel-shell"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1
            className={isBusinessTheme ? 'text-[26px] font-bold leading-none tracking-[-0.02em] text-[var(--oc-text-title)]' : 'text-[32px] font-semibold leading-none text-[#1F2329]'}
            data-testid="channels-panel-title"
          >
            {CHANNEL_TITLE}
          </h1>
          {isBusinessTheme && <p className="text-[13px] text-[var(--oc-text-secondary)]">统一管理已接入渠道与平台配置。</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={isBusinessTheme ? 'text-xs font-medium text-[var(--oc-text-secondary)]' : 'text-xs font-medium text-[#8E99A8]'}>
            {CHANNEL_STATUS}
          </span>
          <button
            type="button"
            onClick={() => openPlatformConfig(platforms[0]?.id ?? '')}
            className={
              isBusinessTheme
                ? 'rounded-[10px] bg-[#171717] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0f172a]'
                : 'rounded-[18px] bg-[#111418] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#2A3038]'
            }
            data-testid="channels-panel-primary-action"
          >
            {CHANNEL_MANAGE}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <p className={isBusinessTheme ? 'py-6 text-center text-sm text-[var(--oc-text-secondary)]' : 'py-6 text-center text-sm text-gray-400'}>
            {LOADING_TEXT}
          </p>
        )}

        {!isLoading && platforms.length === 0 && (
          <p className={isBusinessTheme ? 'py-6 text-center text-sm text-[var(--oc-text-secondary)]' : 'py-6 text-center text-sm text-gray-400'}>
            {EMPTY_TEXT}
          </p>
        )}

        {!isLoading && platforms.length > 0 && (
          <div className="space-y-3 pb-2">
            {platforms.map((channel) => {
              const v = PLATFORM_VISUALS[channel.id] ?? DEFAULT_VISUAL;
              return (
                <section key={channel.id} className="space-y-2" data-testid={`channel-section-${channel.id}`}>
                  <div
                    className={
                      isBusinessTheme
                        ? 'rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-4 py-3 shadow-none'
                        : 'rounded-xl border border-gray-200 bg-white px-3 py-2.5'
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: v.iconBg, color: v.iconColor }}
                          aria-hidden="true"
                        >
                          {v.icon}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={
                              isBusinessTheme
                                ? 'block truncate text-[15px] font-semibold text-[var(--oc-text-heading)]'
                                : 'block truncate text-sm font-semibold text-[#2E3440]'
                            }
                          >
                            {channel.name}
                            {channel.nameEn && channel.nameEn !== channel.name ? ` ${channel.nameEn}` : ''}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs ${
                              channel.configured
                                ? isBusinessTheme
                                  ? 'text-[#16A34A]'
                                  : 'text-green-600'
                                : isBusinessTheme
                                  ? 'text-[var(--oc-text-secondary)]'
                                  : 'text-gray-400'
                            }`}
                          >
                            {channel.configured ? <StatusDotConnected /> : <StatusDotIdle />}
                            {channel.configured ? '\u5df2\u914d\u7f6e' : '\u672a\u914d\u7f6e'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {activeChannel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setActiveChannelId(null)}
          data-testid="platform-config-modal"
        >
          <div
            className={
              isBusinessTheme
                ? 'max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[20px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.16)]'
                : 'max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-2xl'
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-heading)]' : 'text-base font-semibold text-[#2E3440]'}>
                {PLATFORM_CONFIG} - {activeChannel.name}
              </h3>
              <button
                type="button"
                onClick={() => setActiveChannelId(null)}
                className={
                  isBusinessTheme
                    ? 'rounded-[10px] border border-[var(--oc-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
                    : 'rounded-lg border border-[#DCE1E8] px-3 py-1.5 text-xs font-medium text-[#5F6775] transition-colors hover:bg-[#F7F8FA]'
                }
              >
                {CLOSE_TEXT}
              </button>
            </div>
            <HubConnectorConfigTab />
          </div>
        </div>
      )}
    </div>
  );
}
