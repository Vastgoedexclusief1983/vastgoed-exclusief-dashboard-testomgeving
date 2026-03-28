import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import CustomFeatureSuggestion from '@/lib/db/models/CustomFeatureSuggestion';

// POST - Create a new custom feature suggestion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();
    const { name, room, weight } = data;

    if (!name || !room) {
      return NextResponse.json(
        { error: 'Name and room are required' },
        { status: 400 }
      );
    }

    const suggestion = await CustomFeatureSuggestion.create({
      name,
      room,
      weight: weight || 3,
      suggestedBy: session.user.id,
      status: 'pending',
    });

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error('Error creating custom feature suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 }
    );
  }
}

// GET - Get all custom feature suggestions (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { role: string };
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const suggestions = await CustomFeatureSuggestion.find(query)
      .populate('suggestedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching custom feature suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
