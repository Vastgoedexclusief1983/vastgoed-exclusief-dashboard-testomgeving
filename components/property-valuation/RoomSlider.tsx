'use client';

import { RoomType, RoomBreakdown } from '@/types/property-valuation';
import { usePropertyValuation } from './PropertyValuationContext';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercent } from '@/lib/valuation-calculator';
import { useTranslations } from 'next-intl';
import {
  ChefHat,
  Bath,
  Sofa,
  TreePine,
  Bed,
  Sparkles,
  Lock,
} from 'lucide-react';

const roomIcons: Record<RoomType, React.ElementType> = {
  Kitchen: ChefHat,
  Bathroom: Bath,
  'Living Room': Sofa,
  Outdoor: TreePine,
  Bedroom: Bed,
  Extras: Sparkles,
};

interface RoomSliderProps {
  room: RoomType;
  breakdown: RoomBreakdown;
}

export function RoomSlider({ room, breakdown }: RoomSliderProps) {
  const { sliderValues, setSliderValue, getMaxSliderValue } = usePropertyValuation();
  const t = useTranslations('valuation.rooms');
  const Icon = roomIcons[room];
  const maxSlider = getMaxSliderValue(room);
  const currentValue = sliderValues[room];
  const isLocked = maxSlider === 0;

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isLocked
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-white border-[#102c54]/10 hover:border-[#102c54]/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-100' : 'bg-[#102c54]/10'}`}>
            <Icon className={`h-4 w-4 ${isLocked ? 'text-gray-400' : 'text-[#102c54]'}`} />
          </div>
          <span className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
            {t(room)}
          </span>
        </div>
        {isLocked ? (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Lock className="h-3 w-3" />
            {t('noFeaturesSelected')}
          </div>
        ) : (
          <div className="text-right">
            <div className="text-lg font-bold text-[#102c54]">{currentValue}%</div>
            <div className="text-xs text-gray-500">{t('ofMax')} {maxSlider}%</div>
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="mb-4">
        <Slider
          value={[currentValue]}
          onValueChange={(value) => setSliderValue(room, value[0])}
          max={maxSlider || 100}
          step={1}
          disabled={isLocked}
          className={isLocked ? 'opacity-50' : ''}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0%</span>
          <span>{maxSlider}%</span>
        </div>
      </div>

      {/* Stats */}
      {!isLocked && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500 mb-1">{t('valueAdded')}</div>
            <div className="text-sm font-semibold text-green-600">
              +{formatPercent(breakdown.upgradePercent)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">{t('euroValue')}</div>
            <div className="text-sm font-semibold text-[#102c54]">
              +{formatCurrency(breakdown.upgradeValueEuro)}
            </div>
          </div>
        </div>
      )}

      {/* Feature Count */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>{t('features')}: {breakdown.selectedFeatureCount}/{breakdown.totalFeatureCount}</span>
        <span>{t('points')}: {breakdown.selectedPoints}/{breakdown.maxPoints}</span>
      </div>
    </div>
  );
}
