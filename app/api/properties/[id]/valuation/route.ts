import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';

// PUT - Save or update property valuation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const data = await request.json();
    const { finalPrice, addedValue, addedValuePercent, selectedFeatures, customFeatures, sliderValues } = data;

    // Check if property exists
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check authorization (agent can only update their own properties)
    const user = session.user as { id: string; role: string };
    if (user.role === 'agent' && property.agentId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update valuation
    property.valuation = {
      finalPrice,
      addedValue,
      addedValuePercent,
      selectedFeatures: selectedFeatures || [],
      customFeatures: customFeatures || [],
      sliderValues: sliderValues || {},
      valuatedAt: new Date(),
      valuatedBy: user.id,
    };

    await property.save();

    return NextResponse.json({
      success: true,
      valuation: property.valuation,
    });
  } catch (error) {
    console.error('Error saving valuation:', error);
    return NextResponse.json(
      { error: 'Failed to save valuation' },
      { status: 500 }
    );
  }
}

// GET - Get property valuation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    const property = await Property.findById(id).select('valuation basicInfo.basePrice').lean();
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      valuation: property.valuation || null,
      basePrice: property.basicInfo?.basePrice,
    });
  } catch (error) {
    console.error('Error fetching valuation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch valuation' },
      { status: 500 }
    );
  }
}
