'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    label: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  href?: string;
}

export function StatsCard({ title, value, trend, icon: Icon, href }: StatsCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{value}</h3>
            {trend && (
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {trend.value}
                </div>
                <span className="text-sm text-gray-500">{trend.label}</span>
                {href && (
                  <Link href={href} className="ml-auto flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-brand-700">
                    Show more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
