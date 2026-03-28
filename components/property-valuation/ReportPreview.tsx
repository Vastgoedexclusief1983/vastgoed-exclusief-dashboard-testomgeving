'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePropertyValuation } from './PropertyValuationContext';
import { toast } from 'sonner';
import { getSelectedFeaturesByRoom, formatCurrency, formatPercent } from '@/lib/valuation-calculator';
import { ROOM_TYPES, RoomType } from '@/types/property-valuation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Download,
  Building2,
  MapPin,
  Euro,
  Zap,
  Calendar,
  Maximize,
  BedDouble,
  Bath,
  Car,
  Check,
  TrendingUp,
  ChefHat,
  Sofa,
  TreePine,
  Bed,
  Sparkles,
  User,
  Save,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const roomIcons: Record<string, React.ElementType> = {
  Kitchen: ChefHat,
  Bathroom: Bath,
  'Living Room': Sofa,
  Outdoor: TreePine,
  Bedroom: Bed,
  Extras: Sparkles,
};

const BAR_COLORS: Record<string, string> = {
  Kitchen: '#FF6B35',
  Bathroom: '#4ECDC4',
  'Living Room': '#7B68EE',
  Outdoor: '#2ECC71',
  Bedroom: '#E91E63',
  Extras: '#FFD700',
};

