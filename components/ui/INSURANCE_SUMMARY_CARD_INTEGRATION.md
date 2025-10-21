# Insurance Summary Card Integration Guide

## Overview

The `InsuranceSummaryCard` component displays a beautiful, animated card showing key insurance policy information including coverage amount, premium, and expiry details. It's perfect for displaying insurance policies in dashboards and overview pages.

## Component Location

```text
📁 /components/ui/insurance-summary-card.tsx
```

## Features

- ✨ **Animated hover effects** with Framer Motion
- 🎨 **Customizable gradients** for different insurance types
- 💡 **Tooltip support** for additional information
- 📊 **Progress visualization** for coverage usage
- 🔘 **Interactive manage button** with custom actions
- 📱 **Responsive design** that works on all screen sizes

## Basic Usage

```tsx
import { InsuranceSummaryCard } from "@/components/ui/insurance-summary-card"
import { Car, HeartPulse, Umbrella } from "lucide-react"

const InsuranceDashboard = () => {
  const handleManagePolicy = (policyId: string) => {
    // Navigate to policy management page
    router.push(`/insurance/policies/${policyId}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InsuranceSummaryCard
        title="Car Insurance"
        policyNumber="CAR-90871-AB"
        insuredAmount="₹12,00,000"
        premiumAmount="₹9,500/year"
        coveragePercent={70}
        expiryDate="15 Dec 2025"
        insuranceType="Vehicle Protection"
        icon={<Car className="h-5 w-5 text-white" />}
        tooltipText="Covers accidental damage and third-party liability"
        gradientFrom="from-blue-500"
        gradientTo="to-cyan-500"
        onManage={() => handleManagePolicy("policy-id")}
      />
    </div>
  )
}
```

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | The policy title/name |
| `policyNumber` | `string` | ✅ | Unique policy identifier |
| `insuredAmount` | `string` | ✅ | Total insured amount (formatted) |
| `premiumAmount` | `string` | ✅ | Premium amount per period |
| `coveragePercent` | `number` | ✅ | Coverage usage percentage (0-100) |
| `expiryDate` | `string` | ✅ | Policy expiry date |
| `insuranceType` | `string` | ✅ | Type of insurance (e.g., "Vehicle Protection") |
| `icon` | `React.ReactNode` | ❌ | Custom icon component (default: ShieldCheck) |
| `onManage` | `() => void` | ❌ | Callback when manage button is clicked |
| `tooltipText` | `string` | ❌ | Tooltip content (default: generic message) |
| `gradientFrom` | `string` | ❌ | Tailwind gradient start class |
| `gradientTo` | `string` | ❌ | Tailwind gradient end class |
| `className` | `string` | ❌ | Additional CSS classes |

## Customization Examples

### Different Insurance Types

```tsx
// Car Insurance - Blue theme
<InsuranceSummaryCard
  title="Car Insurance"
  policyNumber="CAR-90871-AB"
  insuredAmount="₹12,00,000"
  premiumAmount="₹9,500/year"
  coveragePercent={70}
  expiryDate="15 Dec 2025"
  insuranceType="Vehicle Protection"
  icon={<Car className="h-5 w-5 text-white" />}
  gradientFrom="from-blue-500"
  gradientTo="to-cyan-500"
/>

// Health Insurance - Pink theme
<InsuranceSummaryCard
  title="Health Insurance"
  policyNumber="HLT-45092-BK"
  insuredAmount="₹8,00,000"
  premiumAmount="₹12,200/year"
  coveragePercent={45}
  expiryDate="10 Aug 2026"
  insuranceType="Medical Coverage"
  icon={<HeartPulse className="h-5 w-5 text-white" />}
  gradientFrom="from-pink-500"
  gradientTo="to-red-400"
/>

// Travel Insurance - Purple theme
<InsuranceSummaryCard
  title="Travel Insurance"
  policyNumber="TRV-33088-CN"
  insuredAmount="₹5,00,000"
  premiumAmount="₹2,400/year"
  coveragePercent={85}
  expiryDate="22 Jan 2026"
  insuranceType="International Trips"
  icon={<Umbrella className="h-5 w-5 text-white" />}
  gradientFrom="from-purple-500"
  gradientTo="to-indigo-500"
/>
```

### Integration with Insurance Module

```tsx
import { InsuranceSummaryCard } from "@/components/ui/insurance-summary-card"
import { useInsurancePolicies } from "@/hooks/use-insurance-policies"

const InsurancePoliciesGrid = () => {
  const { policies, isLoading } = useInsurancePolicies()

  if (isLoading) {
    return <div>Loading policies...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {policies.map((policy) => (
        <InsuranceSummaryCard
          key={policy.id}
          title={policy.policyHolder?.name || "Policy"}
          policyNumber={policy.policyNumber}
          insuredAmount={`₹${policy.coverageAmount.toLocaleString()}`}
          premiumAmount={`₹${policy.premiumAmount.toLocaleString()}/year`}
          coveragePercent={Math.min(policy.coverageUsed, 100)}
          expiryDate={policy.expirationDate}
          insuranceType={policy.insuranceType}
          icon={getInsuranceIcon(policy.insuranceType)}
          tooltipText={`Policy for ${policy.policyHolder?.name || "client"}`}
          gradientFrom={getGradientForType(policy.insuranceType).from}
          gradientTo={getGradientForType(policy.insuranceType).to}
          onManage={() => handleManagePolicy(policy.id)}
        />
      ))}
    </div>
  )
}
```

## Demo Page

A complete demo showcasing the component is available at:

```location
📁 /app/demo/insurance-summary/page.tsx
```

## Dependencies

The component requires these packages:

- `lucide-react` - For icons
- `framer-motion` - For animations
- `@radix-ui/react-slot` - For button composition
- `class-variance-authority` - For variant management
- `@radix-ui/react-avatar` - For avatar components
- `@radix-ui/react-icons` - For icon components
- `@radix-ui/react-select` - For select components
- `@radix-ui/react-tooltip` - For tooltip components
- `@radix-ui/react-progress` - For progress bar

## Best Practices

1. **Icon Consistency**: Use appropriate Lucide React icons that match the insurance type
2. **Gradient Themes**: Choose gradient colors that are visually distinct for different insurance types
3. **Responsive Layout**: The component works best in grid layouts (2-3 columns on desktop)
4. **Loading States**: Consider showing skeleton cards while data loads
5. **Error Handling**: Handle cases where policy data might be incomplete
6. **Accessibility**: The component includes proper ARIA labels and keyboard navigation

## Integration with Insurance RBAC

The component respects the insurance module's RBAC system:

```tsx
const InsuranceDashboard = () => {
  const { hasPermission } = useInsuranceAccess()

  if (!hasPermission("canViewAllPolicies")) {
    return <div>Access denied</div>
  }

  return <InsuranceSummaryGrid />
}
```

This ensures users only see policies they're authorized to view based on their role and permissions.
