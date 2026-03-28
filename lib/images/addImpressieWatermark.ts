import sharp from 'sharp';
import path from 'path';

export async function addImpressieWatermark(
  inputBuffer: Buffer,
  options: { margin?: number } = {}
): Promise<Buffer> {
  const { margin = 28 } = options;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Kan afbeeldingsgrootte niet uitlezen.');
  }

  const width = metadata.width;
  const height = metadata.height;

  const watermarkPath = path.join(process.cwd(), 'public', 'watermark-impressie.png');
  const watermark = sharp(watermarkPath);

  const wmMeta = await watermark.metadata();

  if (!wmMeta.width || !wmMeta.height) {
    throw new Error('Watermark kon niet geladen worden.');
  }

  const targetWidth = Math.round(width * 0.18);

  const resizedWatermark = await watermark
    .resize({ width: targetWidth })
    .png()
    .toBuffer();

  const wmHeight = Math.round((wmMeta.height / wmMeta.width) * targetWidth);

  const left = width - targetWidth - margin;
  const top = height - wmHeight - margin;

  return await image
    .composite([
      {
        input: resizedWatermark,
        top,
        left,
      },
    ])
    .png()
    .toBuffer();
}
