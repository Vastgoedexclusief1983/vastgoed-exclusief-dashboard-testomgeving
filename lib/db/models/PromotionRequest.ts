import mongoose, { Schema, model, models } from 'mongoose';

const PromotionRequestSchema = new Schema(
  {
    agentId: {
      type: String,
      required: true,
      index: true,
    },

    propertyAddress: {
      type: String,
      required: true,
      default: 'Niet van toepassing - promotieaanvraag',
    },

    city: {
      type: String,
      required: true,
      default: 'Niet van toepassing',
    },

    packageType: {
      type: String,
      enum: [
        'high-end-mediapakket',
        'homepage-banner-socials',
        'uitgelichte-woning-homepage',
        'social-media-campagne',
        'vermelding-online-magazine',
      ],
      required: true,
    },

    packageTitle: {
      type: String,
      default: '',
    },

    packagePrice: {
      type: String,
      default: '',
    },

    contactName: {
      type: String,
      default: '',
    },

    companyName: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      default: '',
    },

    packageBullets: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: '',
    },

    agreed: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['nieuw', 'in_behandeling', 'afgerond'],
      default: 'nieuw',
    },
  },
  {
    timestamps: true,
  }
);

export default models.PromotionRequest ||
  model('PromotionRequest', PromotionRequestSchema);
