interface StatsOverviewProps {
  averageChars: number;
  totalLast7Days: number;
  projectCount: number;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
      <div className="text-[var(--text-tertiary)] text-xs mb-1">{label}</div>
      <div className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">
        {value}
      </div>
      {sub && (
        <div className="text-[var(--text-tertiary)] text-xs mt-0.5">{sub}</div>
      )}
    </div>
  );
}

export function StatsOverview({
  averageChars,
  totalLast7Days,
  projectCount,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="直近30日 平均執筆量"
        value={`${averageChars.toLocaleString()}字`}
        sub="1日あたり"
      />
      <StatCard
        label="直近7日間 合計"
        value={`${totalLast7Days.toLocaleString()}字`}
        sub="過去7日間"
      />
      <StatCard
        label="プロジェクト数"
        value={`${projectCount}`}
        sub="作成済み"
      />
    </div>
  );
}
