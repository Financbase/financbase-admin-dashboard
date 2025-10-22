import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	return NextResponse.json({ message: 'Simple test API works' });
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	return NextResponse.json({ message: 'Simple POST works', data: body });
}
