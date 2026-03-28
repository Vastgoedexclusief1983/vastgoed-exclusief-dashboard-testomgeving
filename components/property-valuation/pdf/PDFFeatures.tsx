import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from './styles';
import { Feature, RoomType, CustomFeature } from '@/types/property-valuation';
import { ROOM_TYPES } from '@/types/property-valuation';

interface PDFFeaturesProps {
  selectedFeaturesCount: number;
  selectedFeaturesByRoom: Record<RoomType, Feature[]>;
  customFeatures: CustomFeature[];
  labels: {
    selectedFeatures: string;
    addedFeatures: string;
    weight: string;
  };
  roomLabels: Record<string, string>;
}

export function PDFFeatures({
  selectedFeaturesCount,
  selectedFeaturesByRoom,
  customFeatures,
  labels,
  roomLabels,
}: PDFFeaturesProps) {
  const roomsWithFeatures = ROOM_TYPES.filter(
    (room) => selectedFeaturesByRoom[room].length > 0
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.selectedFeatures} ({selectedFeaturesCount})
      </Text>

      <View style={styles.featuresGrid}>
        {roomsWithFeatures.map((room) => {
          const features = selectedFeaturesByRoom[room];
          const roomColor = colors.rooms[room] || colors.gray[500];

          return (
            <View
              key={room}
              style={[
                styles.featureCard,
                { borderColor: `${roomColor}40` },
              ]}
            >
              <View
                style={[
                  styles.featureCardHeader,
                  { backgroundColor: `${roomColor}10` },
                ]}
              >
                <Text style={[styles.featureCardTitle, { color: roomColor }]}>
                  {roomLabels[room] || room}
                </Text>
                <Text
                  style={[
                    styles.featureCardBadge,
                    { borderColor: roomColor, color: roomColor },
                  ]}
                >
                  {features.length}
                </Text>
              </View>
              <View style={styles.featureCardContent}>
                {features.map((feature) => (
                  <View key={feature.id} style={styles.featureItem}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{feature.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {customFeatures.length > 0 && (
        <>
          <Text style={styles.customFeaturesTitle}>
            {labels.addedFeatures} ({customFeatures.length})
          </Text>
          <View style={styles.featuresGrid}>
            {customFeatures.map((feature) => (
              <View key={feature.id} style={styles.customFeatureCard}>
                <View style={styles.featureItem}>
                  <Text style={[styles.featureCheck, { color: '#b45309' }]}>✓</Text>
                  <View>
                    <Text style={styles.customFeatureName}>{feature.name}</Text>
                    <Text style={styles.customFeatureInfo}>
                      {roomLabels[feature.room] || feature.room} • {labels.weight}: {feature.weight}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
