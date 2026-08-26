/**
 * Tremor SparkAreaChart (copy-paste model) on Recharts, restyled: stepped line, gradient fill,
 * fixed domain so overlays can be positioned outside the chart. Only used as price_creep's base.
 */
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

export function SparkAreaChart({ data, index, category, color = 'var(--salmon)', min, max, height = 84, delay = '0ms' }: { data: Record<string, number>[]; index: string; category: string; color?: string; min: number; max: number; height?: number; delay?: string }) {
  void index
  return (
    <div style={{ width: '100%', height, animation: `sparkReveal .6s ${delay} both` }}>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient>
        </defs>
        <YAxis hide domain={[min, max]} />
        <Area type="stepAfter" dataKey={category} stroke={color} strokeWidth={2} fill="url(#sparkFill)" isAnimationActive={false} dot={false} activeDot={false} />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  )
}
