import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import dbConnect from '@/lib/db/mongodb';
import PromotionRequest from '@/lib/db/models/PromotionRequest';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

type CurrentUserLike = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  officeName?: string;
};

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = (await getCurrentUser()) as CurrentUserLike | null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          propertyAddress?: string;
          city?: string;
          packageType?: string;
          notes?: string;

          contactName?: string;
          companyName?: string;
          email?: string;
          phone?: string;

          packageKey?: string;
          packagePrice?: string;
          packageBullets?: string[];

          agreed?: boolean;
        }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: 'Geen geldige aanvraag ontvangen.' },
        { status: 400 },
      );
    }

    const propertyAddress = isNonEmptyString(body.propertyAddress)
      ? body.propertyAddress.trim()
      : '';
    const city = isNonEmptyString(body.city) ? body.city.trim() : '';
    const packageType = isNonEmptyString(body.packageType)
      ? body.packageType.trim()
      : '';
    const notes = isNonEmptyString(body.notes) ? body.notes.trim() : '';

    if (!propertyAddress || !city || !packageType) {
      return NextResponse.json(
        {
          error:
            'Vul minimaal het woningadres, de plaats en het gekozen pakket in.',
        },
        { status: 400 },
      );
    }

    const fallbackContactName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const contactName = isNonEmptyString(body.contactName)
      ? body.contactName.trim()
      : fallbackContactName || 'Onbekende makelaar';

    const companyName = isNonEmptyString(body.companyName)
      ? body.companyName.trim()
      : user.companyName || user.officeName || '';

    const email = isNonEmptyString(body.email)
      ? body.email.trim()
      : user.email || '';

    const phone = isNonEmptyString(body.phone) ? body.phone.trim() : '';
    const packageKey = isNonEmptyString(body.packageKey)
      ? body.packageKey.trim()
      : '';
    const packagePrice = isNonEmptyString(body.packagePrice)
      ? body.packagePrice.trim()
      : '';
    const agreed = body.agreed === true;

    const packageBullets = Array.isArray(body.packageBullets)
      ? body.packageBullets.filter(
          (item): item is string =>
            typeof item === 'string' && item.trim().length > 0,
        )
      : [];

    // ✅ Bestaande opslag blijft intact
    const request = await PromotionRequest.create({
      agentId: user.id,
      propertyAddress,
      city,
      packageType,
      notes,
    });

    let emailSent = false;
    let emailError = '';

    // ✅ Mail meesturen naar info@vastgoedexclusief.nl
    if (resend) {
      try {
        const safeContactName = escapeHtml(contactName);
        const safeCompanyName = escapeHtml(companyName || '-');
        const safeEmail = escapeHtml(email || '-');
        const safePhone = escapeHtml(phone || '-');
        const safeAddress = escapeHtml(propertyAddress);
        const safeCity = escapeHtml(city);
        const safePackageType = escapeHtml(packageType);
        const safePackageKey = escapeHtml(packageKey || '-');
        const safePackagePrice = escapeHtml(packagePrice || '-');
        const safeNotes = escapeHtml(notes || 'Geen extra toelichting.');

        const bulletsHtml =
          packageBullets.length > 0
            ? packageBullets
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join('')
            : '<li>Geen pakketinhoud meegestuurd.</li>';

        const html = `
          <div style="font-family: Arial, sans-serif; color: #102c54; line-height: 1.65;">
            <h2 style="margin-bottom: 18px;">Nieuwe promotieaanvraag</h2>

            <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 760px;">
              <tr>
                <td style="font-weight: 700; width: 220px;">Database ID</td>
                <td>${escapeHtml(String(request._id))}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Agent ID</td>
                <td>${escapeHtml(String(user.id))}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Naam makelaar</td>
                <td>${safeContactName}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Kantoornaam</td>
                <td>${safeCompanyName}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">E-mailadres</td>
                <td>${safeEmail}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Telefoonnummer</td>
                <td>${safePhone}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Woningadres</td>
                <td>${safeAddress}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Plaats</td>
                <td>${safeCity}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Pakket</td>
                <td>${safePackageType}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Prijs</td>
                <td>${safePackagePrice}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Pakketcode</td>
                <td>${safePackageKey}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Akkoord</td>
                <td>${
                  agreed
                    ? 'Ja, makelaar heeft akkoord gegeven op kosten en uitvoering.'
                    : 'Niet expliciet meegestuurd.'
                }</td>
              </tr>
            </table>

            <h3 style="margin-top: 28px; margin-bottom: 12px;">Pakketinhoud</h3>
            <ul style="padding-left: 20px; margin-top: 0;">
              ${bulletsHtml}
            </ul>

            <h3 style="margin-top: 28px; margin-bottom: 12px;">Toelichting</h3>
            <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              ${safeNotes}
            </div>
          </div>
        `;

        const text = [
          'Nieuwe promotieaanvraag',
          '',
          `Database ID: ${String(request._id)}`,
          `Agent ID: ${user.id}`,
          `Naam makelaar: ${contactName}`,
          `Kantoornaam: ${companyName || '-'}`,
          `E-mailadres: ${email || '-'}`,
          `Telefoonnummer: ${phone || '-'}`,
          `Woningadres: ${propertyAddress}`,
          `Plaats: ${city}`,
          `Pakket: ${packageType}`,
          `Prijs: ${packagePrice || '-'}`,
          `Pakketcode: ${packageKey || '-'}`,
          `Akkoord: ${
            agreed
              ? 'Ja, makelaar heeft akkoord gegeven op kosten en uitvoering.'
              : 'Niet expliciet meegestuurd.'
          }`,
          '',
          'Pakketinhoud:',
          ...(packageBullets.length > 0
            ? packageBullets.map((item) => `- ${item}`)
            : ['- Geen pakketinhoud meegestuurd.']),
          '',
          `Toelichting: ${notes || 'Geen extra toelichting.'}`,
        ].join('\n');

        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            'Vastgoed Exclusief <onboarding@resend.dev>',
          to: ['info@vastgoedexclusief.nl'],
          replyTo: email || undefined,
          subject: `Nieuwe promotieaanvraag — ${packageType} — ${contactName}`,
          html,
          text,
        });

        emailSent = true;
      } catch (err) {
        console.error('Resend error:', err);
        emailError =
          err instanceof Error
            ? err.message
            : 'Onbekende fout bij verzenden e-mail.';
      }
    } else {
      emailError =
        'RESEND_API_KEY ontbreekt. Aanvraag is wel opgeslagen in de database.';
      console.warn(emailError);
    }

    return NextResponse.json({
      success: true,
      request,
      emailSent,
      emailError: emailError || null,
    });
  } catch (error) {
    console.error('Promotion request route error:', error);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 },
    );
  }
}
