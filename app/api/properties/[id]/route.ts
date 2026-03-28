import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import { requireAuth } from '@/lib/auth/session';
import { updatePropertySchema } from '@/lib/validations/property';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/utils/api-response';
import { canViewAllProperties } from '@/lib/auth/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { id } = await params;
    const property = await Property.findById(id);

    if (!property) {
      return notFoundResponse('Property not found');
    }

    if (!canViewAllProperties(user.role) && property.agentId !== user.id) {
      return forbiddenResponse('You do not have permission to view this property');
    }

    return successResponse(property);
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { id } = await params;
    const property = await Property.findById(id);

    if (!property) {
      return notFoundResponse('Property not found');
    }

    if (!canViewAllProperties(user.role) && property.agentId !== user.id) {
      return forbiddenResponse('You do not have permission to edit this property');
    }

    const body = await request.json();
    const validatedData = updatePropertySchema.parse(body);

    if (validatedData.address !== undefined) {
      property.basicInfo.address = validatedData.address;
    }
    if (validatedData.postalCode !== undefined) {
      property.basicInfo.postalCode = validatedData.postalCode;
    }
    if (validatedData.city !== undefined) {
      property.basicInfo.city = validatedData.city;
    }
    if (validatedData.province !== undefined) {
      property.basicInfo.province = validatedData.province;
    }
    if (validatedData.propertyType !== undefined) {
      property.basicInfo.propertyType = validatedData.propertyType;
    }
    if (validatedData.constructionYear !== undefined) {
      property.basicInfo.constructionYear = validatedData.constructionYear;
    }
    if (validatedData.basePrice !== undefined) {
      property.basicInfo.basePrice = validatedData.basePrice;
    }
    if (validatedData.energyLabel !== undefined) {
      property.basicInfo.energyLabel = validatedData.energyLabel;
    }
    if (validatedData.location !== undefined) {
      property.basicInfo.location = validatedData.location;
    }
    if (validatedData.livingArea !== undefined) {
      property.dimensions.livingArea = validatedData.livingArea;
    }
    if (validatedData.lotSize !== undefined) {
      property.dimensions.lotSize = validatedData.lotSize;
    }
    if (validatedData.bedrooms !== undefined) {
      property.dimensions.bedrooms = validatedData.bedrooms;
    }
    if (validatedData.bathrooms !== undefined) {
      property.dimensions.bathrooms = validatedData.bathrooms;
    }
    if (validatedData.luxuryFeatures !== undefined) {
      property.luxuryFeatures = validatedData.luxuryFeatures;
    }

    // ✅ BELANGRIJK: hoofdfoto / afbeeldingen ook opslaan
    if (validatedData.images !== undefined) {
      property.images = validatedData.images;
    }

    await property.save();

    return successResponse(property);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return errorResponse(error.message, 401);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { id } = await params;
    const property = await Property.findById(id);

    if (!property) {
      return notFoundResponse('Property not found');
    }

    if (!canViewAllProperties(user.role) && property.agentId !== user.id) {
      return forbiddenResponse('You do not have permission to delete this property');
    }

    property.isDeleted = true;
    property.deletedAt = new Date();
    property.deletedBy = user.id;
    await property.save();

    return successResponse({ message: 'Property deleted successfully' });
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    if (body.action !== 'restore') {
      return errorResponse('Invalid action', 400);
    }

    if (!canViewAllProperties(user.role)) {
      return forbiddenResponse('Only admins can restore deleted properties');
    }

    const property = await Property.findById(id);

    if (!property) {
      return notFoundResponse('Property not found');
    }

    if (!property.isDeleted) {
      return errorResponse('Property is not deleted', 400);
    }

    property.isDeleted = false;
    property.deletedAt = null;
    property.deletedBy = null;
    await property.save();

    return successResponse({ message: 'Property restored successfully' });
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}
