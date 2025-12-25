import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

        // Upload to Supabase Storage
        // Make sure to create a bucket named 'uploads' and set it to public
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('SUPABASE STORAGE ERROR:', error.message, error);
            return NextResponse.json({
                error: `Supabase upload error: ${error.message}. Make sure the 'uploads' bucket exists and is public.`
            }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filename);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
