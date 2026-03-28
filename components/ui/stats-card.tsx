import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: ReactNode;
}

const colorClasses = {
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  green: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  red: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  trend,
}: StatsCardProps) {
  const colors = colorClasses[iconColor];

  return (
    <Card className={`border-l-4 ${colors.border} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-1.5 ${colors.iconBg} rounded-lg`}>
          <Icon className={`h-4 w-4 ${colors.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {(description || trend) && (
          <div className="mt-1">
            {trend || <p className="text-xs text-gray-500">{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
