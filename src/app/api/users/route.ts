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
    if (!supabase) {
        return NextResponse.json({
            error: 'DATABASE NOT CONFIGURED',
            details: 'Supabase URL or Anon Key is missing in environment variables.'
        }, { status: 500 });
    }

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

        // Handle Signup / Create User
        if (!data.action && data.email) {
            // Check if user exists - more robust check than .single()
            const { data: users, error: checkError } = await supabase
                .from('users')
                .select('email')
                .eq('email', data.email);

            if (checkError) {
                console.error('Error checking existing user:', checkError);
                throw checkError;
            }

            if (users && users.length > 0) {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }

            const newUser = {
                id: `USER-${Date.now()}`,
                email: data.email,
                name: data.name,
                phone: data.phone || '',
                level: 'BASIC MEMBER',
                isElite: false,
                role: 'user',
                createdAt: new Date().toISOString()
            };

            const { error: insertError } = await supabase.from('users').insert(newUser);
            if (insertError) {
                console.error('Supabase insertion error:', insertError);

                // Retry without ID if it's a UUID type mismatch (Error 22P02)
                if (insertError.code === '22P02') {
                    const { id, ...rest } = newUser;
                    const { error: retryError } = await supabase.from('users').insert(rest);
                    if (!retryError) return NextResponse.json({ success: true, user: rest });
                    throw retryError;
                }

                // Handle Generic Column Mismatch (e.g. isElite, phone, etc)
                if (insertError.message.toLowerCase().includes('column') || insertError.code === '42703') {
                    return NextResponse.json({
                        error: 'DATABASE SCHEMA MISMATCH',
                        details: 'Required columns (isElite, phone, level) are missing from your "users" table.'
                    }, { status: 500 });
                }
                throw insertError;
            }

            return NextResponse.json({ success: true, user: newUser });
        }

        if (data.action === 'saveShipping') {
            const { error: shipError } = await supabase
                .from('users')
                .update({ shippingInfo: data.shippingInfo })
                .eq('email', data.email);

            if (shipError) throw shipError;
            return NextResponse.json({ success: true });
        }

        if (data.action === 'updateProfile') {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: data.name,
                    phone: data.phone
                })
                .eq('email', data.email);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Error in users POST API:', error);
        return NextResponse.json({
            error: 'Failed to process request',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
