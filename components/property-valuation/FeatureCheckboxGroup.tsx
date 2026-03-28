'use client';

import { Feature, RoomType } from '@/types/property-valuation';
import { usePropertyValuation } from './PropertyValuationContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  ChefHat,
  Bath,
  Sofa,
  TreePine,
  Bed,
  Sparkles,
} from 'lucide-react';

const roomIcons: Record<RoomType, React.ElementType> = {
  Kitchen: ChefHat,
  Bathroom: Bath,
  'Living Room': Sofa,
  Outdoor: TreePine,
  Bedroom: Bed,
  Extras: Sparkles,
};

const roomColors: Record<RoomType, { bg: string; border: string; text: string; badge: string }> = {
  Kitchen: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  Bathroom: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700',
  },
  'Living Room': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
  },
  Outdoor: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
  },
  Bedroom: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-700',
  },
  Extras: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
};

interface FeatureCheckboxGroupProps {
  room: RoomType;
  features: Feature[];
}

export function FeatureCheckboxGroup({ room, features }: FeatureCheckboxGroupProps) {
  const { selectedFeatures, toggleFeature } = usePropertyValuation();
  const t = useTranslations('valuation.rooms');
  const Icon = roomIcons[room];
  const colors = roomColors[room];

  const selectedCount = features.filter((f) => selectedFeatures.includes(f.id)).length;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${colors.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors.text}`} />
          <h3 className={`font-semibold ${colors.text}`}>{t(room)}</h3>
        </div>
        <Badge className={`${colors.badge} border-0`}>
          {selectedCount} / {features.length} {t('selected')}
        </Badge>
      </div>

      {/* Features Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature) => {
          const isSelected = selectedFeatures.includes(feature.id);
          return (
            <div
              key={feature.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all cursor-pointer
                ${isSelected
                  ? 'bg-white shadow-sm border border-[#102c54]/20'
                  : 'hover:bg-white/60'
                }`}
              onClick={() => toggleFeature(feature.id)}
            >
              <Checkbox
                id={feature.id}
                checked={isSelected}
                onCheckedChange={() => toggleFeature(feature.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={feature.id}
                  className="text-sm font-medium text-gray-800 cursor-pointer block"
                >
                  {feature.name}
                </Label>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < feature.weight
                          ? 'bg-[#102c54]'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {t('weight')}: {feature.weight}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
