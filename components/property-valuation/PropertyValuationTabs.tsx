'use client';

import { PropertyValuationProvider, usePropertyValuation } from './PropertyValuationContext';
import { BasicDetailsForm } from './BasicDetailsForm';
import { FeatureAnalysis } from './FeatureAnalysis';
import { ReportPreview } from './ReportPreview';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Sliders,
  FileText,
  Check,
  ChevronRight,
} from 'lucide-react';

const tabConfig = [
  { id: 0, labelKey: 'tabs.propertyDetails', icon: Building2 },
  { id: 1, labelKey: 'tabs.featureAnalysis', icon: Sliders },
  { id: 2, labelKey: 'tabs.report', icon: FileText },
];

function TabNavigation() {
  const { activeTab, setActiveTab, canProceedToTab2, canProceedToTab3 } = usePropertyValuation();
  const t = useTranslations('valuation');

  const canAccessTab = (tabId: number) => {
    if (tabId === 0) return true;
    if (tabId === 1) return canProceedToTab2;
    if (tabId === 2) return canProceedToTab3;
    return false;
  };

  const isTabCompleted = (tabId: number) => {
    if (tabId === 0) return canProceedToTab2;
    if (tabId === 1) return canProceedToTab3;
    return false;
  };

  return (
    <div className="mb-8">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-center gap-2">
        {tabConfig.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCompleted = isTabCompleted(tab.id);
          const canAccess = canAccessTab(tab.id);

          return (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => canAccess && setActiveTab(tab.id)}
                disabled={!canAccess}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-[#102c54] text-white shadow-lg'
                    : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : canAccess
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    isActive
                      ? 'bg-white/20'
                      : isCompleted
                      ? 'bg-green-200'
                      : 'bg-gray-200'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="font-medium">{t(tab.labelKey)}</span>
              </button>
              {index < tabConfig.length - 1 && (
                <ChevronRight className="h-5 w-5 mx-2 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const canAccess = canAccessTab(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => canAccess && setActiveTab(tab.id)}
                disabled={!canAccess}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-[#102c54] text-white'
                    : canAccess
                    ? 'text-gray-600'
                    : 'text-gray-400 cursor-not-allowed'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#102c54] transition-all duration-300"
          style={{ width: `${((activeTab + 1) / tabConfig.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function TabContent() {
  const { activeTab } = usePropertyValuation();

  return (
    <div>
      {activeTab === 0 && <BasicDetailsForm />}
      {activeTab === 1 && <FeatureAnalysis />}
      {activeTab === 2 && <ReportPreview />}
    </div>
  );
}

interface PropertyValuationTabsProps {
  initialPropertyId?: string;
}

export function PropertyValuationTabs({ initialPropertyId }: PropertyValuationTabsProps) {
  return (
    <PropertyValuationProvider initialPropertyId={initialPropertyId}>
      <div className="">
        <TabNavigation />
        <TabContent />
      </div>
    </PropertyValuationProvider>
  );
}
