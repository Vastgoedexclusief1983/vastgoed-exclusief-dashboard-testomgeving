import { Card, CardContent } from '@/components/ui/card';
import { PropertyForm } from '@/components/properties/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div className="space-y-8 pb-6">
      
      {/* HERO IMAGE */}
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 shadow-[0_25px_80px_rgba(16,44,84,0.25)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/Schermafbeelding%202026-04-03%20162845.jpg')",
          }}
        />

        {/* subtiele overlay voor leesbaarheid */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a33]/55 via-[#0d2a52]/20 to-[#102c54]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/50 via-transparent to-transparent" />

        <div className="relative min-h-[280px] px-8 py-8 lg:min-h-[340px] lg:px-10 lg:py-10 flex items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              Nieuwe woning
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
              Woning toevoegen
            </h1>

            <p className="mt-2 text-white/80 text-sm md:text-base">
              Voeg eenvoudig een nieuwe woning toe aan uw exclusieve portefeuille
            </p>
          </div>
        </div>
      </section>

      {/* FORM OVER HERO (premium effect) */}
      <div className="-mt-12 relative z-10 md:-mt-16">
        <Card className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0d213d]/75 shadow-[0_24px_70px_rgba(16,44,84,0.30)] backdrop-blur-2xl">
          
          <CardContent className="p-6 md:p-8">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md">
              
              {/* JOUW BESTAANDE FORM */}
              <PropertyForm mode="create" />

            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  );
}
