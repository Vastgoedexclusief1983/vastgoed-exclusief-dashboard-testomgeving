'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface Props {
  min: number;
  median: number;
  max: number;
  average: number;
}

export function ReferenceCharts({ min, median, max, average }: Props) {
  const barData = [
    { name: 'Min €/m²', value: min },
    { name: 'Mediaan €/m²', value: median },
    { name: 'Gemiddeld €/m²', value: average },
    { name: 'Max €/m²', value: max },
  ];

  const lineData = [
    { step: 'Min', value: min },
    { step: 'Mediaan', value: median },
    { step: 'Gemiddeld', value: average },
    { step: 'Max', value: max },
  ];

  return (
    <div className="space-y-10">
      
      {/* BAR CHART */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">
          €/m² Vergelijking
        </h3>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">
          Prijsspreiding Indicatie
        </h3>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
