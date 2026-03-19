import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
        return NextResponse.json({ success: false }, { status: 400 });
    }

    const appPassword = process.env.APP_PASSWORD;
    if (!appPassword) {
        console.error('APP_PASSWORD not set in environment');
        return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    return NextResponse.json({ success: password === appPassword });
}
