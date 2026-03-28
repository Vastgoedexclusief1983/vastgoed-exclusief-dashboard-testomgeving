import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Property, { generatePropertyCode } from '@/lib/db/models/Property';
import User from '@/lib/db/models/User';
import { requireAuth } from '@/lib/auth/session';
import { createPropertySchema } from '@/lib/validations/property';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { canViewAllProperties } from '@/lib/auth/permissions';
import { geocodeCityWithPDOK } from '@/lib/geocoding/pdok';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const includeAgent = searchParams.get('includeAgent') === 'true';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const onlyDeleted = searchParams.get('onlyDeleted') === 'true';

    let properties: any;

    let deletedFilter: any = {
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }],
    };

    if (includeDeleted) {
      deletedFilter = {};
    } else if (onlyDeleted) {
      deletedFilter = { isDeleted: true };
    }

    if (canViewAllProperties(user.role)) {
      const query = Property.find(deletedFilter).sort({ createdAt: -1 });

      if (includeAgent) {
        properties = await query.lean();
        const agentIds = [...new Set(properties.map((p: any) => p.agentId).filter(Boolean))];

        const agents = await User.find({ _id: { $in: agentIds } })
          .select('firstName lastName email agentCode')
          .lean();

        const agentMap = new Map(agents.map((a: any) => [a._id.toString(), a]));

        properties = properties.map((p: any) => ({
          ...p,
          agent: agentMap.get(String(p.agentId)),
        }));
      } else {
        properties = await query;
      }
    } else {
      properties = await Property.find({
        agentId: user.id,
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }],
      }).sort({ createdAt: -1 });
    }

    return successResponse(properties);
  } catch (error: any) {
    return errorResponse(error?.message || 'Unauthorized', 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    const propertyCode = await generatePropertyCode();

    const city = String(validatedData.city || '').trim();

    let geoLocation:
      | {
          city?: string;
          lat?: number;
          lng?: number;
          source?: string;
          label?: string;
        }
      | undefined;

    if (city) {
      const geo = await geocodeCityWithPDOK(city);
      if (geo) {
        geoLocation = {
          city,
          lat: geo.lat,
          lng: geo.lng,
          source: 'pdok',
          label: geo.label,
        };
      }
    }

    const property = new Property({
      propertyCode,
      agentId: user.id,

      location: geoLocation,

      basicInfo: {
        address: validatedData.address,
        postalCode: validatedData.postalCode,
        city: validatedData.city,
        province: validatedData.province,
        propertyType: validatedData.propertyType,
        constructionYear: validatedData.constructionYear,
        basePrice: validatedData.basePrice,
        energyLabel: validatedData.energyLabel,
        location: validatedData.location,
      },

      dimensions: {
        livingArea: validatedData.livingArea,
        lotSize: validatedData.lotSize,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
      },

      luxuryFeatures: validatedData.luxuryFeatures,

      images: validatedData.images || [],
    });

    await property.save();

    return successResponse(property, 201);
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return errorResponse(error.errors?.[0]?.message || 'Validatie fout', 400);
    }

    return errorResponse(error?.message || 'Internal Server Error', 500);
  }
}
