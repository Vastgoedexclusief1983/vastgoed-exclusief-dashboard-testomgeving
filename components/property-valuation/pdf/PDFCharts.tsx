import { View, Text, Image } from '@react-pdf/renderer';
import { styles, colors } from './styles';
import { ChartImages } from './types';

interface PDFChartsProps {
  chartImages: ChartImages;
  labels: {
    visualAnalysis: string;
    priceComposition: string;
    roomImpact: string;
    basePriceLabel: string;
    addedValueLabel: string;
  };
  basePrice: number;
  finalPrice: number;
  addedValue: number;
}

export function PDFCharts({ chartImages, labels, basePrice, finalPrice, addedValue }: PDFChartsProps) {
  const hasPieChart = !!chartImages.pieChart;
  const hasBarChart = !!chartImages.barChart;

  if (!hasPieChart && !hasBarChart) {
    return null;
  }

  const basePricePercent = ((basePrice / finalPrice) * 100).toFixed(1);
  const addedValuePercent = ((addedValue / finalPrice) * 100).toFixed(1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{labels.visualAnalysis}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', marginTop: 20 }}>
        {hasPieChart && (
          <View style={{ alignItems: 'center', width: '45%' }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.gray[700], marginBottom: 12, textAlign: 'center' }}>
              {labels.priceComposition}
            </Text>
            <Image
              src={chartImages.pieChart!}
              style={{ maxWidth: 200, maxHeight: 180, objectFit: 'contain' }}
            />
            {/* Legend with percentages */}
            <View style={{ marginTop: 12, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                <Text style={{ fontSize: 9, color: colors.gray[700] }}>
                  {labels.basePriceLabel}: {basePricePercent}%
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />
                <Text style={{ fontSize: 9, color: colors.gray[700] }}>
                  {labels.addedValueLabel}: {addedValuePercent}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {hasBarChart && (
          <View style={{ alignItems: 'center', width: '45%' }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.gray[700], marginBottom: 12, textAlign: 'center' }}>
              {labels.roomImpact}
            </Text>
            <Image
              src={chartImages.barChart!}
              style={{ maxWidth: 240, maxHeight: 200, objectFit: 'contain' }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
