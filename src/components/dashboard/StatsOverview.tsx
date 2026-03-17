import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

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
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Card>
  );
}

export function StatsOverview({
  averageChars,
  totalLast7Days,
  projectCount,
}: StatsOverviewProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
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
    </Box>
  );
}
