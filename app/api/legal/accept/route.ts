import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';

import clientPromise from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth/session';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';

function toObjectIdMaybe(id: unknown) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
  return null;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          acceptTerms?: boolean;
          acceptPrivacy?: boolean;
          acceptDpa?: boolean;
          acceptDisclaimer?: boolean;
        }
      | null;

    if (
      !body?.acceptTerms ||
      !body?.acceptPrivacy ||
      !body?.acceptDpa ||
      !body?.acceptDisclaimer
    ) {
      return new NextResponse('Incomplete acceptance', { status: 400 });
    }

    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      null;

    const userAgent = h.get('user-agent') || null;
    const acceptedAt = new Date();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');

    const userObjectId =
      toObjectIdMaybe((user as { _id?: unknown })._id) ||
      toObjectIdMaybe((user as { id?: unknown }).id);

    const userEmail =
      (user as { email?: string | null }).email?.trim().toLowerCase() || null;

    const filter =
      userObjectId != null
        ? { _id: userObjectId }
        : userEmail
        ? { email: userEmail }
        : null;

    if (!filter) {
      return NextResponse.json(
        { error: 'Gebruiker kon niet worden herkend.' },
        { status: 400 }
      );
    }

    const snapshot = {
      name: (user as { name?: string | null }).name ?? null,
      email: (user as { email?: string | null }).email ?? null,
      company: (user as { company?: string | null }).company ?? null,
    };

    const result = await users.updateOne(filter, {
      $set: {
        legalAcceptance: {
          acceptedAt,
          termsVersion: LEGAL_VERSIONS.terms,
          privacyVersion: LEGAL_VERSIONS.privacy,
          processingVersion: LEGAL_VERSIONS.processing,
          disclaimerVersion: LEGAL_VERSIONS.disclaimer,
          ip,
          userAgent,
          snapshot,
        },
        updatedAt: acceptedAt,
      },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Geen gebruiker gevonden om akkoord op te slaan.' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        ok: true,
        message: 'Akkoord stond al opgeslagen.',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('LEGAL_ACCEPT_POST_ERROR', error);
    return NextResponse.json(
      { error: 'Akkoord kon niet worden opgeslagen.' },
      { status: 500 }
    );
  }
}
