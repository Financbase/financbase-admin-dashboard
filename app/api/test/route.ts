import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			message: 'API is working',
			timestamp: new Date().toISOString(),
			url: request.url
		});
	} catch (error) {
		console.error('API error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
