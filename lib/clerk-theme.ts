/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

// Appearance type is not exported from @clerk/nextjs, define locally if needed
type Appearance = {
	variables?: Record<string, string>;
	elements?: Record<string, any>;
	layout?: {
		socialButtonsPlacement?: "top" | "bottom";
		socialButtonsVariant?: "blockButton" | "iconButton";
		showOptionalFields?: boolean;
	};
};

/**
 * Get Clerk theme colors from CSS variables.
 * Since Clerk variables need hex colors, we convert theme CSS variables at runtime.
 */
function getClerkThemeColors() {
  // Only compute on client-side
  if (typeof window === 'undefined') {
    // SSR fallback - return default colors matching theme defaults
    // Financbase Blue: rgb(43, 57, 143) / #2b398f / hsl(231.6 54% 36%)
    return {
      colorPrimary: '#2b398f', // Financbase brand blue from globals.css
      colorBackground: '#ffffff', // --background
      colorInputBackground: '#f9fafb', // --input
      colorInputText: '#111827', // --foreground
      colorText: '#374151', // --foreground muted
      colorTextSecondary: '#6b7280', // --muted-foreground
      colorDanger: '#dc2626', // --destructive
      colorSuccess: '#059669', // chart-2 (green) as success
    };
  }

  // Client-side: Import and use theme color utilities
  try {
    // Dynamic import to avoid SSR issues
    const { getThemeRgb, getChartColor, rgbToHex } = require('@/lib/utils/theme-colors');
    
    return {
      colorPrimary: rgbToHex(getThemeRgb('--primary')),
      colorBackground: rgbToHex(getThemeRgb('--background')),
      colorInputBackground: rgbToHex(getThemeRgb('--input')),
      colorInputText: rgbToHex(getThemeRgb('--foreground')),
      colorText: rgbToHex(getThemeRgb('--foreground')),
      colorTextSecondary: rgbToHex(getThemeRgb('--muted-foreground')),
      colorDanger: rgbToHex(getThemeRgb('--destructive')),
      colorSuccess: rgbToHex(getChartColor(2)), // chart-2 (green) as success
    };
  } catch (error) {
    console.warn('Failed to load theme colors for Clerk, using fallback:', error);
    // Fallback to defaults - Financbase Blue
    return {
      colorPrimary: '#2b398f', // Financbase brand blue
      colorBackground: '#ffffff',
      colorInputBackground: '#f9fafb',
      colorInputText: '#111827',
      colorText: '#374151',
      colorTextSecondary: '#6b7280',
      colorDanger: '#dc2626',
      colorSuccess: '#059669',
    };
  }
}

export const clerkTheme: Appearance = {
  elements: {
    // Root container
    rootBox: "mx-auto w-full",
    
    // Main card container
    card: "bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl",
    
    // Header elements
    headerTitle: "text-2xl font-bold text-gray-900",
    headerSubtitle: "text-gray-600 text-base",
    
    // Form elements
    formButtonPrimary: 
      "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-11 px-6 transition-colors duration-200",
    
    formButtonSecondary:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium rounded-lg h-11 px-6 transition-colors duration-200",
    
    // Input fields
    formFieldInput:
      "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    
    // Labels
    formFieldLabel: "text-sm font-medium text-gray-700",
    
    // Links
    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium transition-colors",
    identityPreviewText: "text-gray-600",
    
    // Social buttons
    socialButtonsBlockButton:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg h-12 flex items-center justify-center gap-3 font-medium transition-colors duration-200",
    
    socialButtonsBlockButtonText: "text-sm font-medium",
    
    // Divider
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-500 text-xs",
    
    // Footer
    footer: "text-center",
    footerText: "text-sm text-gray-600",
    
    // Error states
    formFieldErrorText: "text-red-600 text-sm",
    formFieldWarningText: "text-yellow-600 text-sm",
    
    // Loading states
    spinner: "text-blue-600",
    
    // Alternative methods
    alternativeMethodsBlockButton:
      "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors",
    
    // Form resend code
    formResendCodeLink: "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors",
    
    // Form field success
    formFieldSuccessText: "text-green-600 text-sm",
    
    // Form field input show password button
    // Security: This is a CSS class name (formFieldInputShowPasswordButton), not a hardcoded password
    // False positive from security scanners - this is Clerk's component prop name for styling
    // The word "password" in the property name refers to the password input field, not an actual password value
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formFieldInputShowPasswordButton:
      "text-gray-400 hover:text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3",
  },
  
  // Layout configuration
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
  },
  
  // Variables for custom styling - using theme colors from globals.css
  variables: {
    ...getClerkThemeColors(),
    borderRadius: "0.5rem", // rounded-lg
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  },
};
