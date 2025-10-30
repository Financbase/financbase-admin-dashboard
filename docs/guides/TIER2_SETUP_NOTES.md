# Tier 2 Setup Notes

## Required Package Installation

To use the Financbase GPT features, you need to install the Vercel AI SDK:

```bash
pnpm add ai
```

This package provides:

- `useChat` hook for managing chat state
- `OpenAIStream` for streaming responses
- `StreamingTextResponse` for Edge runtime support

## Environment Variables

Add to your `.env.local`:

```env
# OpenAI API Key (required for Financbase GPT)
OPENAI_API_KEY=sk-...

# Optional: Customize GPT model
OPENAI_MODEL=gpt-4-turbo-preview
```

## Usage

### 1. Full Page Interface

Navigate to `/gpt` for the dedicated Financbase GPT page.

### 2. Widget (Floating Chat)

Add to your layout:

```typescript
import { FinancbaseGPTWidget } from '@/components/financbase-gpt';

export default function Layout() {
  return (
    <>
      {children}
      <FinancbaseGPTWidget position="bottom-right" />
    </>
  );
}
```

### 3. Embedded Chat

Use anywhere in your app:

```typescript
import { FinancbaseGPTChat } from '@/components/financbase-gpt';

<FinancbaseGPTChat 
  maxHeight="500px"
  showQuickActions={true}
/>
```

## Next Steps

After installing dependencies:

1. Add financial data queries to `/app/api/ai/financbase-gpt/route.ts`
2. Update `getFinancialContext()` with your actual database tables
3. Test with sample queries
4. Customize quick actions in the chat interface
5. Add widget to your dashboard layout
