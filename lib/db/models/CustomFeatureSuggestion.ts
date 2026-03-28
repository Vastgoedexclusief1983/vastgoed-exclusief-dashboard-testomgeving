import mongoose, { Model, Schema } from 'mongoose';

export interface ICustomFeatureSuggestion {
  _id: string;
  name: string;
  room: string;
  weight: number;
  suggestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomFeatureSuggestionSchema = new Schema<ICustomFeatureSuggestion>(
  {
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Kitchen', 'Bathroom', 'Living Room', 'Outdoor', 'Bedroom', 'Extras'],
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    suggestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CustomFeatureSuggestionSchema.index({ status: 1 });
CustomFeatureSuggestionSchema.index({ suggestedBy: 1 });

const CustomFeatureSuggestion: Model<ICustomFeatureSuggestion> =
  mongoose.models.CustomFeatureSuggestion ||
  mongoose.model<ICustomFeatureSuggestion>('CustomFeatureSuggestion', CustomFeatureSuggestionSchema);

export default CustomFeatureSuggestion;