export function ReportPreview() {
  const reportRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    propertyDetails,
    selectedFeatures,
    sliderValues,
    valuation,
    setActiveTab,
    customFeatures,
  } = usePropertyValuation();
  const t = useTranslations('valuation.report');
  const tRooms = useTranslations('valuation.rooms');
  const tCustom = useTranslations('valuation.customFeatures');

  // Agent and company info
  const agentName = session?.user?.firstName && session?.user?.lastName
    ? `${session.user.firstName} ${session.user.lastName}`
    : '';
  const agentCompanyName = session?.user?.companyName || '';
  const systemName = 'Vastgoed Exclusief';

  const selectedFeaturesByRoom = getSelectedFeaturesByRoom(selectedFeatures);

  // Save valuation to database
  const handleSaveValuation = async () => {
    if (!propertyDetails?.propertyId || !valuation) {
      toast.error(t('noPropertySelected'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/properties/${propertyDetails.propertyId}/valuation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalPrice: valuation.finalPrice,
          addedValue: valuation.upgradeValueEuro,
          addedValuePercent: valuation.totalUpgradePercent,
          selectedFeatures,
          customFeatures,
          sliderValues,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success(t('valuationSaved'));
    } catch (error) {
      toast.error(t('valuationSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!propertyDetails || !valuation) return;

    setIsDownloading(true);
    try {
      // Capture charts as images
      const { captureCharts } = await import('./pdf/captureCharts');
      const chartImages = await captureCharts('[data-pdf-section="charts"]');

      const { pdf } = await import('@react-pdf/renderer');
      const { PDFReport } = await import('./pdf/PDFReport');

      const translations = {
        title: t('title'),
        generatedOn: t('generatedOn'),
        propertyCode: t('propertyCode'),
        preparedBy: t('preparedBy'),
        baseAskingPrice: t('baseAskingPrice'),
        addedValue: t('addedValue'),
        finalValuation: t('finalValuation'),
        propertyDetails: t('propertyDetails'),
        address: t('address'),
        propertyType: t('propertyType'),
        location: t('location'),
        basePrice: t('basePrice'),
        energyLabel: t('energyLabel'),
        yearBuilt: t('yearBuilt'),
        livingArea: t('livingArea'),
        plotArea: t('plotArea'),
        bedrooms: t('bedrooms'),
        bathrooms: t('bathrooms'),
        parking: t('parking'),
        available: t('available'),
        notAvailable: t('notAvailable'),
        selectedFeatures: t('selectedFeatures'),
        addedFeatures: tCustom('addedFeatures'),
        weight: t('weight'),
        roomValueAnalysis: t('roomValueAnalysis'),
        room: t('room'),
        features: t('features'),
        points: t('points'),
        slider: t('slider'),
        percentImpact: t('percentImpact'),
        euroValue: t('euroValue'),
        total: t('total'),
        disclaimer: t('disclaimer'),
        rooms: {
          Kitchen: tRooms('Kitchen'),
          Bathroom: tRooms('Bathroom'),
          'Living Room': tRooms('Living Room'),
          Outdoor: tRooms('Outdoor'),
          Bedroom: tRooms('Bedroom'),
          Extras: tRooms('Extras'),
        },
        visualAnalysis: t('visualAnalysis'),
        priceComposition: t('priceComposition'),
        roomImpact: t('roomImpact'),
        basePriceLabel: t('basePriceLabel'),
        addedValueLabel: t('addedValueLabel'),
      };

      const reportData = {
        propertyDetails: {
          propertyId: propertyDetails.propertyId,
          propertyCode: propertyDetails.propertyCode,
          address: propertyDetails.address,
          postalCode: propertyDetails.postalCode,
          cityTown: propertyDetails.cityTown,
          province: propertyDetails.province,
          propertyType: propertyDetails.propertyType,
          location: propertyDetails.location,
          baseAskingPrice: propertyDetails.baseAskingPrice,
          energyLabel: propertyDetails.energyLabel,
          yearBuilt: propertyDetails.yearBuilt,
          livingArea: propertyDetails.livingArea,
          plotArea: propertyDetails.plotArea,
          numberOfBedrooms: propertyDetails.numberOfBedrooms,
          numberOfBathrooms: propertyDetails.numberOfBathrooms,
          parkingSpaces: propertyDetails.parkingSpaces,
        },
        valuation,
        selectedFeaturesCount: selectedFeatures.length,
        selectedFeaturesByRoom,
        customFeatures,
        sliderValues,
        agentName: agentName || undefined,
        agentCompanyName: agentCompanyName || undefined,
        chartImages,
      };

      const blob = await pdf(<PDFReport data={reportData} translations={translations} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = propertyDetails.propertyCode
        ? `${propertyDetails.propertyCode}.pdf`
        : `${propertyDetails.propertyId || 'rapport'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('pdfDownloaded'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t('pdfError'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!propertyDetails || !valuation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('completePreviousSteps')}</p>
        <Button onClick={() => setActiveTab(0)} className="mt-4">
          {t('goToPropertyDetails')}
        </Button>
      </div>
    );
  }

  // Chart data
  const donutData = [
    { name: t('basePriceLabel'), value: valuation.basePrice },
    { name: t('addedValueLabel'), value: valuation.upgradeValueEuro },
  ];

  const barData = valuation.roomBreakdowns
    .filter((rb) => rb.upgradePercent > 0)
    .map((rb) => ({
      room: rb.room,
      percentage: rb.upgradePercent * 100,
      value: rb.upgradeValueEuro,
    }));

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="outline"
          onClick={() => setActiveTab(1)}
          className="border-[#102c54] text-[#102c54] hover:bg-[#102c54]/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToFeatureAnalysis')}
        </Button>

        <div className="flex gap-3">
          {propertyDetails?.propertyId && (
            <Button
              onClick={handleSaveValuation}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('saving') : t('saveValuation')}
            </Button>
          )}
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-[#FF0000] hover:bg-[#FF0000]/90 text-white"
          >
            {isDownloading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? t('downloading') : t('downloadPdf')}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-white rounded-xl shadow-lg overflow-hidden report-container" style={{ maxWidth: '794px', margin: '0 auto' }}>
        {/* Header + Valuation Banner (combined section) */}
        <div data-pdf-section="header-valuation">
          <div className="bg-gradient-to-r from-[#102c54] to-[#1a4175] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
                <p className="text-blue-100">
                  {t('generatedOn')} {new Date().toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-sm mb-1">{t('propertyCode')}</div>
                <div className="text-2xl font-bold">{propertyDetails.propertyCode || propertyDetails.propertyId}</div>
              </div>
            </div>

            {/* Company & Agent Info */}
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <div className="text-xl font-semibold">{systemName}</div>
              {agentName && (
                <div className="flex items-center gap-2 text-blue-100">
                  <User className="h-4 w-4" />
                  <span>{t('preparedBy')}: <span className="font-medium text-white">
                    {agentName}{agentCompanyName ? ` - ${agentCompanyName}` : ''}
                  </span></span>
                </div>
              )}
            </div>
          </div>

          {/* Final Valuation Banner */}
          <div className="bg-gradient-to-r from-[#102c54]/5 to-[#FF0000]/5 p-4 border-b">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-gray-500 mb-1">{t('baseAskingPrice')}</div>
              <div className="text-2xl font-bold text-[#102c54]">
                {formatCurrency(valuation.basePrice)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">{t('addedValue')}</div>
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(valuation.upgradeValueEuro)}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({formatPercent(valuation.totalUpgradePercent)})
                </span>
              </div>
            </div>
            <div className="border-l-2 border-[#FF0000]/20 pl-6">
              <div className="text-sm text-gray-500 mb-1">{t('finalValuation')}</div>
              <div className="text-3xl font-bold text-[#FF0000]">
                {formatCurrency(valuation.finalPrice)}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Property Details */}
        <div data-pdf-section="property-details" className="p-6 border-b">
          <h2 className="text-lg font-bold text-[#102c54] mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('propertyDetails')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {t('address')}
              </div>
              <div className="text-sm font-medium">
                {propertyDetails.address}<br />
                {propertyDetails.postalCode} {propertyDetails.cityTown}<br />
                {propertyDetails.province}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {t('propertyType')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.propertyType}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {t('location')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.location}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Euro className="h-3 w-3" />
                {t('basePrice')}
              </div>
              <div className="text-sm font-medium">{formatCurrency(propertyDetails.baseAskingPrice)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {t('energyLabel')}
              </div>
              <Badge className={`${
                propertyDetails.energyLabel.startsWith('A') ? 'bg-green-100 text-green-700' :
                propertyDetails.energyLabel === 'B' || propertyDetails.energyLabel === 'C' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {propertyDetails.energyLabel}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('yearBuilt')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.yearBuilt}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Maximize className="h-3 w-3" />
                {t('livingArea')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.livingArea} m²</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Maximize className="h-3 w-3" />
                {t('plotArea')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.plotArea} m²</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <BedDouble className="h-3 w-3" />
                {t('bedrooms')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.numberOfBedrooms}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {t('bathrooms')}
              </div>
              <div className="text-sm font-medium">{propertyDetails.numberOfBathrooms}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Car className="h-3 w-3" />
                {t('parking')}
              </div>
              <div className="text-sm font-medium">
                {propertyDetails.parkingSpaces ? t('available') : t('notAvailable')}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Features Header */}
        <div data-pdf-section="features-header" className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-[#102c54] flex items-center gap-2">
            <Check className="h-4 w-4" />
            {t('selectedFeatures')} ({selectedFeatures.length})
          </h2>
        </div>

        {/* Selected Features - Row by Row */}
        {(() => {
          const roomsWithFeatures = ROOM_TYPES.filter(room => selectedFeaturesByRoom[room].length > 0);
          const rows: RoomType[][] = [];
          for (let i = 0; i < roomsWithFeatures.length; i += 3) {
            rows.push(roomsWithFeatures.slice(i, i + 3));
          }
          return rows.map((rowRooms, rowIndex) => (
            <div key={rowIndex} data-pdf-section={`features-row-${rowIndex}`} className="px-6 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rowRooms.map((room) => {
                  const features = selectedFeaturesByRoom[room];
                  const Icon = roomIcons[room];
                  return (
                    <Card key={room} className="border" style={{ borderColor: `${BAR_COLORS[room]}40` }}>
                      <CardHeader className="py-2 px-3" style={{ backgroundColor: `${BAR_COLORS[room]}10` }}>
                        <CardTitle className="text-xs flex items-center gap-1" style={{ color: BAR_COLORS[room] }}>
                          <Icon className="h-3 w-3" />
                          {tRooms(room)}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {features.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <ul className="space-y-0.5">
                          {features.map((f) => (
                            <li key={f.id} className="text-xs text-gray-700 flex items-start gap-1">
                              <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                              {f.name}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ));
        })()}

        {/* Custom Features - Row by Row */}
        {customFeatures.length > 0 && (
          <>
            <div data-pdf-section="custom-features-header" className="px-6 pt-2 pb-2">
              <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {tCustom('addedFeatures')} ({customFeatures.length})
              </h3>
            </div>
            {(() => {
              const rows = [];
              for (let i = 0; i < customFeatures.length; i += 3) {
                rows.push(customFeatures.slice(i, i + 3));
              }
              return rows.map((rowFeatures, rowIndex) => (
                <div key={rowIndex} data-pdf-section={`custom-features-row-${rowIndex}`} className="px-6 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rowFeatures.map((feature) => (
                      <Card key={feature.id} className="border border-amber-200 bg-amber-50">
                        <CardContent className="py-2 px-3">
                          <div className="flex items-start gap-1">
                            <Check className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-gray-800">{feature.name}</span>
                              <div className="text-xs text-amber-600">
                                {tRooms(feature.room)} • {t('weight')}: {feature.weight}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </>
        )}

        {/* Section divider */}
        <div data-pdf-section="features-divider" className="border-b mx-6"></div>

        {/* Slider Values & Room Breakdown */}
        <div data-pdf-section="analysis" className="p-6 border-b">
          <h2 className="text-lg font-bold text-[#102c54] mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('roomValueAnalysis')}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#102c54]">
                  <th className="text-left py-2 px-3 font-semibold text-[#102c54]">{t('room')}</th>
                  <th className="text-center py-2 px-3 font-semibold text-[#102c54]">{t('features')}</th>
                  <th className="text-center py-2 px-3 font-semibold text-[#102c54]">{t('points')}</th>
                  <th className="text-center py-2 px-3 font-semibold text-[#102c54]">{t('slider')}</th>
                  <th className="text-right py-2 px-3 font-semibold text-[#102c54]">{t('percentImpact')}</th>
                  <th className="text-right py-2 px-3 font-semibold text-[#102c54]">{t('euroValue')}</th>
                </tr>
              </thead>
              <tbody>
                {valuation.roomBreakdowns.map((rb) => (
                  <tr key={rb.room} className="border-b">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BAR_COLORS[rb.room] }}
                        />
                        {tRooms(rb.room)}
                      </div>
                    </td>
                    <td className="text-center py-2 px-3">
                      {rb.selectedFeatureCount} / {rb.totalFeatureCount}
                    </td>
                    <td className="text-center py-2 px-3">
                      {rb.selectedPoints} / {rb.maxPoints}
                    </td>
                    <td className="text-center py-2 px-3">{sliderValues[rb.room]}%</td>
                    <td className="text-right py-2 px-3 font-medium text-green-600">
                      +{formatPercent(rb.upgradePercent)}
                    </td>
                    <td className="text-right py-2 px-3 font-medium text-[#102c54]">
                      +{formatCurrency(rb.upgradeValueEuro)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#102c54]/5 font-bold">
                  <td colSpan={4} className="py-2 px-3 text-[#102c54]">{t('total')}</td>
                  <td className="text-right py-2 px-3 text-green-600">
                    +{formatPercent(valuation.totalUpgradePercent)}
                  </td>
                  <td className="text-right py-2 px-3 text-[#102c54]">
                    +{formatCurrency(valuation.upgradeValueEuro)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div data-pdf-section="charts" className="p-6">
          <h2 className="text-lg font-bold text-[#102c54] mb-4">{t('visualAnalysis')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
                {t('priceComposition')}
              </h3>
              <div className="h-[150px] chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#102c54" />
                      <Cell fill="#FF0000" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#102c54]"></div>
                  <span className="text-xs">{t('basePriceLabel')}: {((valuation.basePrice / valuation.finalPrice) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FF0000]"></div>
                  <span className="text-xs">{t('addedValueLabel')}: {((valuation.upgradeValueEuro / valuation.finalPrice) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            {barData.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
                  {t('roomImpact')}
                </h3>
                <div className="h-[180px] chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="room" width={70} tick={{ fontSize: 10 }} />
                      <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                        {barData.map((entry) => (
                          <Cell key={entry.room} fill={BAR_COLORS[entry.room]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div data-pdf-section="footer" className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
          <p>{t('disclaimer')}</p>
          <p className="mt-1 font-medium text-[#102c54]">
            © {new Date().getFullYear()} {systemName}
          </p>
        </div>
      </div>
    </div>
  );
}
