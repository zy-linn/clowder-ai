'use client';

import type { BacklogItem } from '@cat-cafe/shared';
import { useTheme } from '@/hooks/useTheme';

interface MissionControlCardProps {
  item: BacklogItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

const PRIORITY_CLASS: Record<BacklogItem['priority'], string> = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-orange-100 text-orange-700',
  p2: 'bg-amber-100 text-amber-700',
  p3: 'bg-slate-200 text-slate-600',
};

export function MissionControlCard({ item, selected, onSelect }: MissionControlCardProps) {
  const { theme } = useTheme();
  const isBusiness = theme === 'business';

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      data-testid="mission-control-card"
      className={[
        'w-full border p-3 text-left transition-all',
        isBusiness ? 'rounded-[16px]' : 'rounded-xl',
        isBusiness
          ? selected
            ? 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] shadow-none'
            : 'border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] hover:bg-[var(--oc-bg-surface)]'
          : selected
            ? 'border-[#5F4B37] bg-[#FFF7EA] shadow-sm'
            : 'border-[#EADFCF] bg-[#FFFDF8] hover:border-[#CAB396] hover:bg-[#FFF8EE]',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={isBusiness ? 'text-xs font-semibold text-[var(--oc-text-heading)]' : 'text-xs font-semibold text-[#5C4B39]'}>
          {item.title}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CLASS[item.priority]}`}>
          {item.priority.toUpperCase()}
        </span>
      </div>
      <p
        className={
          isBusiness
            ? 'line-clamp-2 text-[11px] leading-relaxed text-[var(--oc-text-secondary)]'
            : 'line-clamp-2 text-[11px] leading-relaxed text-[#715F4C]'
        }
      >
        {item.summary}
      </p>
      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={
                isBusiness
                  ? 'rounded-full bg-[var(--oc-bg-surface-muted)] px-1.5 py-0.5 text-[10px] text-[var(--oc-text-secondary)]'
                  : 'rounded bg-[#EFE7DC] px-1.5 py-0.5 text-[10px] text-[#6B5946]'
              }
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {item.suggestion && (
        <p className={isBusiness ? 'mt-2 text-[10px] text-[var(--oc-text-muted)]' : 'mt-2 text-[10px] text-[#8A765F]'}>
          建议领取：@{item.suggestion.catId} · {item.suggestion.requestedPhase}
        </p>
      )}
      {item.dependencies && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {item.dependencies.evolvedFrom?.map((id) => (
            <span
              key={`ef-${id}`}
              className="inline-block rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
            >
              ← {id.toUpperCase()}
            </span>
          ))}
          {item.dependencies.blockedBy?.map((id) => (
            <span
              key={`bb-${id}`}
              className="inline-block rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700"
            >
              ⊘ {id.toUpperCase()}
            </span>
          ))}
          {item.dependencies.related?.map((id) => (
            <span
              key={`rel-${id}`}
              className="inline-block rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
            >
              ↔ {id.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
