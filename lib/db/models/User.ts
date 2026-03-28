import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '@/types/auth';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    role: {
      type: String,
      enum: ['agent', 'admin'],
      default: 'agent',
      required: true,
      lowercase: true,
      trim: true,
      set: (value: unknown) => String(value ?? '').toLowerCase(),
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    agentCode: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    monthlyAiLimit: {
      type: Number,
      default: 50,
      min: [0, 'Monthly AI limit cannot be negative'],
    },

    lastLogin: {
      type: Date,
    },

    resetToken: {
      type: String,
    },

    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index voor snelle filtering op rol
UserSchema.index({ role: 1 });

// Virtual full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Zorg dat virtuals meegaan bij JSON conversie
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
