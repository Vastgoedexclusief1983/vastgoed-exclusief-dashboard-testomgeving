import PhotoRestyleClient from '@/components/multimedia/PhotoRestyleClient';

export default function AiMultimediaPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
          Vastgoed Exclusief · AI
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Multimedia</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Restyle woningfoto&apos;s met AI voor een luxere presentatie. Kies een stijl,
          upload een foto en genereer een visuele upgrade. Credits worden per generatie afgeschreven.
        </p>
      </div>

      <PhotoRestyleClient />
    </div>
  );
}
