import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

interface PDFHeaderProps {
  title: string;
  generatedOn: string;
  propertyCodeLabel: string;
  propertyCode: string;
  preparedByLabel: string;
  systemName: string;
  agentName?: string;
  agentCompanyName?: string;
  generatedDate: string;
}

export function PDFHeader({
  title,
  generatedOn,
  propertyCodeLabel,
  propertyCode,
  preparedByLabel,
  systemName,
  agentName,
  agentCompanyName,
  generatedDate,
}: PDFHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>
            {generatedOn} {generatedDate}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>{propertyCodeLabel}</Text>
          <Text style={styles.headerCode}>{propertyCode}</Text>
        </View>
      </View>

      <View style={styles.headerDivider}>
        <Text style={styles.companyName}>{systemName}</Text>
        {agentName && (
          <Text style={styles.agentInfo}>
            {preparedByLabel}:{' '}
            <Text style={styles.agentName}>
              {agentName}
              {agentCompanyName ? ` - ${agentCompanyName}` : ''}
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
}
