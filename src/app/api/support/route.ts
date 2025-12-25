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
    try {
        const body = await request.json();
        const id = `SUP-${Date.now()}`;

        // We use an object with all potential column names to be safe
        const insertData = {
            id: id,
            name: body.name || body.customerName || 'Anonymous',
            email: body.email || body.customerEmail || 'no-email@cloutclub.com',
            phone: body.phone || '',
            reason: body.reason || 'Support',
            message: body.message,
            status: 'pending' // Matches existing data
        };

        const { error } = await supabase
            .from('support')
            .insert([insertData]);

        if (error) {
            console.error('SUPABASE SUPPORT ERROR:', error);
            return NextResponse.json({
                error: error.message,
                details: error.details
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('SUPPORT API CATCH:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit support request' }, { status: 500 });
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
