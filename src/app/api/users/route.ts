import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersPath = path.join(process.cwd(), 'data/users.json');

async function getUsers() {
    try {
        const data = await fs.readFile(usersPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const users = await getUsers();

    if (email) {
        const user = users.find((u: any) => u.email === email);
        return NextResponse.json(user || null);
    }

    return NextResponse.json(users);
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const users = await getUsers();

        if (data.action === 'toggleElite') {
            const updatedUsers = users.map((u: any) =>
                u.email === data.email ? { ...u, isElite: !u.isElite, level: !u.isElite ? 'ELITE MEMBER' : 'BASIC MEMBER' } : u
            );
            await fs.writeFile(usersPath, JSON.stringify(updatedUsers, null, 2));
            return NextResponse.json({ success: true });
        }

        if (data.action === 'saveShipping') {
            const updatedUsers = users.map((u: any) =>
                u.email === data.email ? { ...u, shippingInfo: data.shippingInfo } : u
            );
            await fs.writeFile(usersPath, JSON.stringify(updatedUsers, null, 2));
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
