import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from './styles';
import { formatCurrency, formatPercent } from '@/lib/valuation-calculator';
import { RoomBreakdown } from './types';
import { RoomType } from '@/types/property-valuation';

interface PDFAnalysisTableProps {
  roomBreakdowns: RoomBreakdown[];
  sliderValues: Record<RoomType, number>;
  totalUpgradePercent: number;
  totalUpgradeValue: number;
  labels: {
    roomValueAnalysis: string;
    room: string;
    features: string;
    points: string;
    slider: string;
    percentImpact: string;
    euroValue: string;
    total: string;
  };
  roomLabels: Record<string, string>;
}

export function PDFAnalysisTable({
  roomBreakdowns,
  sliderValues,
  totalUpgradePercent,
  totalUpgradeValue,
  labels,
  roomLabels,
}: PDFAnalysisTableProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{labels.roomValueAnalysis}</Text>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '20%' }]}>{labels.room}</Text>
          <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>
            {labels.features}
          </Text>
          <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>
            {labels.points}
          </Text>
          <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>
            {labels.slider}
          </Text>
          <Text style={[styles.tableHeaderCell, { width: '17.5%', textAlign: 'right' }]}>
            {labels.percentImpact}
          </Text>
          <Text style={[styles.tableHeaderCell, { width: '17.5%', textAlign: 'right' }]}>
            {labels.euroValue}
          </Text>
        </View>

        {/* Table Rows */}
        {roomBreakdowns.map((rb) => (
          <View key={rb.room} style={styles.tableRow}>
            <View style={[{ width: '20%', flexDirection: 'row', alignItems: 'center' }]}>
              <View
                style={[
                  styles.roomDot,
                  { backgroundColor: colors.rooms[rb.room] || colors.gray[500] },
                ]}
              />
              <Text style={styles.tableCell}>{roomLabels[rb.room] || rb.room}</Text>
            </View>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
              {rb.selectedFeatureCount} / {rb.totalFeatureCount}
            </Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
              {rb.selectedPoints} / {rb.maxPoints}
            </Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
              {sliderValues[rb.room]}%
            </Text>
            <Text style={[styles.tableCellGreen, { width: '17.5%', textAlign: 'right' }]}>
              +{formatPercent(rb.upgradePercent)}
            </Text>
            <Text style={[styles.tableCellPrimary, { width: '17.5%', textAlign: 'right' }]}>
              +{formatCurrency(rb.upgradeValueEuro)}
            </Text>
          </View>
        ))}

        {/* Total Row */}
        <View style={styles.tableRowTotal}>
          <Text style={[styles.tableCellBold, { width: '65%', color: colors.primary }]}>
            {labels.total}
          </Text>
          <Text style={[styles.tableCellGreen, { width: '17.5%', textAlign: 'right' }]}>
            +{formatPercent(totalUpgradePercent)}
          </Text>
          <Text style={[styles.tableCellPrimary, { width: '17.5%', textAlign: 'right' }]}>
            +{formatCurrency(totalUpgradeValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}
