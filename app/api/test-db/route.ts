import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas/users.schema';

export async function GET() {
	try {
		// Try a simple select query
		const result = await db.select().from(users).limit(1);
		return NextResponse.json({ success: true, result });
	} catch (error) {
		console.error('Database test error:', error);
		return NextResponse.json({ error: 'Database connection failed', details: (error as Error).message }, { status: 500 });
	}
}