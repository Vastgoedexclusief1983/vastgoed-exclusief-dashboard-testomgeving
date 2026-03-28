import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function getAgentIdFromSession(session: any): string | null {
  // Uniek per makelaar → email is prima (en stabiel)
  return session?.user?.email ?? null;
}

function getAgentNameFromSession(session: any): string | null {
  // Jouw session.user heeft: firstName, lastName, companyName (geen "name")
  const company = session?.user?.companyName;
  const first = session?.user?.firstName;
  const last = session?.user?.lastName;

  const fullName = `${first ?? ''} ${last ?? ''}`.trim();

  return (company && company.trim()) || (fullName && fullName.trim()) || null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const agentId = getAgentIdFromSession(session);

    if (!agentId) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('VastgoedExclusief_DB');
    const collection = db.collection('sold_reports');

    const items = await collection
      .find({ agentId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const agentId = getAgentIdFromSession(session);

    if (!agentId) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await req.json();
    const { address, soldPrice, soldAt, notes } = body ?? {};

    if (!isNonEmptyString(address)) {
      return NextResponse.json({ error: 'Adres is verplicht' }, { status: 400 });
    }

    const price = Number(soldPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Verkoopprijs ongeldig' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('VastgoedExclusief_DB');
    const collection = db.collection('sold_reports');

    await collection.insertOne({
      agentId, // = session.user.email
      agentName: getAgentNameFromSession(session),
      address: address.trim(),
      soldPrice: price,
      soldAt: isNonEmptyString(soldAt) ? soldAt.trim() : null,
      notes: isNonEmptyString(notes) ? notes.trim() : '',
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
