import { NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const orderData = await request.json();
        const newOrder = {
            ...orderData,
            id: `CLOUT-${Math.floor(Math.random() * 90000) + 10000}`,
            createdAt: new Date().toISOString(),
            status: 'PENDING'
        };

        await addItem('orders', newOrder);

        return NextResponse.json({ success: true, order: newOrder });
    } catch (error: any) {
        console.error('Order creation failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to place order: ' + (error.message || JSON.stringify(error)) }, { status: 500 });
    }
}

export async function GET() {
    const orders = await readData('orders');
    return NextResponse.json(orders);
}

export async function PUT(request: Request) {
    try {
        const { id, ...updates } = await request.json();
        const updated = await updateItem('orders', id, updates);

        if (updated) {
            return NextResponse.json({ success: true, order: updated });
        }
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });

        const deleted = await deleteItem('orders', id);
        if (deleted) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
    }
}
