'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCatData } from '@/hooks/useCatData';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/stores/chatStore';
import { apiFetch } from '@/utils/api-client';
import { BrakeSettingsPanel } from './BrakeSettingsPanel';
import {
  AccordionSection,
  ALL_TABS,
  findGroupForTab,
  HUB_GROUPS,
  type HubTabId,
  resolveRequestedHubTab,
} from './cat-cafe-hub.navigation';
import { CatOverviewTab, type ConfigData, SystemTab } from './config-viewer-tabs';
import { HubCapabilityTab } from './HubCapabilityTab';
import { HubCatEditor } from './HubCatEditor';
import { HubClaudeRescueSection } from './HubClaudeRescueSection';
import { HubCoCreatorEditor } from './HubCoCreatorEditor';
import { HubCommandsTab } from './HubCommandsTab';
import { HubEnvFilesTab } from './HubEnvFilesTab';
import { HubGovernanceTab } from './HubGovernanceTab';
import { HubLeaderboardTab } from './HubLeaderboardTab';
import { HubProviderProfilesTab } from './HubProviderProfilesTab';
import { HubRoutingPolicyTab } from './HubRoutingPolicyTab';
import { HubSkillsTab } from './HubSkillsTab';
import { PushSettingsPanel } from './PushSettingsPanel';
import { VoiceSettingsPanel } from './VoiceSettingsPanel';

export type { HubTabId } from './cat-cafe-hub.navigation';
export { findGroupForTab, resolveRequestedHubTab } from './cat-cafe-hub.navigation';

