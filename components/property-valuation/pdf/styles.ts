import { StyleSheet } from '@react-pdf/renderer';

export const colors = {
  primary: '#102c54',
  primaryLight: '#1a4175',
  accent: '#FF0000',
  green: '#16a34a',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
  },
  white: '#ffffff',
  rooms: {
    Kitchen: '#FF6B35',
    Bathroom: '#4ECDC4',
    'Living Room': '#7B68EE',
    Outdoor: '#2ECC71',
    Bedroom: '#E91E63',
    Extras: '#FFD700',
  } as Record<string, string>,
};

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },

  // Header styles
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 0,
    marginHorizontal: -40,
    marginTop: -40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#93c5fd',
  },
  headerRight: {
    textAlign: 'right',
  },
  headerLabel: {
    fontSize: 9,
    color: '#93c5fd',
    marginBottom: 2,
  },
  headerCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  agentInfo: {
    fontSize: 9,
    color: '#93c5fd',
  },
  agentName: {
    color: colors.white,
    fontWeight: 'bold',
  },

  // Valuation Banner styles
  valuationBanner: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    padding: 15,
    marginHorizontal: -40,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  valuationItem: {
    flex: 1,
    textAlign: 'center',
  },
  valuationItemLast: {
    flex: 1,
    textAlign: 'center',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,0,0,0.2)',
    paddingLeft: 15,
  },
  valuationLabel: {
    fontSize: 9,
    color: colors.gray[500],
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  valuationValueGreen: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.green,
  },
  valuationValueAccent: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accent,
  },
  valuationPercent: {
    fontSize: 10,
    color: colors.gray[500],
    marginLeft: 4,
  },

  // Section styles
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginTop: 20,
  },

  // Property Details styles
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyItem: {
    width: '33.33%',
    marginBottom: 12,
  },
  propertyLabel: {
    fontSize: 8,
    color: colors.gray[500],
    marginBottom: 2,
  },
  propertyValue: {
    fontSize: 10,
    color: colors.gray[800],
  },
  energyBadge: {
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  // Features styles
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureCard: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
  },
  featureCardHeader: {
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureCardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  featureCardBadge: {
    fontSize: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
  },
  featureCardContent: {
    padding: 6,
    paddingTop: 0,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  featureCheck: {
    fontSize: 8,
    color: colors.green,
    marginRight: 4,
  },
  featureText: {
    fontSize: 8,
    color: colors.gray[700],
    flex: 1,
  },

  // Custom Features styles
  customFeaturesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 8,
    marginTop: 16,
  },
  customFeatureCard: {
    width: '31%',
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  customFeatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  customFeatureInfo: {
    fontSize: 8,
    color: '#b45309',
  },

  // Table styles
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 6,
  },
  tableRowTotal: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  tableCell: {
    fontSize: 9,
    color: colors.gray[700],
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableCellGreen: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.green,
  },
  tableCellPrimary: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
  },
  roomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray[500],
  },
  footerCopyright: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // Utility styles
  row: {
    flexDirection: 'row',
  },
  flexGrow: {
    flexGrow: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mt8: {
    marginTop: 8,
  },
});
