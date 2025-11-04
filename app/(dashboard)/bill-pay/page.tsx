/**
 * Bill Pay Page
 * Main page for bill pay automation features
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Metadata } from 'next';
import BillPayDashboard from '@/components/bill-pay/bill-pay-dashboard';

export const metadata: Metadata = {
  title: 'Bill Pay Automation | FinancBase',
  description: 'Automated bill processing, vendor management, and payment workflows',
};

export default function BillPayPage() {
  return <BillPayDashboard />;
}
