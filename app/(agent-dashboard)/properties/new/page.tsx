import { Card, CardContent } from '@/components/ui/card';
import { PropertyForm } from '@/components/properties/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/30 shadow-[0_25px_80px_rgba(16,44,84,0.16)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/High-end-real-estate-avondfotografie-IMG_6632-1280x720.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#071a33]/28 via-[#0d2a52]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/18 via-transparent to-transparent" />

        <div className="relative flex min-h-[300px] items-end px-8 py-8 lg:min-h-[360px] lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/40 bg-white/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
              Nieuwe woning
            </div>

            <h1 className="mt-4 text-3xl font-semibold text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.28)] md:text-5xl">
              Woning toevoegen
            </h1>

            <p className="mt-3 text-sm text-white/92 drop-shadow-[0_2px_14px_rgba(0,0,0,0.22)] md:text-lg">
              Voeg eenvoudig een nieuwe woning toe aan uw exclusieve portefeuille
            </p>
          </div>
        </div>
      </section>

      <div className="-mt-10 relative z-10 md:-mt-14">
        <Card className="overflow-hidden rounded-[32px] border border-white/55 bg-white/35 shadow-[0_24px_70px_rgba(16,44,84,0.14)] backdrop-blur-2xl">
          <CardContent className="p-4 md:p-6 lg:p-7">
            <div className="rounded-[28px] border border-white/70 bg-white/88 p-4 shadow-[0_10px_40px_rgba(16,44,84,0.06)] backdrop-blur-xl md:p-6 lg:p-8">
              <PropertyForm mode="create" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
