// app/legal/verwerkersovereenkomst/page.tsx
import { LegalShell } from '@/components/legal/LegalShell';

export default function DpaPage() {
  return (
    <LegalShell
      title="Verwerkersovereenkomst – Vastgoed Exclusief Dashboard (AVG art. 28)"
      subtitle="Van toepassing indien en voor zover Vastgoed Exclusief persoonsgegevens verwerkt in opdracht van de makelaar/gebruiker binnen het dashboard."
    >
      <h2>1. Partijen</h2>
      <ol>
        <li>
          <strong>Verwerkingsverantwoordelijke</strong>: de Gebruiker/makelaar (de partij die persoonsgegevens invoert en het doel bepaalt).
        </li>
        <li>
          <strong>Verwerker</strong>: Vastgoed Nederland, handelend onder de naam Vastgoed Exclusief (de partij die het dashboard levert).
        </li>
      </ol>

      <h2>2. Onderwerp en duur</h2>
      <ol>
        <li>
          Deze overeenkomst geldt voor de duur van de hoofdrelatie (gebruik van het dashboard) en eindigt bij beëindiging daarvan,
          tenzij wettelijke bewaarplichten anders vereisen.
        </li>
        <li>
          Verwerker verwerkt persoonsgegevens uitsluitend voor het leveren, onderhouden en beveiligen van het dashboard en
          gerelateerde services.
        </li>
      </ol>

      <h2>3. Aard en doel van de verwerking</h2>
      <p>
        De verwerking omvat het hosten, opslaan, beveiligen, doorgeven (aan subverwerkers) en verwerken van gegevens binnen
        de functionaliteiten van het dashboard (inclusief AI-modules), voor zover persoonsgegevens daarin voorkomen.
      </p>

      <h2>4. Categorieën betrokkenen en gegevens</h2>
      <p>Afhankelijk van wat de Gebruiker invoert kunnen betrokkenen en gegevens omvatten:</p>
      <ul>
        <li>(Potentiële) verkopers/klanten van de makelaar;</li>
        <li>Contactpersonen bij bedrijven/partners;</li>
        <li>Accountgebruikers (medewerkers van de makelaar).</li>
      </ul>
      <p>Mogelijke gegevens:</p>
      <ul>
        <li>Naam, e-mail, telefoon, notities, communicatie-inhoud;</li>
        <li>Woningdata die indirect herleidbaar kan zijn;</li>
        <li>Technische gegevens (IP, logs) voor beveiliging en werking.</li>
      </ul>

      <h2>5. Instructies en verantwoordelijkheid</h2>
      <ol>
        <li>Verwerker verwerkt persoonsgegevens uitsluitend op schriftelijke/elektronische instructie van Verwerkingsverantwoordelijke.</li>
        <li>
          Verwerkingsverantwoordelijke garandeert dat er een geldige grondslag is voor de verwerking en dat betrokkenen adequaat zijn geïnformeerd.
        </li>
        <li>
          Verwerkingsverantwoordelijke draagt zorg dat geen bijzondere persoonsgegevens worden ingevoerd, tenzij strikt noodzakelijk en rechtmatig.
        </li>
      </ol>

      <h2>6. Beveiligingsmaatregelen</h2>
      <p>Verwerker neemt passende technische en organisatorische maatregelen, waaronder (indicatief):</p>
      <ul>
        <li>Versleutelde verbindingen (HTTPS/TLS);</li>
        <li>Toegangscontrole en autorisaties;</li>
        <li>Logging en monitoring voor beveiliging;</li>
        <li>Beveiligde cloud-infrastructuur en patches/updates.</li>
      </ul>

      <h2>7. Subverwerkers</h2>
      <ol>
        <li>
          Verwerkingsverantwoordelijke geeft toestemming voor het inschakelen van subverwerkers die noodzakelijk zijn voor het dashboard,
          zoals hosting, database en AI-leveranciers.
        </li>
        <li>
          Verwerker draagt er zorg voor dat subverwerkers contractueel gelijkwaardige verplichtingen krijgen opgelegd.
        </li>
        <li>Een actuele lijst van (categorieën) subverwerkers kan in het dashboard of op verzoek worden verstrekt.</li>
      </ol>

      <h2>8. Datalekken</h2>
      <ol>
        <li>Verwerker meldt een (vermoedelijk) datalek zonder onredelijke vertraging aan Verwerkingsverantwoordelijke.</li>
        <li>Verwerker verstrekt relevante informatie voor melding aan toezichthouder en betrokkenen (waar vereist).</li>
      </ol>

      <h2>9. Assistentie bij rechten van betrokkenen</h2>
      <p>
        Verwerker ondersteunt Verwerkingsverantwoordelijke redelijkerwijs bij verzoeken van betrokkenen (inzage, verwijdering, etc.),
        voor zover Verwerker daartoe in staat is binnen de technische mogelijkheden van het dashboard.
      </p>

      <h2>10. Retourneren en verwijderen</h2>
      <ol>
        <li>
          Na beëindiging van de dienstverlening verwijdert Verwerker persoonsgegevens binnen een redelijke termijn, tenzij wettelijke
          bewaarplichten anders vereisen.
        </li>
        <li>Back-ups kunnen gedurende een beperkte periode blijven bestaan volgens back-upbeleid, waarna automatische overschrijving plaatsvindt.</li>
      </ol>

      <h2>11. Audit en compliance</h2>
      <p>
        Verwerkingsverantwoordelijke kan eenmaal per jaar redelijke informatie opvragen over beveiliging en compliance. Fysieke audits
        zijn alleen na overleg en bij zwaarwegende redenen, om veiligheid en continuïteit te waarborgen.
      </p>

      <h2>12. Aansprakelijkheid</h2>
      <p>
        De aansprakelijkheid in het kader van deze verwerkersovereenkomst volgt de aansprakelijkheidsbepalingen uit de Algemene Voorwaarden,
        tenzij dwingend recht anders bepaalt.
      </p>

      <h2>13. Slotbepalingen</h2>
      <p>
        Op deze overeenkomst is Nederlands recht van toepassing. Bij strijdigheid tussen deze verwerkersovereenkomst en de Algemene Voorwaarden
        prevaleert deze verwerkersovereenkomst voor zover het persoonsgegevens betreft.
      </p>

      <hr />

      <p>
        <strong>Ondertekening / acceptatie</strong>
        <br />
        Deze verwerkersovereenkomst wordt geacht te zijn aanvaard door gebruik van het dashboard door Verwerkingsverantwoordelijke.
      </p>
    </LegalShell>
  );
}
