import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { headers } from 'next/headers'; // Temporarily disabled

// GET /api/dashboard/top-products - Get top revenue generating services/products
export async function GET(request: NextRequest) {
	try {
		// TEMPORARILY DISABLED FOR TESTING
		// const headersList = await headers();
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sortBy = searchParams.get('sortBy') || 'sales';
		const limit = parseInt(searchParams.get('limit') || '5');

		// Get top revenue generating items (mock data for now since we don't have services/products schema)
		const baseProducts = [
			{ name: 'Financial Consulting', sales: 45, revenue: 225000 },
			{ name: 'Tax Preparation', sales: 32, revenue: 96000 },
			{ name: 'Bookkeeping Services', sales: 28, revenue: 84000 },
			{ name: 'Audit Services', sales: 12, revenue: 180000 },
			{ name: 'CFO Services', sales: 8, revenue: 240000 },
			{ name: 'Payroll Management', sales: 15, revenue: 45000 },
			{ name: 'Business Planning', sales: 6, revenue: 30000 }
		];

		// Sort products based on sortBy parameter
		let sortedProducts = [...baseProducts];
		switch (sortBy) {
			case 'revenue':
				sortedProducts.sort((a, b) => b.revenue - a.revenue);
				break;
			case 'growth':
				// For growth, we'll sort by a combination of sales and revenue
				sortedProducts.sort((a, b) => (b.sales * b.revenue) - (a.sales * a.revenue));
				break;
			case 'sales':
			default:
				sortedProducts.sort((a, b) => b.sales - a.sales);
				break;
		}

		// Limit results
		sortedProducts = sortedProducts.slice(0, limit);

		return NextResponse.json({ products: sortedProducts });

	} catch (error) {
		console.error('Error fetching top products:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch top products' },
			{ status: 500 }
		);
	}
}
