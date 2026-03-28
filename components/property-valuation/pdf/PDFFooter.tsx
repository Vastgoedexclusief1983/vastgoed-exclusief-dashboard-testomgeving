import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

interface PDFFooterProps {
  disclaimer: string;
  systemName: string;
}

export function PDFFooter({ disclaimer, systemName }: PDFFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{disclaimer}</Text>
      <Text style={styles.footerCopyright}>
        © {currentYear} {systemName}
      </Text>
    </View>
  );
}
