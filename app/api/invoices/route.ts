import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Invoices API works - completely new' });
}

export async function POST() {
  return NextResponse.json({ message: 'Invoice created - completely new' });
}
