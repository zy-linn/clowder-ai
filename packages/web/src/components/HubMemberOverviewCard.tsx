import type { CatData } from '@/hooks/useCatData';
import { useTheme } from '@/hooks/useTheme';
import type { CatConfig, CoCreatorConfig } from './config-viewer-types';

function safeAvatarSrc(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/avatars/')) return trimmed;
  return null;
}

function humanizeProvider(provider: string) {
  if (provider === 'openai') return 'OpenAI';
  if (provider === 'anthropic') return 'Anthropic';
  if (provider === 'google') return 'Gemini';
  if (provider === 'dare') return 'Dare';
  if (provider === 'opencode') return 'OpenCode';
  if (provider === 'relayclaw') return 'jiuwenClaw';
  if (provider === 'antigravity') return 'Antigravity';
  return provider;
}

function clientRuntimeLabel(cat: CatData, configCat?: CatConfig) {
  if (cat.provider === 'relayclaw') return 'jiuwenClaw';
  const accountRef = (cat.accountRef ?? cat.providerProfileId ?? '').toLowerCase();
  if (accountRef.includes('claude')) return 'Claude';
  if (accountRef.includes('codex')) return 'Codex';
  if (accountRef.includes('gemini')) return 'Gemini';
  if (accountRef.includes('opencode')) return 'OpenCode';
  if (accountRef.includes('dare')) return 'Dare';
  if (cat.provider === 'antigravity') return 'Antigravity';
  if (cat.source === 'runtime' && cat.provider === 'openai') return 'OpenAI-Compatible';
  return humanizeProvider(configCat?.provider ?? cat.provider);
}

function accountSummary(cat: CatData) {
  const accountRef = cat.accountRef?.trim() ?? cat.providerProfileId?.trim() ?? '';
  if (!accountRef) return humanizeProvider(cat.provider);
  if (
    accountRef === 'claude' ||
    accountRef === 'codex' ||
    accountRef === 'gemini' ||
    accountRef === 'dare' ||
    accountRef === 'opencode'
  ) {
    return '内置 OAuth 账号';
  }
  return `API Key · ${accountRef}`;
}

function getMetaSummary(cat: CatData, configCat?: CatConfig) {
  if (cat.provider === 'antigravity') {
    return `Antigravity · ${configCat?.model ?? cat.defaultModel} · CLI Bridge`;
  }

  return `${clientRuntimeLabel(cat, configCat)} · ${configCat?.model ?? cat.defaultModel} · ${accountSummary(cat)}`;
}

function getStatusBadge(cat: CatData) {
  if (cat.roster?.available === false) {
    return {
      enabled: false,
      label: '未启用',
      className: 'bg-slate-100 text-slate-600',
    };
  }
  return {
    enabled: true,
    label: '已启用',
    className: 'bg-[#E8F5E9] text-[#4CAF50]',
  };
}

function formatMentionPreview(patterns: string[], max = 3) {
  const visible = patterns.slice(0, max);
  const rest = patterns.length - visible.length;
  return rest > 0 ? `${visible.join('  ')}  +${rest}` : visible.join('  ');
}

export function HubCoCreatorOverviewCard({ coCreator, onEdit }: { coCreator: CoCreatorConfig; onEdit?: () => void }) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const primary = coCreator.color?.primary ?? '#D4A76A';
  const secondary = coCreator.color?.secondary ?? '#FFF8F0';
  const avatarSrc = safeAvatarSrc(coCreator.avatar);

  return (
    <section
      role={onEdit ? 'button' : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onClick={() => onEdit?.()}
      onKeyDown={(event) => {
        if (!onEdit) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit();
        }
      }}
      className={
        isBusinessTheme
          ? 'rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-5 py-4 shadow-none'
          : 'rounded-[20px] px-[18px] py-[18px] shadow-sm'
      }
      style={isBusinessTheme ? undefined : { backgroundColor: secondary, border: `2px solid ${primary}` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={
              isBusinessTheme
                ? 'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[11px] font-bold text-white'
                : 'flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white'
            }
            style={isBusinessTheme ? undefined : { backgroundColor: primary }}
          >
            {avatarSrc ? (
              // biome-ignore lint/performance/noImgElement: co-creator avatar may be runtime upload URL
              <img src={avatarSrc} alt={`${coCreator.name} avatar`} className="h-full w-full object-cover" />
            ) : (
              'ME'
            )}
          </div>
          <h3 className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-heading)]' : 'text-base font-bold text-[#2D2118]'}>
            {coCreator.name}
          </h3>
        </div>
        <span
          className={
            isBusinessTheme
              ? 'flex items-center gap-1 rounded-full bg-[rgba(244,77,34,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#F44D22]'
              : 'flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[11px] font-semibold text-[#E65100]'
          }
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          Owner
        </span>
      </div>
      <p className={isBusinessTheme ? 'mt-2.5 text-[13px] text-[var(--oc-text-secondary)]' : 'mt-2.5 text-[13px] text-[#8A776B]'}>
        别名: {coCreator.aliases.join(' · ') || '无'} · 只能编辑，不能新增或删除
      </p>
      <p
        className={isBusinessTheme ? 'mt-2 text-[13px] text-[var(--oc-accent-link)]' : 'mt-2 text-[13px]'}
        style={isBusinessTheme ? undefined : { color: primary }}
      >
        {formatMentionPreview(coCreator.mentionPatterns, 2)}
      </p>
    </section>
  );
}

