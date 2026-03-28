import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/session';

const DEFAULT_MONTHLY_LIMIT = 50;

function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

type CreditUser = {
  _id?: string;
  email?: string;
  monthlyAiLimit?: number;
};

type UsageDoc = {
  agentId?: string;
  period?: string;
  count?: number;
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const email =
      typeof currentUser.email === 'string' ? currentUser.email.trim() : '';

    if (!email) {
      return NextResponse.json(
        { error: 'Geen geldig e-mailadres gevonden voor gebruiker.' },
        { status: 400 }
      );
    }

    const user = (await User.findOne({ email })
      .select('email monthlyAiLimit')
      .lean()) as CreditUser | null;

    const monthlyLimit =
      typeof user?.monthlyAiLimit === 'number' && user.monthlyAiLimit > 0
        ? user.monthlyAiLimit
        : DEFAULT_MONTHLY_LIMIT;

    const period = getCurrentPeriod();

    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: 'Databaseverbinding niet beschikbaar.' },
        { status: 500 }
      );
    }

    const usageDoc = (await db.collection('ai_usage').findOne({
      agentId: email,
      period,
    })) as UsageDoc | null;

    const used =
      typeof usageDoc?.count === 'number' && Number.isFinite(usageDoc.count)
        ? usageDoc.count
        : 0;

    const remaining = Math.max(0, monthlyLimit - used);
    const percentageUsed =
      monthlyLimit > 0
        ? Math.min(100, Math.round((used / monthlyLimit) * 100))
        : 0;

    return NextResponse.json({
      period,
      used,
      limit: monthlyLimit,
      remaining,
      percentageUsed,
    });
  } catch (error) {
    console.error('GET /api/ai/credits error:', error);

    return NextResponse.json(
      { error: 'Kon AI-credits niet ophalen.' },
      { status: 500 }
    );
  }
}
