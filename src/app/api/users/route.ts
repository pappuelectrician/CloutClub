import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    try {
        if (email) {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                console.error('Supabase error fetching user by email:', error);
                return NextResponse.json(null);
            }
            return NextResponse.json(user);
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Supabase error fetching users:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error in users GET API:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (data.action === 'toggleElite') {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('isElite')
                .eq('email', data.email)
                .single();

            if (fetchError) throw fetchError;

            const isElite = !user.isElite;
            const { error } = await supabase
                .from('users')
                .update({ isElite, level: isElite ? 'ELITE MEMBER' : 'BASIC MEMBER' })
                .eq('email', data.email);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (data.action === 'saveShipping') {
            const { error } = await supabase
                .from('users')
                .update({ shippingInfo: data.shippingInfo })
                .eq('email', data.email);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in users POST API:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
