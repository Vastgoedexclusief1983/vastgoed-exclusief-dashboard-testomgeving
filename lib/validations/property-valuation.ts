import { z } from 'zod';
import {
  PROPERTY_TYPES,
  ENERGY_LABELS,
} from '@/types/property-valuation';

export const propertyDetailsSchema = z.object({
  propertyId: z
    .string()
    .min(1, 'Property ID is required')
    .max(50, 'Property ID must be 50 characters or less'),

  propertyCode: z
    .string()
    .max(50, 'Property code must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(200, 'Address must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  postalCode: z
    .string()
    .max(20, 'Postal code must be 20 characters or less')
    .optional()
    .or(z.literal('')),

  cityTown: z
    .string()
    .max(100, 'City/Town must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  province: z
    .string()
    .max(100, 'Province must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  propertyType: z.string().optional().or(z.literal('')),

  baseAskingPrice: z
    .number()
    .min(1, 'Base asking price must be greater than 0')
    .max(100000000, 'Base asking price seems too high'),

  energyLabel: z.string().optional().or(z.literal('')),

  location: z.string().optional().or(z.literal('')),

  yearBuilt: z.number().optional(),

  livingArea: z.number().optional(),

  plotArea: z.number().optional(),

  numberOfBedrooms: z.number().optional(),

  numberOfBathrooms: z.number().optional(),

  parkingSpaces: z.boolean().optional(),
});

export type PropertyDetailsFormData = z.infer<typeof propertyDetailsSchema>;
