import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/session';

function parseMonthlyAiLimit(value: unknown) {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number(value)
      : NaN;

  if (!Number.isFinite(num)) return null;

  return Math.max(0, Math.floor(num));
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (String(currentUser.role).toLowerCase() !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Ongeldig makelaar ID.' },
        { status: 400 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          monthlyAiLimit?: number | string;
        }
      | null;

    const monthlyAiLimit = parseMonthlyAiLimit(body?.monthlyAiLimit);

    if (monthlyAiLimit === null) {
      return NextResponse.json(
        { error: 'Voer een geldig aantal credits in.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedAgent = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          monthlyAiLimit,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      }
    ).lean();

    if (!updatedAgent) {
      return NextResponse.json(
        { error: 'Makelaar niet gevonden.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      monthlyAiLimit,
    });
  } catch (error) {
    console.error('PATCH /api/admin/agents/[id]/credits error:', error);

    return NextResponse.json(
      { error: 'Opslaan van credits is mislukt.' },
      { status: 500 }
    );
  }
}
