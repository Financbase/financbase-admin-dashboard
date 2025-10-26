import type { Appearance } from "@clerk/nextjs";

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
    formFieldInputShowPasswordButton:
      "text-gray-400 hover:text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3",
  },
  
  // Layout configuration
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
  },
  
  // Variables for custom styling
  variables: {
    colorPrimary: "#2563eb", // blue-600
    colorBackground: "#ffffff",
    colorInputBackground: "#f9fafb", // gray-50
    colorInputText: "#111827", // gray-900
    colorText: "#374151", // gray-700
    colorTextSecondary: "#6b7280", // gray-500
    colorDanger: "#dc2626", // red-600
    colorSuccess: "#059669", // green-600
    borderRadius: "0.5rem", // rounded-lg
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  },
};
