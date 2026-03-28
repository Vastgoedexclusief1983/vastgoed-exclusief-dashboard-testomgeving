'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, PieChart as PieChartIcon, TrendingUp, Coins, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface ProvinceData {
  province: string;
  count: number;
  [key: string]: string | number;
}

interface PropertyTypeData {
  type: string;
  count: number;
  [key: string]: string | number;
}

interface MonthlyData {
  month: string;
  properties: number;
  [key: string]: string | number;
}

interface PriceRangeData {
  range: string;
  count: number;
  [key: string]: string | number;
}

interface EnergyLabelData {
  label: string;
  count: number;
  [key: string]: string | number;
}

interface AdminAnalyticsProps {
  provinceData: ProvinceData[];
  propertyTypeData: PropertyTypeData[];
  monthlyData: MonthlyData[];
  priceRangeData: PriceRangeData[];
  energyLabelData: EnergyLabelData[];
  totalValue: number;
  avgPrice: number;
}

const PIE_COLORS = ['#102c54', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 shadow-lg rounded-xl border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-[#102c54] font-bold mt-1">{payload[0].value} properties</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 shadow-lg rounded-xl border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-[#102c54] font-bold mt-1">{payload[0].value} properties</p>
      </div>
    );
  }
  return null;
};

export function AdminAnalytics({
  provinceData,
  propertyTypeData,
  monthlyData,
  priceRangeData,
  energyLabelData,
}: AdminAnalyticsProps) {
  const totalProperties = propertyTypeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Properties by Province */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Properties by Province</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Geographic distribution</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={provinceData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="province"
                    type="category"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#102c54" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                <div className="text-center">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties by Type */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChartIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Properties by Type</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Portfolio composition</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {propertyTypeData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="type"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {propertyTypeData.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                        <span className="text-xs text-gray-400">
                          ({totalProperties > 0 ? Math.round((item.count / totalProperties) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                <div className="text-center">
                  <PieChartIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Monthly Trend</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Properties added over time</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#102c54" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#102c54" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="properties"
                    stroke="#102c54"
                    strokeWidth={3}
                    fill="url(#colorProperties)"
                    dot={{ fill: '#102c54', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FF0000', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Range Distribution */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Coins className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Price Distribution</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Properties by price range</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {priceRangeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priceRangeData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={35}>
                    {priceRangeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < priceRangeData.length / 2 ? '#102c54' : '#1e4d8c'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                <div className="text-center">
                  <Coins className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Energy Labels - Full Width */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Energy Label Distribution</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Sustainability overview of properties</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {energyLabelData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={energyLabelData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={45}>
                    {energyLabelData.map((entry) => {
                      const greenLabels = ['A+++', 'A++', 'A+', 'A'];
                      const yellowLabels = ['B', 'C'];
                      let color = '#ef4444'; // Red for D, E, F, G
                      if (greenLabels.includes(entry.label)) {
                        color = '#22c55e'; // Green
                      } else if (yellowLabels.includes(entry.label)) {
                        color = '#eab308'; // Yellow
                      }
                      return <Cell key={entry.label} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-600">Excellent (A+++ to A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-gray-600">Good (B, C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600">Needs Improvement (D to G)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              <div className="text-center">
                <Zap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
