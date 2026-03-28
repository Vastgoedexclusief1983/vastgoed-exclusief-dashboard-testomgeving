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
    },

    city: {
      type: String,
      required: true,
    },

    packageType: {
      type: String,
      enum: ['homepage', 'instagram', 'fotografie', 'compleet'],
      required: true,
    },

    notes: {
      type: String,
      default: '',
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
