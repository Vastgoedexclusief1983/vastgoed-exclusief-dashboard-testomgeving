import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const file = body?.file;

    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: 'Geen afbeelding ontvangen.' },
        { status: 400 }
      );
    }

    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: 'vastgoed-exclusief/properties',
      resource_type: 'image',
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    return NextResponse.json(
      { error: 'Upload mislukt.' },
      { status: 500 }
    );
  }
}
