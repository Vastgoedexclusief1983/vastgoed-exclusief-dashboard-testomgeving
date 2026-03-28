export const LEGAL_VERSIONS = {
  terms: '2026-03',
  privacy: '2026-03',
  processing: '2026-03',
  disclaimer: '2026-03',
} as const;

export type LegalAcceptance = {
  acceptedAt?: string | Date | null;
  termsVersion?: string | null;
  privacyVersion?: string | null;
  processingVersion?: string | null;
  disclaimerVersion?: string | null;
};

export function needsLegalAcceptance(acceptance?: LegalAcceptance | null) {
  if (!acceptance) return true;

  return (
    acceptance.termsVersion !== LEGAL_VERSIONS.terms ||
    acceptance.privacyVersion !== LEGAL_VERSIONS.privacy ||
    acceptance.processingVersion !== LEGAL_VERSIONS.processing ||
    acceptance.disclaimerVersion !== LEGAL_VERSIONS.disclaimer
  );
}
