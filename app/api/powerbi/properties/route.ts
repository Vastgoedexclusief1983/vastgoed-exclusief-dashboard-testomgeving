import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const agents = await User.find({ role: 'agent' }).select('firstName lastName agentCode').lean();
    const properties = await Property.find().lean();

    const agentMap = new Map(agents.map((a: any) => [a._id.toString(), a]));

    const propertiesData = properties.map((property: any) => {
      const agent = agentMap.get(property.agentId.toString());

      return {
        PropertyID: property._id.toString(),
        AgentID: property.agentId.toString(),
        AgentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown',
        AgentCode: agent?.agentCode || '',
        Address: property.basicInfo?.address || '',
        PostalCode: property.basicInfo?.postalCode || '',
        City: property.basicInfo?.city || '',
        Province: property.basicInfo?.province || '',
        PropertyType: property.basicInfo?.propertyType || '',
        ConstructionYear: property.basicInfo?.constructionYear || null,
        Price: property.basicInfo?.basePrice || 0,
        EnergyLabel: property.basicInfo?.energyLabel || '',
        Location: property.basicInfo?.location || '',
        LivingArea: property.dimensions?.livingArea || 0,
        LotSize: property.dimensions?.lotSize || 0,
        Bedrooms: property.dimensions?.bedrooms || 0,
        Bathrooms: property.dimensions?.bathrooms || 0,
        HasParking: property.luxuryFeatures?.parking?.available || false,
        ParkingSpaces: property.luxuryFeatures?.parking?.spaces || 0,
        ParkingType: property.luxuryFeatures?.parking?.type || '',
        CreatedDate: property.createdAt,
        UpdatedDate: property.updatedAt,
      };
    });

    return NextResponse.json(propertiesData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch properties data', message: error.message },
      { status: 500 }
    );
  }
}
