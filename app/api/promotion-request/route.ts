import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import PromotionRequest from '@/lib/db/models/PromotionRequest';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const request = await PromotionRequest.create({
      agentId: user.id,
      propertyAddress: body.propertyAddress,
      city: body.city,
      packageType: body.packageType,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      request,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
