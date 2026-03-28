import { PropertyValuationTabs } from '@/components/property-valuation/PropertyValuationTabs';
import { Calculator } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Property Valuation Tool',
  description: 'Calculate property values based on features and amenities',
};

export default async function PropertyValuationPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const t = await getTranslations('valuation');
  const params = await searchParams;
  const propertyId = params.propertyId;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#102c54]/10 rounded-lg">
            <Calculator className="h-6 w-6 text-[#102c54]" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#102c54]">
            {t('title')}
          </h1>
        </div>
        <p className="text-gray-600 ml-12">
          {t('subtitle')}
        </p>
      </div>

      {/* Valuation Tool */}
      <PropertyValuationTabs initialPropertyId={propertyId} />
    </div>
  );
}
