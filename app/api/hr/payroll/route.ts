import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const period = searchParams.get('period') || undefined;

    // Mock payroll data - in production, this would come from your payroll service
    const payrollRuns = [
      {
        id: 'PAY-2024-01',
        name: 'January 2024 Payroll',
        period: '2024-01-01 to 2024-01-31',
        status: 'completed',
        totalEmployees: 47,
        totalGrossPay: 285000,
        totalDeductions: 45000,
        totalNetPay: 240000,
        totalTaxes: 35000,
        totalBenefits: 10000,
        processedAt: '2024-02-01T10:00:00Z',
        paymentDate: '2024-02-02',
        createdBy: 'HR Admin',
        notes: 'Regular monthly payroll processing'
      },
      {
        id: 'PAY-2024-02',
        name: 'February 2024 Payroll',
        period: '2024-02-01 to 2024-02-29',
        status: 'completed',
        totalEmployees: 47,
        totalGrossPay: 285000,
        totalDeductions: 45000,
        totalNetPay: 240000,
        totalTaxes: 35000,
        totalBenefits: 10000,
        processedAt: '2024-03-01T10:00:00Z',
        paymentDate: '2024-03-01',
        createdBy: 'HR Admin',
        notes: 'Regular monthly payroll processing'
      },
      {
        id: 'PAY-2024-03',
        name: 'March 2024 Payroll',
        period: '2024-03-01 to 2024-03-31',
        status: 'processing',
        totalEmployees: 47,
        totalGrossPay: 285000,
        totalDeductions: 45000,
        totalNetPay: 240000,
        totalTaxes: 35000,
        totalBenefits: 10000,
        processedAt: null,
        paymentDate: '2024-04-01',
        createdBy: 'HR Admin',
        notes: 'Currently processing payroll'
      },
      {
        id: 'PAY-2024-Q1-BONUS',
        name: 'Q1 2024 Bonus',
        period: '2024-01-01 to 2024-03-31',
        status: 'draft',
        totalEmployees: 47,
        totalGrossPay: 50000,
        totalDeductions: 8000,
        totalNetPay: 42000,
        totalTaxes: 12000,
        totalBenefits: 0,
        processedAt: null,
        paymentDate: '2024-04-15',
        createdBy: 'HR Admin',
        notes: 'Quarterly performance bonus'
      }
    ];

    const employeePayroll = [
      {
        id: 'EMP-001',
        employeeId: 'EMP-001',
        name: 'Sarah Johnson',
        department: 'Engineering',
        position: 'Senior Developer',
        grossPay: 9500,
        deductions: {
          federalTax: 1900,
          stateTax: 475,
          socialSecurity: 589,
          medicare: 138,
          healthInsurance: 300,
          retirement401k: 950,
          other: 0
        },
        netPay: 5148,
        hourlyRate: 95,
        hoursWorked: 100,
        overtimeHours: 0,
        overtimePay: 0,
        bonus: 0,
        status: 'paid'
      },
      {
        id: 'EMP-002',
        employeeId: 'EMP-002',
        name: 'Mike Chen',
        department: 'Product',
        position: 'Product Manager',
        grossPay: 11000,
        deductions: {
          federalTax: 2200,
          stateTax: 550,
          socialSecurity: 682,
          medicare: 160,
          healthInsurance: 300,
          retirement401k: 1100,
          other: 0
        },
        netPay: 6008,
        hourlyRate: 110,
        hoursWorked: 100,
        overtimeHours: 0,
        overtimePay: 0,
        bonus: 0,
        status: 'paid'
      },
      {
        id: 'EMP-003',
        employeeId: 'EMP-003',
        name: 'Emily Rodriguez',
        department: 'Design',
        position: 'UX Designer',
        grossPay: 8500,
        deductions: {
          federalTax: 1700,
          stateTax: 425,
          socialSecurity: 527,
          medicare: 123,
          healthInsurance: 300,
          retirement401k: 850,
          other: 0
        },
        netPay: 4575,
        hourlyRate: 85,
        hoursWorked: 100,
        overtimeHours: 0,
        overtimePay: 0,
        bonus: 0,
        status: 'paid'
      }
    ];

    const payrollStats = {
      totalRuns: payrollRuns.length,
      completedRuns: payrollRuns.filter(run => run.status === 'completed').length,
      processingRuns: payrollRuns.filter(run => run.status === 'processing').length,
      draftRuns: payrollRuns.filter(run => run.status === 'draft').length,
      totalEmployees: 47,
      totalGrossPay: 285000,
      totalNetPay: 240000,
      totalTaxes: 35000,
      totalDeductions: 45000,
      averageGrossPay: 6064,
      averageNetPay: 5106,
      monthlyTrend: [
        { month: 'Jan 2024', grossPay: 285000, netPay: 240000 },
        { month: 'Feb 2024', grossPay: 285000, netPay: 240000 },
        { month: 'Mar 2024', grossPay: 285000, netPay: 240000 }
      ]
    };

    const filteredRuns = payrollRuns.filter(run => {
      if (status && run.status !== status) return false;
      if (period && !run.period.includes(period)) return false;
      return true;
    });

    const paginatedRuns = filteredRuns.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      payrollRuns: paginatedRuns,
      employeePayroll,
      stats: payrollStats,
      pagination: {
        page,
        limit,
        total: filteredRuns.length,
        pages: Math.ceil(filteredRuns.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, payrollRunId, employeeIds } = body;

    switch (action) {
      case 'process':
        // Process payroll run
        return NextResponse.json({ 
          message: 'Payroll processing initiated',
          payrollRunId: payrollRunId || 'PAY-2024-04'
        });

      case 'approve':
        // Approve payroll run
        return NextResponse.json({ 
          message: 'Payroll run approved',
          payrollRunId
        });

      case 'reject':
        // Reject payroll run
        return NextResponse.json({ 
          message: 'Payroll run rejected',
          payrollRunId
        });

      case 'export':
        // Export payroll data
        return NextResponse.json({ 
          message: 'Payroll data exported',
          downloadUrl: '/api/hr/payroll/export'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing payroll action:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll action' },
      { status: 500 }
    );
  }
}
