'use client';

import * as React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Info,
  Sparkles,
  MapPin,
  Shield,
  Image as ImageIcon,
  Lightbulb,
  Search,
  BadgeEuro,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  className?: string;
  label?: string;
};

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          <div className="mt-4 text-sm leading-relaxed text-slate-700">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-slate-500" />
      <span className="text-slate-700">{children}</span>
    </li>
  );
}

function ExampleBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</p>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </div>
  );
}

export function DashboardHelpDialog({ className, label = 'Handleiding' }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={['ml-9 mt-1 block text-xs text-white/60 underline hover:text-white', className ?? ''].join(' ')}
        >
          {label}
        </button>
      </DialogTrigger>

      {/* Flex layout: header + scroll content + (compact) footer. Geen overlap. */}
      <DialogContent className="max-w-3xl p-0">
        <div className="flex max-h-[80vh] flex-col">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-slate-700" />
                Handleiding – Vastgoed Exclusief Dashboard
              </DialogTitle>
              <p className="text-sm text-slate-600">
                Praktische workflow en tips om sneller tot een sterke positionering en bandbreedte te komen.
              </p>
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Intro */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <Info className="h-4 w-4 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-slate-900">Waarvoor is dit dashboard bedoeld?</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Dit dashboard ondersteunt makelaars bij een <span className="font-medium">indicatieve</span>{' '}
                    marktinschatting, vergelijkingsanalyse en positionering. Het is{' '}
                    <span className="font-medium">geen</span> officiële taxatie en niet bedoeld als vervanging van
                    professionele beoordeling ter plaatse.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <Section
                icon={<Lightbulb className="h-5 w-5 text-slate-700" />}
                title="Aanpak in 60 seconden (aanbevolen workflow)"
                subtitle="Als je dit volgt, krijg je veel betere output en bespaar je credits."
              >
                <ol className="space-y-2">
                  <li className="text-slate-700">
                    <span className="font-semibold">1) Vul eerst de kerngegevens in:</span> plaats, woningtype, woonoppervlakte,
                    perceel, bouwjaar, energielabel en afwerkingsniveau.
                  </li>
                  <li className="text-slate-700">
                    <span className="font-semibold">2) Kies je doel:</span> vraagprijs bandbreedte, prijs per m² of verkoopstrategie.
                  </li>
                  <li className="text-slate-700">
                    <span className="font-semibold">3) Voeg context toe:</span> ligging (water, vrij uitzicht, A-locatie),
                    staat van onderhoud, doelgroep, bijzonderheden (bijgebouw, wellness, lift, zonnepanelen, etc.).
                  </li>
                  <li className="text-slate-700">
                    <span className="font-semibold">4) Check referenties / positionering:</span> kloppen de vergelijkingen,
                    en is het verhaal logisch voor jouw doelgroep?
                  </li>
                </ol>

                <ExampleBox title="Korte voorbeeldvraag (werkt altijd)">
                  “Geef een vraagprijs bandbreedte voor een vrijstaande villa in <b>Bloemendaal</b>, <b>240 m²</b>,
                  perceel <b>820 m²</b>, bouwjaar <b>2006</b>, energielabel <b>A</b>, luxe afwerking en rustige ligging.
                  Doelgroep: expats en ondernemers. Wat is een realistische positionering en welke USP’s moet ik benadrukken?”
                </ExampleBox>
              </Section>

              <Section
                icon={<Sparkles className="h-5 w-5 text-slate-700" />}
                title="Advies & Inzicht (AI)"
                subtitle="Zo stel je vragen die echt bruikbare output opleveren."
              >
                <ul className="space-y-2">
                  <Bullet>
                    Gebruik concrete input: <span className="font-medium">plaats + m² + type + afwerking + ligging</span>.
                  </Bullet>
                  <Bullet>
                    Vermijd vage vragen (“wat is dit waard?”). Vraag liever om <span className="font-medium">bandbreedte</span>,
                    scenario’s en argumenten.
                  </Bullet>
                  <Bullet>
                    Laat de AI jouw verhaal aanscherpen: USP’s, doelgroep, prijspsychologie, timing en presentatie.
                  </Bullet>
                </ul>

                <ExampleBox title="Pro-tip: 3 scenario’s vragen (sterk voor makelaars)">
                  “Geef 3 scenario’s: <b>conservatief / realistisch / ambitieus</b> inclusief onderbouwing, risico’s, en wat ik
                  anders moet doen qua presentatie/strategie per scenario.”
                </ExampleBox>
              </Section>

              <Section
                icon={<MapPin className="h-5 w-5 text-slate-700" />}
                title="Waarde & Positionering"
                subtitle="Dit onderdeel is bedoeld om de bandbreedte ‘verklaarbaar’ te maken richting verkoper."
              >
                <ul className="space-y-2">
                  <Bullet>
                    Gebruik referenties om je verhaal te onderbouwen: verschillen in ligging, perceel, afwerking en voorzieningen.
                  </Bullet>
                  <Bullet>
                    Focus op <span className="font-medium">positionering</span>: voor wie is deze woning perfect en waarom?
                  </Bullet>
                  <Bullet>
                    Gebruik “luxe tags” (indien aanwezig) om het verschil in kwaliteit/uitstraling snel zichtbaar te maken.
                  </Bullet>
                </ul>

                <ExampleBox title="Handige check voor jezelf">
                  “Als ik 10% hoger ga zitten: welke 3 argumenten zijn écht overtuigend? En wat moet ik verbeteren in fotografie,
                  styling, tekst of timing om dat waar te maken?”
                </ExampleBox>
              </Section>

              <Section
                icon={<ImageIcon className="h-5 w-5 text-slate-700" />}
                title="Woning restylen (Multimedia)"
                subtitle="Gebruik dit als luxe visualisatie, niet als ‘realiteit’."
              >
                <ul className="space-y-2">
                  <Bullet>Ideaal voor lege ruimtes of verouderde interieurs: maak een stijlimpressie voor online presentatie.</Bullet>
                  <Bullet>
                    Zet altijd duidelijk bij restyling: <span className="font-medium">“Impressie”</span>.
                  </Bullet>
                  <Bullet>Gebruik 1 vaste stijl per woning (rust en premium uitstraling).</Bullet>
                </ul>

                <ExampleBox title="Best practice (luxe uitstraling)">
                  Maak 2 varianten: “Modern warm” en “Hotel chic”. Kies daarna één lijn en trek die door in de hele presentatie.
                </ExampleBox>
              </Section>

              <Section
                icon={<BadgeEuro className="h-5 w-5 text-slate-700" />}
                title="AI-credits: zo bespaar je credits"
                subtitle="Slimme input = minder vervolgvragen = sneller resultaat."
              >
                <ul className="space-y-2">
                  <Bullet>Vul de woninggegevens eerst in voordat je vraagt (scheelt veel ‘heen-en-weer’).</Bullet>
                  <Bullet>Vraag in één keer om output in bullets + samenvatting + advies (in plaats van losse vragen).</Bullet>
                  <Bullet>Herhaal niet: refine je vraag met 1 extra detail (ligging/afwerking/doelgroep) en vraag opnieuw.</Bullet>
                </ul>

                <ExampleBox title="Ideale prompt-structuur (kopiëren/plakken)">
                  <div className="space-y-2">
                    <div>
                      <b>Doel:</b> vraagprijs bandbreedte + positionering
                    </div>
                    <div>
                      <b>Woning:</b> plaats, type, m², perceel, bouwjaar, label, afwerking
                    </div>
                    <div>
                      <b>Ligging:</b> buurt, uitzicht, water, rust/druk, voorzieningen
                    </div>
                    <div>
                      <b>Doelgroep:</b> gezinnen / expats / ondernemers / tweede woning
                    </div>
                    <div>
                      <b>Output gewenst:</b> 3 scenario’s + USP’s + verkoopstrategie + risico’s
                    </div>
                  </div>
                </ExampleBox>
              </Section>

              <Section
                icon={<Shield className="h-5 w-5 text-slate-700" />}
                title="Belangrijk (juridisch & professioneel)"
                subtitle="Zodat het voor jou en je kantoor veilig blijft."
              >
                <ul className="space-y-2">
                  <Bullet>
                    Output is <span className="font-medium">indicatief</span> en bedoeld als ondersteuning; geen officiële taxatie.
                  </Bullet>
                  <Bullet>Controleer feiten (m², bouwjaar, label, juridische status) in officiële bronnen.</Bullet>
                  <Bullet>Restyling is een visualisatie: altijd communiceren als “impressie”.</Bullet>
                </ul>
              </Section>
            </div>

            <div className="h-2" />
          </div>

          {/* Compact footer: NIET sticky, dus geen overlap */}
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Sluiten
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
