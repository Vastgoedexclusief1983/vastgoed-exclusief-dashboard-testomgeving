import { NextRequest, NextResponse } from 'next/server';

type BillingCycle = 'monthly' | 'yearly';
type RequestedPlan = 'professional' | 'premium' | 'custom';

function formatEuro(amount: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      currentLimit,
      remainingCredits,
      usedCredits,
      requestedPlan,
      requestedPlanName,
      requestedMonthlyLimit,
      billingCycle,
      monthlyPriceExVat,
      yearlyPriceExVat,
      companyName,
      contactName,
      email,
      phone,
      message,
    }: {
      currentLimit: number;
      remainingCredits: number;
      usedCredits: number;
      requestedPlan: RequestedPlan;
      requestedPlanName: string;
      requestedMonthlyLimit: number | null;
      billingCycle: BillingCycle;
      monthlyPriceExVat: number | null;
      yearlyPriceExVat: number | null;
      companyName: string;
      contactName: string;
      email: string;
      phone?: string;
      message?: string;
    } = body;

    if (!companyName || !contactName || !email || !requestedPlan || !requestedPlanName || !billingCycle) {
      return NextResponse.json(
        { ok: false, error: 'Verplichte velden ontbreken.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = 'info@vastgoedexclusief.nl';

    if (!resendApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'RESEND_API_KEY ontbreekt in de environment variables.',
        },
        { status: 500 }
      );
    }

    const priceText =
      requestedPlan === 'custom'
        ? 'Op aanvraag'
        : billingCycle === 'yearly'
        ? `${formatEuro(yearlyPriceExVat || 0)} per jaar excl. btw`
        : `${formatEuro(monthlyPriceExVat || 0)} per maand excl. btw`;

    const billingText =
      billingCycle === 'yearly'
        ? 'Jaarlijks (10% korting)'
        : 'Maandelijks';

    const subject = `Nieuwe aanvraag AI-credit bundel: ${requestedPlanName} - ${companyName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Nieuwe aanvraag AI-credit bundel</h2>

        <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="padding: 8px 0; font-weight: 700; width: 220px;">Bedrijfsnaam</td>
              <td style="padding: 8px 0;">${escapeHtml(companyName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Contactpersoon</td>
              <td style="padding: 8px 0;">${escapeHtml(contactName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">E-mailadres</td>
              <td style="padding: 8px 0;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Telefoonnummer</td>
              <td style="padding: 8px 0;">${escapeHtml(phone || '-')}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin: 0 0 12px;">Gevraagde bundel</h3>
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="padding: 8px 0; font-weight: 700; width: 220px;">Pakket</td>
              <td style="padding: 8px 0;">${escapeHtml(requestedPlanName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Gewenst maandlimiet</td>
              <td style="padding: 8px 0;">${requestedMonthlyLimit ? `${requestedMonthlyLimit} credits` : 'Maatwerk / op aanvraag'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Facturatie</td>
              <td style="padding: 8px 0;">${billingText}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Prijsindicatie</td>
              <td style="padding: 8px 0;">${priceText}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin: 0 0 12px;">Huidige creditsituatie</h3>
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="padding: 8px 0; font-weight: 700; width: 220px;">Huidig maandlimiet</td>
              <td style="padding: 8px 0;">${currentLimit} credits</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Resterend</td>
              <td style="padding: 8px 0;">${remainingCredits} credits</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 700;">Verbruikt</td>
              <td style="padding: 8px 0;">${usedCredits} credits</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin: 0 0 12px;">Toelichting</h3>
        <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
          ${escapeHtml(message || '-').replace(/\n/g, '<br />')}
        </div>
      </div>
    `;

    const text = [
      'Nieuwe aanvraag AI-credit bundel',
      '',
      `Bedrijfsnaam: ${companyName}`,
      `Contactpersoon: ${contactName}`,
      `E-mailadres: ${email}`,
      `Telefoonnummer: ${phone || '-'}`,
      '',
      `Pakket: ${requestedPlanName}`,
      `Gewenst maandlimiet: ${requestedMonthlyLimit ? `${requestedMonthlyLimit} credits` : 'Maatwerk / op aanvraag'}`,
      `Facturatie: ${billingText}`,
      `Prijsindicatie: ${priceText}`,
      '',
      `Huidig maandlimiet: ${currentLimit} credits`,
      `Resterend: ${remainingCredits} credits`,
      `Verbruikt: ${usedCredits} credits`,
      '',
      'Toelichting:',
      message || '-',
    ].join('\n');

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        html,
        text,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: resendData?.message || 'Versturen via Resend is mislukt.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: resendData?.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Onbekende fout bij verwerken aanvraag.';

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
