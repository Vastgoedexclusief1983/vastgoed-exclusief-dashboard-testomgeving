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
          className="ml-9 mt-1 block text-xs text-white/60 underline hover:text-white"
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
          waardes en alle bijbehorende inzichten zijn uitsluitend indicatief
          van aard en bedoeld als ondersteunend hulpmiddel voor de
          professionele gebruiker (makelaar).
          <br />
          <br />
          De uitkomsten zijn gebaseerd op door de makelaar ingevoerde
          gegevens, beschikbare marktinformatie en geautomatiseerde
          analyses. Vastgoed Exclusief geeft geen garanties ten aanzien van
          de juistheid, volledigheid of actualiteit van deze informatie.
          <br />
          <br />
          Het woningrapport vormt nadrukkelijk geen taxatie en kan niet
          worden aangemerkt als een taxatierapport in de zin van de
          NRVT-richtlijnen of andere geldende taxatiestandaarden.
          <br />
          <br />
          De makelaar blijft te allen tijde volledig zelf verantwoordelijk
          voor het gebruik, de interpretatie en de toepassing van de
          resultaten richting opdrachtgevers en derden. Aan de uitkomsten
          kunnen geen rechten worden ontleend. Vastgoed Exclusief aanvaardt
          geen enkele aansprakelijkheid voor directe of indirecte schade
          voortvloeiend uit het gebruik van dit dashboard of de
          gegenereerde rapportages.
        </p>
      </DialogContent>
    </Dialog>
  );
}
