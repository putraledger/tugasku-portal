import { NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Berkas tidak ditemukan dalam formulir.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Attempting upload to Supabase Storage...');
      const supabaseUrl = await uploadToSupabase(buffer, file.name, file.type);
      if (supabaseUrl) {
        return NextResponse.json({
          message: 'Berkas berhasil diunggah ke Supabase.',
          fileUrl: supabaseUrl,
          source: 'supabase',
        });
      }
      console.warn('Supabase upload failed, falling back to local storage.');
    }

    // 2. Local fallback storage
    console.log('Using local fallback storage...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file to local disk
    fs.writeFileSync(filePath, buffer);
    const localUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      message: 'Berkas berhasil diunggah (Penyimpanan Lokal Fallback).',
      fileUrl: localUrl,
      source: 'local',
    });
  } catch (error: any) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah berkas: ' + error.message },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
