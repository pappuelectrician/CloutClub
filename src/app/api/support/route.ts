import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('support')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch support requests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({
            error: 'DATABASE NOT CONFIGURED',
            details: 'Supabase URL or Anon Key is missing in environment variables.'
        }, { status: 500 });
    }

    try {
        const body = await request.json();
        const id = `SUP-${Date.now()}`;

        // Prepare the data with all relevant fields
        const insertData: any = {
            id: id,
            name: body.name || body.customerName || 'Anonymous',
            email: body.email || body.customerEmail || 'no-email@cloutclub.com',
            phone: body.phone || '',
            reason: body.reason || 'Support',
            message: body.message,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const { error } = await supabase
            .from('support')
            .insert([insertData]);

        if (error) {
            console.error('SUPABASE SUPPORT ERROR:', error);

            // 1. Handle UUID mismatch (Code 22P02)
            if (error.code === '22P02') {
                const { id, ...rest } = insertData;
                const { error: retryError } = await supabase.from('support').insert([rest]);
                if (!retryError) return NextResponse.json({ success: true });
                throw retryError;
            }

            // 2. Handle Schema mismatch (Code 42703 - Column doesn't exist)
            if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
                return NextResponse.json({
                    error: 'DATABASE SCHEMA MISMATCH',
                    details: error.message
                }, { status: 500 });
            }

            return NextResponse.json({
                error: error.message,
                details: error.details,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('SUPPORT API CATCH:', error);
        return NextResponse.json({
            error: 'Failed to submit support request',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('support')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const { error } = await supabase
            .from('support')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
