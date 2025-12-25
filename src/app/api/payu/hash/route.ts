import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('PAYU HASH REQUEST BODY:', body);

        const { txnid, amount, productinfo, firstname, email } = body;

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        if (!key || !salt) {
            console.error('PAYU ERROR: Keys missing in env');
            return NextResponse.json({ error: 'PayU keys not configured on server' }, { status: 500 });
        }

        // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
        const udf1 = body.udf1 || '';
        const udf2 = body.udf2 || '';
        const udf3 = body.udf3 || '';
        const udf4 = body.udf4 || '';
        const udf5 = body.udf5 || '';

        const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
        console.log('GENERATING HASH FOR STRING:', hashString.replace(salt, '***SALT***'));

        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        const actionUrl = process.env.PAYU_ENV === 'production'
            ? 'https://secure.payu.in/_payment'
            : 'https://test.payu.in/_payment';

        return NextResponse.json({
            hash,
            key,
            actionUrl,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            udf1, udf2, udf3, udf4, udf5
        });
    } catch (error: any) {
        console.error('Hash generation error:', error);
        return NextResponse.json({ error: 'Failed to generate hash: ' + error.message }, { status: 500 });
    }
}
