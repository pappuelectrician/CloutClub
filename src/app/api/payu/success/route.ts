import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateItem } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        const {
            status, txnid, amount, productinfo, firstname, email, hash,
            udf1, udf2, udf3, udf4, udf5, key
        } = data;

        const salt = process.env.PAYU_SALT;
        if (!salt) throw new Error('Salt not configured');

        // salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
        const hashString = `${salt}|${status}||||||${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

        if (calculatedHash !== hash) {
            console.error('Hash mismatch!', { calculatedHash, hash });
            return NextResponse.redirect(new URL('/checkout?error=hash_mismatch', request.url), 303);
        }

        if (status === 'success') {
            // Update order status in DB
            await updateItem('orders', txnid, { status: 'PAID' });
            return NextResponse.redirect(new URL(`/checkout?step=3&txnid=${txnid}`, request.url), 303);
        } else {
            await updateItem('orders', txnid, { status: 'FAILED' });
            return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url), 303);
        }
    } catch (error) {
        console.error('PayU Success Callback Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=callback_error', request.url), 303);
    }
}
