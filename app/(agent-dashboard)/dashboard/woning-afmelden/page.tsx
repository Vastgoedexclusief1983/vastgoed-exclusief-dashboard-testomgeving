import JotformAfmeldenEmbed from '@/components/dashboard/JotformAfmeldenEmbed';
import WoningAfmeldenClient from '@/components/dashboard/WoningAfmeldenClient';

export default function WoningAfmeldenPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#102c54]">Woning afmelden</h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Meld een woning als verkocht. Deze meldingen blijven zichtbaar in de historie.
      </p>

      <div className="mt-6 space-y-10">
        <JotformAfmeldenEmbed />
        <WoningAfmeldenClient />
      </div>
    </div>
  );
}

