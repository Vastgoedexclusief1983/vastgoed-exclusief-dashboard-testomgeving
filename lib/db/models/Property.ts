import mongoose, { Model, Schema } from 'mongoose';
import { IProperty } from '@/types/property';

// Schema zonder generics om TS schema/type mismatch te voorkomen
const PropertySchema = new Schema(
  {
    propertyCode: {
      type: String,
      unique: true,
      index: true,
    },
    agentId: {
      type: String,
      required: [true, 'Agent ID is required'],
      ref: 'User',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      ref: 'User',
      default: null,
    },

    // ✅ Coördinaten voor kaart & AI-referenties (plaatsniveau via PDOK)
    // Let op: basicInfo.location blijft een string voor "omgeving/ligging".
    location: {
      city: { type: String, trim: true },
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
      source: { type: String, trim: true }, // bijv. 'pdok'
      label: { type: String, trim: true }, // optioneel
    },

    basicInfo: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      province: {
        type: String,
        required: [true, 'Province is required'],
        trim: true,
      },
      propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: [
          'House',
          'Villa',
          'CountryHouse',
          'Mansion',
          'SemiDetached',
          'TerracedHouse',
          'Apartment',
          'Penthouse',
          'HolidayHome',
          'Farmhouse',
          'MonumentalBuilding',

          // legacy / bestaande waarden in database
          'Condo',
          'Townhouse',
          'Land',
          'Commercial',
        ],
      },

      constructionYear: {
        type: Number,
        required: [true, 'Construction year is required'],
        min: 1800,
        max: new Date().getFullYear() + 5,
      },
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: 0,
      },
      energyLabel: {
        type: String,
        required: [true, 'Energy label is required'],
        enum: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Niet bekend'],
      },
      // Dit is jouw tekstveld "omgeving/ligging"
      location: {
        type: String,
        required: [true, 'Location/Surroundings is required'],
        trim: true,
      },
    },

    dimensions: {
      livingArea: {
        type: Number,
        required: [true, 'Living area is required'],
        min: 0,
      },
      lotSize: {
        type: Number,
        required: [true, 'Lot size is required'],
        min: 0,
      },
      bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: 0,
      },
      bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: 0,
      },
    },

    luxuryFeatures: {
      amenities: {
        type: [String],
        default: [],
      },
      parking: {
        available: { type: Boolean, default: false },
        spaces: { type: Number, min: 0, default: 0 },
        type: { type: String, enum: ['Garage', 'Carport', 'Driveway', 'Street'] },
      },
    },

    images: [
      {
        url: {
          type: String,
          trim: true,
        },
        alt: {
          type: String,
          default: '',
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    valuation: {
      finalPrice: { type: Number, min: 0 },
      addedValue: { type: Number, min: 0 },
      addedValuePercent: { type: Number, min: 0 },
      selectedFeatures: { type: [String], default: [] },
      customFeatures: [
        {
          name: { type: String },
          room: { type: String },
          weight: { type: Number },
        },
      ],
      sliderValues: {
        Kitchen: { type: Number, default: 0 },
        Bathroom: { type: Number, default: 0 },
        'Living Room': { type: Number, default: 0 },
        Outdoor: { type: Number, default: 0 },
        Bedroom: { type: Number, default: 0 },
        Extras: { type: Number, default: 0 },
      },
      valuatedAt: { type: Date },
      valuatedBy: { type: String, ref: 'User' },
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({ agentId: 1, createdAt: -1 });
PropertySchema.index({ 'basicInfo.city': 1 });
PropertySchema.index({ 'basicInfo.province': 1 });
PropertySchema.index({ 'basicInfo.propertyType': 1 });
PropertySchema.index({ propertyCode: 1 });
PropertySchema.index({ 'location.city': 1 });

// Pre-save hook: propertyCode genereren indien niet aanwezig
PropertySchema.pre('save', async function (next) {
  // We typen `this` als "any" om Mongoose document typing issues te vermijden zonder ts-expect-error
  const doc = this as any;

  if (!doc.propertyCode) {
    const PropertyModel = mongoose.models.Property;
    const lastProperty = await PropertyModel.findOne({
      propertyCode: { $regex: /^PROP-\d{5}$/ },
    })
      .sort({ propertyCode: -1 })
      .select('propertyCode')
      .lean();

    let nextNumber = 1;
    if (lastProperty && (lastProperty as any).propertyCode) {
      const match = (lastProperty as any).propertyCode.match(/PROP-(\d{5})/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    doc.propertyCode = `PROP-${nextNumber.toString().padStart(5, '0')}`;
  }

  next();
});

// Model typed houden
const Property: Model<IProperty> =
  (mongoose.models.Property as Model<IProperty>) ||
  mongoose.model<IProperty>('Property', PropertySchema);

export async function generatePropertyCode(): Promise<string> {
  const lastProperty = await Property.findOne({
    propertyCode: { $regex: /^PROP-\d{5}$/ },
  })
    .sort({ propertyCode: -1 })
    .select('propertyCode')
    .lean();

  let nextNumber = 1;
  if (lastProperty && (lastProperty as any).propertyCode) {
    const match = (lastProperty as any).propertyCode.match(/PROP-(\d{5})/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }

  return `PROP-${nextNumber.toString().padStart(5, '0')}`;
}

export default Property;