/* ─── Main Hub modal ─── */
export function CatCafeHub() {
  const hubState = useChatStore((s) => s.hubState);
  const closeHub = useChatStore((s) => s.closeHub);
  const { cats, getCatById, refresh } = useCatData();
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';

  const open = hubState?.open ?? false;
  const rawRequestedTab = hubState?.tab as HubTabId | undefined;
  const normalizedRequestedTab = rawRequestedTab ? resolveRequestedHubTab(rawRequestedTab, getCatById) : undefined;

  const [tab, setTab] = useState<HubTabId>('cats');
  const [expandedGroup, setExpandedGroup] = useState<string | null>('cats');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [capTabEverOpened, setCapTabEverOpened] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [coCreatorEditorOpen, setCoCreatorEditorOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<(typeof cats)[number] | null>(null);
  const [createDraft, setCreateDraft] = useState<Parameters<typeof HubCatEditor>[0]['draft']>(null);
  const [togglingCatId, setTogglingCatId] = useState<string | null>(null);

  // P1 fix: Render-time state sync (React 18 "adjusting state on props change" pattern).
  // Avoids first-frame flash that useEffect would cause on deep-link opens.
  const [lastSyncKey, setLastSyncKey] = useState('');
  const syncKey = open ? `open:${normalizedRequestedTab ?? ''}` : 'closed';
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    if (open) {
      if (!normalizedRequestedTab) {
        setExpandedGroup('cats');
        setTab('cats');
      } else {
        const group = findGroupForTab(normalizedRequestedTab);
        setExpandedGroup(group?.id ?? 'cats');
        setTab(group ? normalizedRequestedTab : 'cats');
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    const isValid = ALL_TABS.some((t) => t.id === tab);
    if (!isValid) setTab('cats');
  }, [open, tab]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  }, []);

  const selectTab = useCallback((tabId: HubTabId) => {
    setTab(tabId);
  }, []);

  const openAddMember = useCallback(() => {
    setEditingCat(null);
    setCreateDraft(null);
    setEditorOpen(true);
  }, []);

  const openEditMember = useCallback((cat: (typeof cats)[number]) => {
    setCreateDraft(null);
    setEditingCat(cat);
    setEditorOpen(true);
  }, []);

  const openCoCreatorEditor = useCallback(() => {
    setCoCreatorEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingCat(null);
    setCreateDraft(null);
  }, []);

  const closeCoCreatorEditor = useCallback(() => {
    setCoCreatorEditorOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (tab === 'capabilities') setCapTabEverOpened(true);
  }, [open, tab]);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await apiFetch('/api/config');
      if (res.ok) {
        const d = (await res.json()) as { config: ConfigData };
        setConfig(d.config);
      } else {
        setFetchError('配置加载失败');
      }
    } catch {
      setFetchError('网络错误');
    }
  }, []);

  const handleEditorSaved = useCallback(async () => {
    await Promise.all([fetchData(), refresh()]);
  }, [fetchData, refresh]);

  const handleToggleAvailability = useCallback(
    async (cat: (typeof cats)[number]) => {
      setTogglingCatId(cat.id);
      setFetchError(null);
      try {
        const res = await apiFetch(`/api/cats/${cat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: cat.roster?.available === false }),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
          setFetchError((payload.error as string) ?? `成员状态切换失败 (${res.status})`);
          return;
        }
        await Promise.all([fetchData(), refresh()]);
      } catch {
        setFetchError('成员状态切换失败');
      } finally {
        setTogglingCatId(null);
      }
    },
    [fetchData, refresh],
  );

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal when open — prevents keystrokes leaking to sidebar search
  useEffect(() => {
    if (!open) return;
    const el = modalRef.current;
    if (el) el.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeHub();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, closeHub]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={closeHub}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className={
          isBusinessTheme
            ? 'mx-4 flex h-[85vh] w-full max-w-4xl flex-col rounded-[20px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-page)] shadow-[0_24px_64px_rgba(15,23,42,0.18)] outline-none'
            : 'mx-4 flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl shadow-xl outline-none'
        }
        style={isBusinessTheme ? undefined : { backgroundColor: '#FDF8F3' }}
        onClick={(e) => e.stopPropagation()}
        data-testid="hub-modal-shell"
      >
        {/* Header */}
        <div
          className={
            isBusinessTheme
              ? 'flex items-center justify-between border-b border-[var(--oc-border-default)] px-6 py-4'
              : 'flex items-center justify-between px-5 pt-4 pb-3'
          }
          style={{ flexShrink: 0 }}
        >
          <h2
            className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-title)]' : 'text-base font-bold text-gray-900'}
            data-testid="hub-modal-title"
          >
            {isBusinessTheme ? 'OfficeClaw Hub' : 'Cat Caf&eacute; Hub'}
          </h2>
          <button
            onClick={closeHub}
            className={
              isBusinessTheme
                ? 'flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface)] hover:text-[var(--oc-text-title)]'
                : 'text-lg text-gray-400 hover:text-gray-600'
            }
            title="关闭"
            aria-label="关闭"
          >
            &times;
          </button>
        </div>

        <div
          className={isBusinessTheme ? 'flex-1 space-y-4 overflow-y-auto px-6 py-5' : 'flex-1 overflow-y-auto px-5 pb-4 space-y-3'}
          style={{ minHeight: 0 }}
        >
          {fetchError && (
            <p
              className={
                isBusinessTheme
                  ? 'rounded-[14px] border border-[#F5C2C7] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B42318]'
                  : 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500'
              }
            >
              {fetchError}
            </p>
          )}

          {/* Accordion navigation */}
          <div className="space-y-2">
            {HUB_GROUPS.map((g) => (
              <AccordionSection
                key={g.id}
                group={g}
                expanded={expandedGroup === g.id}
                activeTab={tab}
                onToggle={() => toggleGroup(g.id)}
                onSelectTab={selectTab}
              />
            ))}
          </div>

          {/* Tab content */}
          <div
            className={
              isBusinessTheme
                ? 'rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-4 shadow-none'
                : 'rounded-xl bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.03)]'
            }
          >
            {(tab === 'capabilities' || capTabEverOpened) && (
              <div className={tab === 'capabilities' ? '' : 'hidden'}>
                <HubCapabilityTab />
              </div>
            )}
            {tab === 'cats' &&
              (config ? (
                <CatOverviewTab
                  config={config}
                  cats={cats}
                  onAddMember={openAddMember}
                  onEditCoCreator={openCoCreatorEditor}
                  onEditMember={openEditMember}
                  onToggleAvailability={handleToggleAvailability}
                  togglingCatId={togglingCatId}
                />
              ) : !fetchError ? (
                <p className={isBusinessTheme ? 'text-sm text-[var(--oc-text-secondary)]' : 'text-sm text-gray-400'}>
                  加载中...
                </p>
              ) : null)}
            {tab === 'system' &&
              (config ? (
                <SystemTab config={config} />
              ) : !fetchError ? (
                <p className={isBusinessTheme ? 'text-sm text-[var(--oc-text-secondary)]' : 'text-sm text-gray-400'}>
                  加载中...
                </p>
              ) : null)}
            {tab === 'commands' && <HubCommandsTab />}
            {tab === 'routing' && <HubRoutingPolicyTab />}
            {tab === 'env' && <HubEnvFilesTab />}
            {tab === 'provider-profiles' && <HubProviderProfilesTab />}
            {tab === 'voice' && <VoiceSettingsPanel />}
            {tab === 'notify' && <PushSettingsPanel />}
            {tab === 'governance' && <HubGovernanceTab />}
            {tab === 'health' && <BrakeSettingsPanel />}
            {tab === 'rescue' && <HubClaudeRescueSection />}
            {tab === 'leaderboard' && <HubLeaderboardTab />}
            {tab === 'skills' && <HubSkillsTab />}
          </div>
        </div>
        <HubCatEditor
          open={editorOpen}
          cat={editingCat}
          configCat={editingCat ? config?.cats[editingCat.id] : undefined}
          draft={createDraft}
          onClose={closeEditor}
          onSaved={handleEditorSaved}
        />
        <HubCoCreatorEditor
          open={coCreatorEditorOpen}
          coCreator={config?.coCreator}
          onClose={closeCoCreatorEditor}
          onSaved={handleEditorSaved}
        />
      </div>
    </div>
  );
}
