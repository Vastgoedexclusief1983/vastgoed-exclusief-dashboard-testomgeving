'use client';

import { ValuationResult } from '@/types/property-valuation';
import { formatCurrency, formatPercent } from '@/lib/valuation-calculator';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ValuationChartsProps {
  valuation: ValuationResult;
}

const DONUT_COLORS = ['#102c54', '#FF0000'];
const BAR_COLORS = {
  Kitchen: '#FF6B35',
  Bathroom: '#4ECDC4',
  'Living Room': '#7B68EE',
  Outdoor: '#2ECC71',
  Bedroom: '#E91E63',
  Extras: '#FFD700',
};

export function ValuationCharts({ valuation }: ValuationChartsProps) {
  // Donut chart data
  const donutData = [
    { name: 'Base Price', value: valuation.basePrice },
    { name: 'Added Value', value: valuation.upgradeValueEuro },
  ];

  // Bar chart data - room breakdown
  const barData = valuation.roomBreakdowns
    .filter((rb) => rb.upgradePercent > 0)
    .map((rb) => ({
      room: rb.room.replace(' ', '\n'),
      roomFull: rb.room,
      percentage: rb.upgradePercent * 100,
      value: rb.upgradeValueEuro,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].payload.roomFull || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Percentage'
                ? `${entry.value.toFixed(2)}%`
                : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const DonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart - Price Breakdown */}
      <Card className="border-2 border-[#102c54]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#102c54]">Price Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xs text-gray-500">Final Price</div>
                <div className="text-lg font-bold text-[#102c54]">
                  {formatCurrency(valuation.finalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Legend details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-2 bg-[#102c54]/5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#102c54]" />
                <span className="text-sm text-gray-700">Base Price</span>
              </div>
              <span className="font-semibold text-[#102c54]">
                {formatCurrency(valuation.basePrice)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
                <span className="text-sm text-gray-700">Added Value</span>
              </div>
              <span className="font-semibold text-[#FF0000]">
                +{formatCurrency(valuation.upgradeValueEuro)} ({formatPercent(valuation.totalUpgradePercent)})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Room Breakdown */}
      <Card className="border-2 border-[#102c54]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#102c54]">Room Impact Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                  <YAxis
                    type="category"
                    dataKey="roomFull"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="percentage"
                    name="Percentage"
                    radius={[0, 4, 4, 0]}
                  >
                    {barData.map((entry) => (
                      <Cell
                        key={entry.roomFull}
                        fill={BAR_COLORS[entry.roomFull as keyof typeof BAR_COLORS]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Select features and adjust sliders to see room impact</p>
            </div>
          )}

          {/* Room value breakdown */}
          {barData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {valuation.roomBreakdowns
                .filter((rb) => rb.upgradeValueEuro > 0)
                .map((rb) => (
                  <div
                    key={rb.room}
                    className="flex items-center justify-between p-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: `${BAR_COLORS[rb.room as keyof typeof BAR_COLORS]}15`
                    }}
                  >
                    <span className="text-gray-700">{rb.room}</span>
                    <span
                      className="font-semibold"
                      style={{ color: BAR_COLORS[rb.room as keyof typeof BAR_COLORS] }}
                    >
                      +{formatCurrency(rb.upgradeValueEuro)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
