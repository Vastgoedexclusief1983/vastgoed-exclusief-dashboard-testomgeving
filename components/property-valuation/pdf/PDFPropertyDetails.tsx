import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from './styles';
import { formatCurrency } from '@/lib/valuation-calculator';
import { PropertyDetails } from './types';

interface PDFPropertyDetailsProps {
  propertyDetails: PropertyDetails;
  labels: {
    propertyDetails: string;
    address: string;
    propertyType: string;
    location: string;
    basePrice: string;
    energyLabel: string;
    yearBuilt: string;
    livingArea: string;
    plotArea: string;
    bedrooms: string;
    bathrooms: string;
    parking: string;
    available: string;
    notAvailable: string;
  };
}

export function PDFPropertyDetails({ propertyDetails, labels }: PDFPropertyDetailsProps) {
  const getEnergyBadgeStyle = (label: string) => {
    if (label.startsWith('A')) {
      return { backgroundColor: '#dcfce7', color: '#15803d' };
    }
    if (label === 'B' || label === 'C') {
      return { backgroundColor: '#fef9c3', color: '#a16207' };
    }
    return { backgroundColor: '#fee2e2', color: '#dc2626' };
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{labels.propertyDetails}</Text>

      <View style={styles.propertyGrid}>
        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.address}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.address}</Text>
          <Text style={styles.propertyValue}>
            {propertyDetails.postalCode} {propertyDetails.cityTown}
          </Text>
          <Text style={styles.propertyValue}>{propertyDetails.province}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.propertyType}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.propertyType}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.location}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.location}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.basePrice}</Text>
          <Text style={styles.propertyValue}>
            {formatCurrency(propertyDetails.baseAskingPrice)}
          </Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.energyLabel}</Text>
          <Text
            style={[
              styles.energyBadge,
              getEnergyBadgeStyle(propertyDetails.energyLabel),
            ]}
          >
            {propertyDetails.energyLabel}
          </Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.yearBuilt}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.yearBuilt}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.livingArea}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.livingArea} m²</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.plotArea}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.plotArea} m²</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.bedrooms}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.numberOfBedrooms}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.bathrooms}</Text>
          <Text style={styles.propertyValue}>{propertyDetails.numberOfBathrooms}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text style={styles.propertyLabel}>{labels.parking}</Text>
          <Text style={styles.propertyValue}>
            {propertyDetails.parkingSpaces ? labels.available : labels.notAvailable}
          </Text>
        </View>
      </View>
    </View>
  );
}
