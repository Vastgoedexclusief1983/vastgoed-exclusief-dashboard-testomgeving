import { z } from 'zod';
import {
  PROPERTY_TYPES,
  ENERGY_LABELS,
  PROVINCES,
  PARKING_TYPES,
} from '@/types/property';

const currentYear = new Date().getFullYear();

const roomFeaturesSchema = z
  .object({
    quality: z.number().min(0).max(10),
    modern: z.number().min(0).max(10),
    spacious: z.number().min(0).max(10),
    lighting: z.number().min(0).max(10),
  })
  .optional();

const luxuryFeaturesSchema = z
  .object({
    kitchen: roomFeaturesSchema,
    bathroom: roomFeaturesSchema,
    livingRoom: roomFeaturesSchema,
    bedroom: roomFeaturesSchema,
    outdoor: roomFeaturesSchema,
    amenities: z.array(z.string()).optional(),
    parking: z
      .object({
        available: z.boolean().optional(),
        spaces: z.number().min(0).optional(),
        type: z.enum(PARKING_TYPES).optional(),
      })
      .optional(),
  })
  .optional();

const propertyImageSchema = z.object({
  url: z.string().url('Image URL is invalid'),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const createPropertySchema = z.object({
  createdAt: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
  province: z.enum(PROVINCES, {
    message: 'Please select a valid province',
  }),
  propertyType: z.enum(PROPERTY_TYPES, {
    message: 'Please select a valid property type',
  }),
  constructionYear: z
    .number()
    .int()
    .min(1800, 'Construction year must be after 1800')
    .max(
      currentYear + 5,
      `Construction year cannot be more than ${currentYear + 5}`
    ),
  basePrice: z.number().min(0, 'Base price must be a positive number'),
  energyLabel: z.enum(ENERGY_LABELS, {
    message: 'Please select a valid energy label',
  }),
  location: z.string().min(1, 'Location/Surroundings is required'),
  livingArea: z.number().min(0, 'Living area must be a positive number'),
  lotSize: z.number().min(0, 'Lot size must be a positive number'),
  bedrooms: z.number().int().min(0, 'Bedrooms must be a positive number'),
  bathrooms: z.number().min(0, 'Bathrooms must be a positive number'),
  luxuryFeatures: luxuryFeaturesSchema,
  images: z.array(propertyImageSchema).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