export function HubOverviewToolbar({ onAddMember }: { onAddMember?: () => void }) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  return (
    <div
      className={
        isBusinessTheme
          ? 'flex items-center justify-between gap-3 rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] px-4 py-3'
          : 'flex items-center justify-between gap-3'
      }
    >
      <p className={isBusinessTheme ? 'text-[13px] text-[var(--oc-text-secondary)]' : 'text-[13px] text-[#8F8075]'}>
        全部 · 订阅 · API Key · 未启用
      </p>
      <button
        type="button"
        onClick={onAddMember}
        className={
          isBusinessTheme
            ? 'rounded-[10px] bg-[#171717] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0f172a]'
            : 'rounded-full px-4 py-2 text-sm font-bold text-white'
        }
        style={isBusinessTheme ? undefined : { backgroundColor: '#D49266' }}
        data-testid="agents-panel-primary-action"
      >
        + 添加成员
      </button>
    </div>
  );
}

export function HubMemberOverviewCard({
  cat,
  configCat,
  onEdit,
  onToggleAvailability,
  togglingAvailability = false,
}: {
  cat: CatData;
  configCat?: CatConfig;
  onEdit?: (cat: CatData) => void;
  onToggleAvailability?: (cat: CatData) => void;
  togglingAvailability?: boolean;
}) {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const status = getStatusBadge(cat);
  const title = [cat.breedDisplayName ?? cat.displayName, cat.nickname].filter(Boolean).join(' · ');

  return (
    <section
      role={onEdit ? 'button' : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onClick={() => onEdit?.(cat)}
      onKeyDown={(event) => {
        if (!onEdit) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit(cat);
        }
      }}
      className={
        isBusinessTheme
          ? 'rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-5 py-4 shadow-none transition-colors hover:bg-[var(--oc-bg-surface-soft)]'
          : 'rounded-[20px] px-[18px] py-[18px] shadow-sm transition hover:shadow-md'
      }
      style={
        isBusinessTheme
          ? undefined
          : { backgroundColor: '#FFFDFC', border: `1px solid ${cat.source === 'runtime' ? '#D9C7EA' : '#F1E7DF'}` }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={isBusinessTheme ? 'text-[17px] font-bold text-[var(--oc-text-heading)]' : 'text-[17px] font-bold text-[#2D2118]'}>
              {title}
            </h3>
            {cat.source === 'runtime' ? (
              <span
                className={
                  isBusinessTheme
                    ? 'rounded-full bg-[rgba(141,111,165,0.14)] px-2 py-0.5 text-[11px] font-semibold text-[#8D6FA5]'
                    : 'rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-semibold text-[#9D7BC7]'
                }
              >
                动态创建
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleAvailability?.(cat);
          }}
          disabled={!onToggleAvailability || togglingAvailability}
          aria-pressed={status.enabled}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-default ${
            isBusinessTheme
              ? status.enabled
                ? 'bg-[#ECFDF3] text-[#16A34A]'
                : 'bg-[var(--oc-bg-surface-soft)] text-[var(--oc-text-secondary)]'
              : status.className
          }`}
        >
          {togglingAvailability ? '切换中...' : status.label}
        </button>
      </div>

      <p className={isBusinessTheme ? 'mt-2.5 text-[13px] text-[var(--oc-text-secondary)]' : 'mt-2.5 text-[13px] text-[#8A776B]'}>
        {getMetaSummary(cat, configCat)}
      </p>

      <p className={isBusinessTheme ? 'mt-2 text-[13px] text-[var(--oc-accent-link)]' : 'mt-2 text-[13px] text-[#9D7BC7]'}>
        {formatMentionPreview(cat.mentionPatterns)}
      </p>
    </section>
  );
}
