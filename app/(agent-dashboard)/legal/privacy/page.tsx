// app/legal/privacy/page.tsx
import { LegalShell } from '@/components/legal/LegalShell';

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacyverklaring – Vastgoed Exclusief Dashboard"
      subtitle="Deze privacyverklaring beschrijft hoe Vastgoed Exclusief (Vastgoed Nederland) persoonsgegevens verwerkt binnen het dashboard."
    >
      <h2>1. Wie is verantwoordelijk?</h2>
      <p>
        <strong>Vastgoed Exclusief</strong> is een handelsnaam van <strong>Vastgoed Nederland</strong> (hierna: “Wij”).
        Wij zijn verwerkingsverantwoordelijke voor persoonsgegevens die wij verwerken voor accountbeheer, beveiliging en
        dienstverlening binnen het dashboard.
      </p>

      <h2>2. Welke persoonsgegevens verwerken wij?</h2>
      <p>Wij kunnen de volgende gegevens verwerken:</p>
      <ul>
        <li>Accountgegevens: naam, e-mailadres, bedrijfsnaam, (optioneel) telefoonnummer;</li>
        <li>Authenticatie- en beveiligingsgegevens: loginmomenten, IP-adres, device-/browsergegevens;</li>
        <li>Gebruiksgegevens: welke onderdelen van het dashboard worden gebruikt (telemetrie/logging);</li>
        <li>Facturatiegegevens (indien van toepassing): factuuradres, btw-nummer, betaalstatus.</li>
      </ul>

      <h2>3. Woningdata en (mogelijk) persoonsgegevens</h2>
      <p>
        Binnen het dashboard kan Gebruiker woningdata invoeren (adres, kenmerken, foto’s). In principe zijn woninggegevens
        niet altijd “persoonsgegevens”, maar combinaties kunnen soms indirect herleidbaar zijn. Indien Gebruiker in het
        dashboard óók persoonsgegevens invoert (bijv. verkoperscontact), dan verwerken wij die gegevens in opdracht van
        Gebruiker (zie Verwerkersovereenkomst).
      </p>

      <h2>4. Doeleinden en grondslagen</h2>
      <p>Wij verwerken persoonsgegevens voor:</p>
      <ul>
        <li><strong>Uitvoering van de overeenkomst</strong>: toegang tot dashboard, support, accountbeheer;</li>
        <li><strong>Gerechtvaardigd belang</strong>: beveiliging, fraudepreventie, kwaliteitsverbetering;</li>
        <li><strong>Wettelijke verplichting</strong>: administratie en fiscale bewaarplichten (waar relevant).</li>
      </ul>

      <h2>5. AI-verwerking</h2>
      <p>
        Voor AI-functionaliteiten kunnen inputgegevens (door Gebruiker ingevoerd) worden verwerkt om output te genereren.
        Gebruiker is verantwoordelijk voor de inhoud van de input. Wij adviseren om geen onnodige persoonsgegevens in
        AI-prompts op te nemen.
      </p>

      <h2>6. Bewaartermijnen</h2>
      <ul>
        <li>Account- en gebruiksdata: zolang het account actief is en maximaal [..] maanden na beëindiging (tenzij langer vereist);</li>
        <li>Facturatie/administratie: volgens wettelijke bewaartermijnen (veelal 7 jaar).</li>
      </ul>

      <h2>7. Delen met derden (subverwerkers)</h2>
      <p>
        Wij gebruiken leveranciers die (mogelijk) persoonsgegevens verwerken, zoals hosting en database. Voor het dashboard
        kan dit omvatten:
      </p>
      <ul>
        <li>Hosting/infra: Vercel (of gelijkwaardig);</li>
        <li>Database: MongoDB Atlas (of gelijkwaardig);</li>
        <li>AI-leverancier: OpenAI (of gelijkwaardig).</li>
      </ul>
      <p>
        Waar gegevens buiten de EER kunnen worden verwerkt, treffen wij passende waarborgen (zoals standaardcontractbepalingen),
        voor zover vereist.
      </p>

      <h2>8. Beveiliging</h2>
      <p>
        Wij nemen passende technische en organisatorische maatregelen, waaronder toegangscontrole, logging, versleutelde
        verbindingen (HTTPS) en beveiligingsmaatregelen bij onze cloudleveranciers.
      </p>

      <h2>9. Jouw rechten</h2>
      <p>Je hebt het recht op inzage, correctie, verwijdering, beperking, bezwaar en dataportabiliteit (waar van toepassing).</p>
      <p>
        Verzoeken kun je sturen naar: <strong>[privacy@vastgoedexclusief.nl]</strong> (vul aan). We reageren doorgaans binnen 30 dagen.
      </p>

      <h2>10. Klachten</h2>
      <p>
        Je kunt een klacht indienen bij ons of bij de Autoriteit Persoonsgegevens (AP).
      </p>

      <h2>11. Wijzigingen</h2>
      <p>
        Wij kunnen deze privacyverklaring wijzigen. De meest recente versie is altijd beschikbaar via het dashboard.
      </p>

      <hr />

      <p>
        <strong>Contact</strong> (vul aan):
        <br />
        Vastgoed Nederland (h.o.d.n. Vastgoed Exclusief) — KvK: [..] — Vestigingsadres: [..] — E-mail: [..]
      </p>
    </LegalShell>
  );
}
