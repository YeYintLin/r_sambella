/**
 * Production Trend Chart Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Stacked bar chart showing units produced per scent
 * - Last 7 days data
 * - Green color palette matching design
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProductionTrendData } from '@/lib/mockData';

interface ProductionTrendChartProps {
  data: ProductionTrendData[];
}

export default function ProductionTrendChart({
  data,
}: ProductionTrendChartProps) {
  return (
    <div className="card-gradient rounded-lg p-6 border border-sage-green/20 h-full">
      <h2 className="display-text text-lg text-charcoal mb-6">
        Production Trend (Last 7 Days)
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E8F0EB"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#8B7355"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#8B7355" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAFAF8',
              border: '1px solid #E8F0EB',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(27, 94, 63, 0.08)',
            }}
            labelStyle={{ color: '#2C2C2C' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar
            dataKey="lemongrass"
            stackId="a"
            fill="#1B5E3F"
            name="Lemongrass"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="gingerFlower"
            stackId="a"
            fill="#4A9B6F"
            name="Ginger Flower"
          />
          <Bar
            dataKey="sandalwood"
            stackId="a"
            fill="#7DB899"
            name="Sandalwood"
          />
          <Bar
            dataKey="lavender"
            stackId="a"
            fill="#A8D5BA"
            name="Lavender"
          />
          <Bar
            dataKey="tropical"
            stackId="a"
            fill="#D4E8DB"
            name="Tropical"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
