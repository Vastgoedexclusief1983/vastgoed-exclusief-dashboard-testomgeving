export type FeatureKey = 'aiAssistant' | 'waardebepaling' | 'website';

export type FeatureMap = Record<FeatureKey, boolean>;
export type UserFeatures = FeatureMap; // alias als je dit al gebruikt

export const DEFAULT_AGENT_FEATURES: FeatureMap = {
  aiAssistant: true,
  waardebepaling: true,
  website: true,
};

export const DEFAULT_ADMIN_FEATURES: FeatureMap = {
  aiAssistant: true,
  waardebepaling: true,
  website: true,
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  aiAssistant: 'AI assistant',
  waardebepaling: 'Waardebepaling',
  website: 'Website (aanmelden/afmelden)',
};

