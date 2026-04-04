'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DisclaimerDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Disclaimer
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Disclaimer woningrapport (makelaar)</DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Het via dit dashboard gegenereerde woningrapport, de weergegeven
          waardes en alle bijbehorende inzichten zijn uitsluitend indicatief van
          aard en bedoeld als ondersteunend hulpmiddel voor de professionele
          gebruiker (makelaar).
          <br />
          <br />
          De uitkomsten zijn gebaseerd op door de makelaar ingevoerde gegevens,
          gekozen kenmerken en een geautomatiseerde waarderingsmethodiek.
          Vastgoed Exclusief geeft geen garanties ten aanzien van juistheid,
          volledigheid, actualiteit of geschiktheid voor een specifiek doel.
          <br />
          <br />
          Het woningrapport vormt geen officiële taxatie, bindend waardeoordeel,
          financieel advies of juridisch advies. Voor een formele waardebepaling
          of taxatie dient altijd een erkend taxateur of andere bevoegde
          specialist te worden ingeschakeld.
          <br />
          <br />
          Door gebruik te maken van deze functionaliteit erkent de gebruiker dat
          Vastgoed Exclusief niet aansprakelijk is voor directe of indirecte
          schade, beslissingen of gevolgen die voortvloeien uit het gebruik van
          de gegenereerde informatie of rapportages.
        </p>
      </DialogContent>
    </Dialog>
  );
}
