import { NextResponse } from 'next/server';
import { readData, addItem, deleteItem } from '@/lib/db';

export async function GET() {
    try {
        const requests = await readData('support_requests');
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch support requests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newRequest = {
            id: `SUP-${Date.now()}`,
            ...body,
            status: 'PENDING',
            date: new Date().toISOString()
        };
        await addItem('support_requests', newRequest);
        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit support request' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await deleteItem('support_requests', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}
