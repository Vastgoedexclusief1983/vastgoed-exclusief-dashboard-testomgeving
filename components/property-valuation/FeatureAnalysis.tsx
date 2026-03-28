'use client';

import { usePropertyValuation } from './PropertyValuationContext';
import { FeatureCheckboxGroup } from './FeatureCheckboxGroup';
import { CustomFeatureInput } from './CustomFeatureInput';
import { RoomSlider } from './RoomSlider';
import { ValuationCharts } from './ValuationCharts';
import { getFeaturesByRoom } from '@/lib/property-features';
import { formatCurrency, formatPercent } from '@/lib/valuation-calculator';
import { ROOM_TYPES } from '@/types/property-valuation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  TrendingUp,
  Calculator,
  Euro,
  Percent,
} from 'lucide-react';

export function FeatureAnalysis() {
  const {
    propertyDetails,
    selectedFeatures,
    clearFeatures,
    valuation,
    setActiveTab,
    canProceedToTab3,
  } = usePropertyValuation();
  const t = useTranslations('valuation.featureAnalysis');

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-[#102c54] to-[#1a4175] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{t('title')}</h2>
            <p className="text-blue-100 text-sm">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {valuation && (
              <>
                <div className="text-center">
                  <div className="text-blue-200 text-xs mb-1">{t('basePrice')}</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(valuation.basePrice)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-blue-200 text-xs mb-1">{t('addedValue')}</div>
                  <div className="text-lg font-bold text-green-300">
                    +{formatPercent(valuation.totalUpgradePercent)}
                  </div>
                </div>
                <div className="text-center border-l border-white/20 pl-6">
                  <div className="text-blue-200 text-xs mb-1">{t('finalPrice')}</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(valuation.finalPrice)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#102c54]">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#102c54]/10 rounded-lg">
                <Calculator className="h-4 w-4 text-[#102c54]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('selectedFeatures')}</div>
                <div className="text-xl font-bold text-[#102c54]">
                  {selectedFeatures.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('valueIncrease')}</div>
                <div className="text-xl font-bold text-green-600">
                  {valuation ? formatPercent(valuation.totalUpgradePercent) : '0%'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF0000]">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Euro className="h-4 w-4 text-[#FF0000]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('addedValue')}</div>
                <div className="text-xl font-bold text-[#FF0000]">
                  {valuation ? formatCurrency(valuation.upgradeValueEuro) : '€0'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Percent className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('maxPotential')}</div>
                <div className="text-xl font-bold text-purple-600">36%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#102c54]">{t('selectPropertyFeatures')}</h3>
          {selectedFeatures.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFeatures}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('clearAll')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ROOM_TYPES.map((room) => (
            <FeatureCheckboxGroup
              key={room}
              room={room}
              features={getFeaturesByRoom(room)}
            />
          ))}
        </div>

        {/* Custom Feature Input */}
        <div className="mt-6">
          <CustomFeatureInput />
        </div>
      </div>

      {/* Sliders Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#102c54] mb-4">
          {t('adjustRoomValueImpact')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('sliderDescription')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valuation?.roomBreakdowns.map((breakdown) => (
            <RoomSlider key={breakdown.room} room={breakdown.room} breakdown={breakdown} />
          ))}
        </div>
      </div>

      {/* Charts */}
      {valuation && valuation.upgradeValueEuro > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#102c54] mb-4">
            {t('valuationAnalysis')}
          </h3>
          <ValuationCharts valuation={valuation} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setActiveTab(0)}
          className="border-[#102c54] text-[#102c54] hover:bg-[#102c54]/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToPropertyDetails')}
        </Button>

        <Button
          onClick={() => setActiveTab(2)}
          disabled={!canProceedToTab3}
          className="bg-[#102c54] hover:bg-[#102c54]/90 text-white"
        >
          {t('continueToReport')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
