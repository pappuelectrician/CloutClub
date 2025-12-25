import { NextResponse } from 'next/server';
import { updateItem } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const txnid = formData.get('txnid') as string;

        if (txnid) {
            await updateItem('orders', txnid, { status: 'FAILED' });
        }

        return NextResponse.redirect(new URL('/checkout?error=payment_cancelled', request.url), 303);
    } catch (error) {
        console.error('PayU Failure Callback Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=callback_error', request.url), 303);
    }
}
