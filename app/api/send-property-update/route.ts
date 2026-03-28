import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { address, city, changes, agentName } = body;

    await resend.emails.send({
     from: 'Vastgoed Exclusief <onboarding@resend.dev>',
      to: ['info@vastgoedexclusief.nl'],
      subject: 'Woning wijziging ontvangen',
      html: `
        <h2>Nieuwe wijziging in dashboard</h2>
        <p><strong>Adres:</strong> ${address}</p>
        <p><strong>Plaats:</strong> ${city}</p>
        <p><strong>Makelaar:</strong> ${agentName}</p>
        <p><strong>Wijzigingen:</strong></p>
        <pre>${JSON.stringify(changes, null, 2)}</pre>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}
