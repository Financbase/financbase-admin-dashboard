/**
 * Test component to verify mobile/desktop layout detection is working
 */
'use client';

import { useDeviceInfo } from '@/hooks/use-mobile-app';

export default function LayoutTest() {
  const { isMobile, isTablet, isDesktop, isMobileOrTablet, screenSize, orientation } = useDeviceInfo();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Layout Detection Test</h1>
      <div className="space-y-2">
        <p><strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}</p>
        <p><strong>Is Tablet:</strong> {isTablet ? 'Yes' : 'No'}</p>
        <p><strong>Is Desktop:</strong> {isDesktop ? 'Yes' : 'No'}</p>
        <p><strong>Is Mobile or Tablet:</strong> {isMobileOrTablet ? 'Yes' : 'No'}</p>
        <p><strong>Screen Size:</strong> {screenSize}</p>
        <p><strong>Orientation:</strong> {orientation}</p>
      </div>
    </div>
  );
}
