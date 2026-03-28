import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import { formatCurrency, formatPercent } from '@/lib/valuation-calculator';

interface PDFValuationBannerProps {
  basePrice: number;
  addedValue: number;
  addedValuePercent: number;
  finalPrice: number;
  labels: {
    baseAskingPrice: string;
    addedValue: string;
    finalValuation: string;
  };
}

export function PDFValuationBanner({
  basePrice,
  addedValue,
  addedValuePercent,
  finalPrice,
  labels,
}: PDFValuationBannerProps) {
  return (
    <View style={styles.valuationBanner}>
      <View style={styles.valuationItem}>
        <Text style={styles.valuationLabel}>{labels.baseAskingPrice}</Text>
        <Text style={styles.valuationValue}>{formatCurrency(basePrice)}</Text>
      </View>
      <View style={styles.valuationItem}>
        <Text style={styles.valuationLabel}>{labels.addedValue}</Text>
        <Text style={styles.valuationValueGreen}>
          +{formatCurrency(addedValue)}
          <Text style={styles.valuationPercent}>
            {' '}({formatPercent(addedValuePercent)})
          </Text>
        </Text>
      </View>
      <View style={styles.valuationItemLast}>
        <Text style={styles.valuationLabel}>{labels.finalValuation}</Text>
        <Text style={styles.valuationValueAccent}>{formatCurrency(finalPrice)}</Text>
      </View>
    </View>
  );
}
