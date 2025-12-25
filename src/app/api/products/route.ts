import { NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let products = await readData<any>('products');

    if (category) {
        products = products.filter((p: any) => p.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json(products);
}

export async function POST(request: Request) {
    try {
        const product = await request.json();

        // Map to DB columns and remove frontend-only fields
        const dbProduct = {
            id: product.id || `PROD-${Date.now()}`,
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            images: product.images || [],
            description: product.description,
            isTrending: product.isTrending || false,
            isLimited: product.isLimited || false
        };

        const added = await addItem('products', dbProduct);
        return NextResponse.json({ success: true, product: added });
    } catch (error) {
        console.error('API Error adding product:', error);
        return NextResponse.json({ success: false, error: 'Failed to add product' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, ...updates } = await request.json();

        // Clean up updates for DB
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.images !== undefined) dbUpdates.images = updates.images;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.isTrending !== undefined) dbUpdates.isTrending = updates.isTrending;
        if (updates.isLimited !== undefined) dbUpdates.isLimited = updates.isLimited;

        const updated = await updateItem('products', id, dbUpdates);
        if (updated) {
            return NextResponse.json({ success: true, product: updated });
        }
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    } catch (error) {
        console.error('API Error updating product:', error);
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });

        const deleted = await deleteItem('products', id);
        if (deleted) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
}
