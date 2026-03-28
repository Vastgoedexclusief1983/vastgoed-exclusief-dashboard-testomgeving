import { Document, Page } from '@react-pdf/renderer';
import { styles } from './styles';
import { PDFHeader } from './PDFHeader';
import { PDFValuationBanner } from './PDFValuationBanner';
import { PDFPropertyDetails } from './PDFPropertyDetails';
import { PDFFeatures } from './PDFFeatures';
import { PDFAnalysisTable } from './PDFAnalysisTable';
import { PDFCharts } from './PDFCharts';
import { PDFFooter } from './PDFFooter';
import { PDFReportData, PDFTranslations } from './types';

interface PDFReportProps {
  data: PDFReportData;
  translations: PDFTranslations;
}

const SYSTEM_NAME = 'Vastgoed Exclusief';

export function PDFReport({ data, translations }: PDFReportProps) {
  const {
    propertyDetails,
    valuation,
    selectedFeaturesCount,
    selectedFeaturesByRoom,
    customFeatures,
    sliderValues,
    agentName,
    agentCompanyName,
    chartImages,
  } = data;

  const generatedDate = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      {/* Page 1: Property Details */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title={translations.title}
          generatedOn={translations.generatedOn}
          propertyCodeLabel={translations.propertyCode}
          propertyCode={propertyDetails.propertyCode || propertyDetails.propertyId || ''}
          preparedByLabel={translations.preparedBy}
          systemName={SYSTEM_NAME}
          agentName={agentName}
          agentCompanyName={agentCompanyName}
          generatedDate={generatedDate}
        />

        <PDFValuationBanner
          basePrice={valuation.basePrice}
          addedValue={valuation.upgradeValueEuro}
          addedValuePercent={valuation.totalUpgradePercent}
          finalPrice={valuation.finalPrice}
          labels={{
            baseAskingPrice: translations.baseAskingPrice,
            addedValue: translations.addedValue,
            finalValuation: translations.finalValuation,
          }}
        />

        <PDFPropertyDetails
          propertyDetails={propertyDetails}
          labels={{
            propertyDetails: translations.propertyDetails,
            address: translations.address,
            propertyType: translations.propertyType,
            location: translations.location,
            basePrice: translations.basePrice,
            energyLabel: translations.energyLabel,
            yearBuilt: translations.yearBuilt,
            livingArea: translations.livingArea,
            plotArea: translations.plotArea,
            bedrooms: translations.bedrooms,
            bathrooms: translations.bathrooms,
            parking: translations.parking,
            available: translations.available,
            notAvailable: translations.notAvailable,
          }}
        />

        <PDFFooter
          disclaimer={translations.disclaimer}
          systemName={SYSTEM_NAME}
        />
      </Page>

      {/* Page 2: Features & Analysis */}
      <Page size="A4" style={styles.page}>
        <PDFFeatures
          selectedFeaturesCount={selectedFeaturesCount}
          selectedFeaturesByRoom={selectedFeaturesByRoom}
          customFeatures={customFeatures}
          labels={{
            selectedFeatures: translations.selectedFeatures,
            addedFeatures: translations.addedFeatures,
            weight: translations.weight,
          }}
          roomLabels={translations.rooms}
        />

        <PDFAnalysisTable
          roomBreakdowns={valuation.roomBreakdowns}
          sliderValues={sliderValues}
          totalUpgradePercent={valuation.totalUpgradePercent}
          totalUpgradeValue={valuation.upgradeValueEuro}
          labels={{
            roomValueAnalysis: translations.roomValueAnalysis,
            room: translations.room,
            features: translations.features,
            points: translations.points,
            slider: translations.slider,
            percentImpact: translations.percentImpact,
            euroValue: translations.euroValue,
            total: translations.total,
          }}
          roomLabels={translations.rooms}
        />

        <PDFFooter
          disclaimer={translations.disclaimer}
          systemName={SYSTEM_NAME}
        />
      </Page>

      {/* Page 3: Charts */}
      {chartImages && (chartImages.pieChart || chartImages.barChart) && (
        <Page size="A4" style={styles.page}>
          <PDFCharts
            chartImages={chartImages}
            labels={{
              visualAnalysis: translations.visualAnalysis || 'Visual Analysis',
              priceComposition: translations.priceComposition || 'Price Composition',
              roomImpact: translations.roomImpact || 'Room Impact',
              basePriceLabel: translations.basePriceLabel || 'Base Price',
              addedValueLabel: translations.addedValueLabel || 'Added Value',
            }}
            basePrice={valuation.basePrice}
            finalPrice={valuation.finalPrice}
            addedValue={valuation.upgradeValueEuro}
          />

          <PDFFooter
            disclaimer={translations.disclaimer}
            systemName={SYSTEM_NAME}
          />
        </Page>
      )}
    </Document>
  );
}
