import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Base condition: not deleted
    const notDeletedCondition = { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }] };

    // For agents, filter to only their properties
    const user = session.user as { id: string; role: string };

    // Build base query
    let baseQuery: Record<string, unknown> = notDeletedCondition;
    if (user.role === 'agent') {
      baseQuery = {
        $and: [notDeletedCondition, { agentId: user.id }]
      };
    }

    const searchQuery = query
      ? {
          $and: [
            notDeletedCondition,
            ...(user.role === 'agent' ? [{ agentId: user.id }] : []),
            {
              $or: [
                { propertyCode: { $regex: query, $options: 'i' } },
                { 'basicInfo.address': { $regex: query, $options: 'i' } },
                { 'basicInfo.city': { $regex: query, $options: 'i' } },
                { 'basicInfo.province': { $regex: query, $options: 'i' } },
                { 'basicInfo.postalCode': { $regex: query, $options: 'i' } },
              ],
            }
          ]
        }
      : baseQuery;

    const properties = await Property.find(searchQuery)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to flatten the structure for the frontend
    const transformedProperties = properties.map((property: any) => {
      const city = property.basicInfo?.city || 'Unknown';
      const postalCode = property.basicInfo?.postalCode || '';

      return {
        _id: property._id.toString(),
        propertyCode: property.propertyCode || null,
        title: `${property.basicInfo?.propertyType || 'Property'} in ${city}`,
        address: property.basicInfo?.address || '',
        city: city,
        province: property.basicInfo?.province || '',
        postalCode: postalCode,
        price: property.basicInfo?.basePrice || 0,
        propertyType: property.basicInfo?.propertyType || 'House',
        bedrooms: property.dimensions?.bedrooms || 0,
        bathrooms: property.dimensions?.bathrooms || 0,
        size: property.dimensions?.livingArea || 0,
        plotSize: property.dimensions?.lotSize || 0,
        yearBuilt: property.basicInfo?.constructionYear || new Date().getFullYear(),
        energyLabel: property.basicInfo?.energyLabel || 'Unknown',
        location: property.basicInfo?.location || '',
      };
    });

    return NextResponse.json(transformedProperties);
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
