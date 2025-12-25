import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('data')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
        }
        return NextResponse.json(data.data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newConfig = await request.json();
        const { error } = await supabase
            .from('site_config')
            .upsert({ id: 1, data: newConfig });

        if (error) {
            return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}
