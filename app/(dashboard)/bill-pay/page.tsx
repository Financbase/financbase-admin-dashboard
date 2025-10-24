/**
 * Bill Pay Page
 * Main page for bill pay automation features
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
