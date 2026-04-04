import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    const user = session.user as { id: string; role?: string };
    const userId = String(user.id);
    const userRole = String(user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';

    const notDeletedCondition = {
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
        { isDeleted: null },
      ],
    };

    const searchCondition = query
      ? {
          $or: [
            { propertyCode: { $regex: query, $options: 'i' } },
            { 'basicInfo.address': { $regex: query, $options: 'i' } },
            { 'basicInfo.city': { $regex: query, $options: 'i' } },
            { 'basicInfo.province': { $regex: query, $options: 'i' } },
            { 'basicInfo.postalCode': { $regex: query, $options: 'i' } },
          ],
        }
      : null;

    const mongoQuery = isAdmin
      ? {
          $and: [
            notDeletedCondition,
            ...(searchCondition ? [searchCondition] : []),
          ],
        }
      : {
          $and: [
            notDeletedCondition,
            { agentId: userId },
            ...(searchCondition ? [searchCondition] : []),
          ],
        };

    const properties = await Property.find(mongoQuery)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const transformedProperties = properties.map((property: any) => {
      const city = property.basicInfo?.city || 'Unknown';
      const postalCode = property.basicInfo?.postalCode || '';

      return {
        _id: property._id.toString(),
        propertyCode: property.propertyCode || null,
        title: `${property.basicInfo?.propertyType || 'Property'} in ${city}`,
        address: property.basicInfo?.address || '',
        city,
        province: property.basicInfo?.province || '',
        postalCode,
        price: property.basicInfo?.basePrice || 0,
        propertyType: property.basicInfo?.propertyType || 'House',
        bedrooms: property.dimensions?.bedrooms || 0,
        bathrooms: property.dimensions?.bathrooms || 0,
        size: property.dimensions?.livingArea || 0,
        plotSize: property.dimensions?.lotSize || 0,
        yearBuilt:
          property.basicInfo?.constructionYear || new Date().getFullYear(),
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
