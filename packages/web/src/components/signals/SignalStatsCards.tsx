import type { SignalArticleStats } from '@/utils/signals-api';
import { useTheme } from '@/hooks/useTheme';

interface SignalStatsCardsProps {
  readonly stats: SignalArticleStats | null;
}

interface StatCardProps {
  readonly label: string;
  readonly value: number;
  readonly testId: string;
}

function StatCard({ label, value, testId }: StatCardProps) {
  const { theme } = useTheme();
  const isBusiness = theme === 'business';

  return (
    <div
      data-testid={testId}
      className={
        isBusiness
          ? 'rounded-[16px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-4 py-3 shadow-none'
          : 'rounded-xl border border-cocreator-light bg-white px-4 py-3 shadow-sm'
      }
    >
      <p className={isBusiness ? 'text-xs font-medium text-[var(--oc-text-secondary)]' : 'text-xs font-medium text-gray-500'}>
        {label}
      </p>
      <p className={isBusiness ? 'mt-1 text-2xl font-bold text-[var(--oc-text-title)]' : 'mt-1 text-2xl font-bold text-cafe-black'}>
        {value}
      </p>
    </div>
  );
}

export function SignalStatsCards({ stats }: SignalStatsCardsProps) {
  const todayCount = stats?.todayCount ?? 0;
  const unreadCount = stats?.unreadCount ?? 0;
  const weekCount = stats?.weekCount ?? 0;

  return (
    <section aria-label="Signal statistics" data-testid="signal-stats-shell" className="grid gap-3 sm:grid-cols-3">
      <StatCard label="今日新信号" value={todayCount} testId="signal-stat-card-today" />
      <StatCard label="未读" value={unreadCount} testId="signal-stat-card-unread" />
      <StatCard label="近 7 天" value={weekCount} testId="signal-stat-card-week" />
    </section>
  );
}
