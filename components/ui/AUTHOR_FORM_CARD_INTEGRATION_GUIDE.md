# AuthorFormCard Integration Guide

## Overview

The AuthorFormCard component is a fully-featured, production-ready component for managing authors in your CMS. It includes:

- ✅ **Database Integration** - Full CRUD operations with PostgreSQL
- ✅ **API Routes** - RESTful endpoints for all operations
- ✅ **Error Handling** - Comprehensive validation and error states
- ✅ **Loading States** - Visual feedback during operations
- ✅ **TypeScript Support** - Fully typed interfaces and hooks
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Animation** - Smooth transitions with Framer Motion

## Quick Start

### 1. Basic Usage (Modal Integration)

```tsx
import { useState } from "react";
import { AuthorFormCard } from "@/components/ui/author-form-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuthors } from "@/hooks/use-authors";

export function AuthorManagementModal() {
  const { createAuthor, isLoading, error } = useAuthors();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data) => {
    const result = await createAuthor(data);
    if (result.success) {
      setIsOpen(false);
      // Refresh your data or show success message
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Author</Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
        <AuthorFormCard
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isLoading={isLoading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Edit Existing Author

```tsx
export function EditAuthorModal({ author }) {
  const { updateAuthor, isLoading, error } = useAuthors();

  const handleSubmit = async (data) => {
    const result = await updateAuthor(author.id, data);
    if (result.success) {
      // Handle success
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
        <AuthorFormCard
          initialData={{
            id: author.id,
            name: author.name,
            title: author.title,
            email: author.email,
            bio: author.bio,
            avatar: author.avatar,
            website: author.website,
            status: author.status,
            isFeatured: author.isFeatured,
          }}
          onSubmit={handleSubmit}
          onCancel={() => {}} // Dialog handles cancel
          isLoading={isLoading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Page-Level Integration

```tsx
import { useAuthors } from "@/hooks/use-authors";

export function CreateAuthorPage() {
  const { createAuthor, isLoading, error } = useAuthors();

  const handleSubmit = async (data) => {
    const result = await createAuthor(data);
    if (result.success) {
      // Redirect or show success message
      router.push("/authors");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Author</h1>
        <AuthorFormCard
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
```

## API Integration

### Database Schema

The component uses the following database tables:

```sql
-- Authors table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  bio TEXT,
  avatar TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Author categories for organization
CREATE TABLE author_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics tracking
CREATE TABLE author_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

- **GET /api/authors** - List authors with filtering and pagination
- **POST /api/authors** - Create new author
- **GET /api/authors/[id]** - Get specific author
- **PUT /api/authors/[id]** - Update author
- **DELETE /api/authors/[id]** - Delete author
- **POST /api/authors/[id]/analytics** - Track author events

## Hook Usage

### useAuthors Hook

```tsx
import { useAuthors } from "@/hooks/use-authors";

function MyComponent() {
  const {
    // State
    isLoading,
    error,

    // Actions
    createAuthor,
    updateAuthor,
    deleteAuthor,
    getAuthors,
    getAuthor,
    trackAuthorEvent,
  } = useAuthors();

  const handleCreate = async (data) => {
    const result = await createAuthor(data);
    if (result.success) {
      console.log("Author created:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  };

  // Component JSX...
}
```

## Integration Patterns

### 1. Dashboard Integration

```tsx
import { useState, useEffect } from "react";
import { useAuthors } from "@/hooks/use-authors";

export function AuthorDashboard() {
  const { getAuthors, deleteAuthor, isLoading } = useAuthors();
  const [authors, setAuthors] = useState([]);
  const [filters, setFilters] = useState({ status: "active", limit: 20 });

  useEffect(() => {
    loadAuthors();
  }, [filters]);

  const loadAuthors = async () => {
    const result = await getAuthors(filters);
    if (result.success) {
      setAuthors(result.data.authors);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete author?")) {
      await deleteAuthor(id);
      loadAuthors(); // Refresh list
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Authors ({authors.length})</h2>
        <AuthorManagementModal onSuccess={loadAuthors} />
      </div>

      <div className="grid gap-4">
        {authors.map((author) => (
          <AuthorCard
            key={author.id}
            author={author}
            onEdit={() => handleEdit(author)}
            onDelete={() => handleDelete(author.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. Content Management Integration

```tsx
import { useAuthors } from "@/hooks/use-authors";

export function ArticleEditor({ article, onSave }) {
  const { getAuthors, trackAuthorEvent } = useAuthors();
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(article.authorId);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    const result = await getAuthors({ status: "active", limit: 100 });
    if (result.success) {
      setAuthors(result.data.authors);
    }
  };

  const handleAuthorChange = async (authorId) => {
    setSelectedAuthor(authorId);

    // Track author selection
    const author = authors.find(a => a.id === authorId);
    if (author) {
      await trackAuthorEvent(authorId, "article_assignment", "cms");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Author
        </label>
        <select
          value={selectedAuthor}
          onChange={(e) => handleAuthorChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select an author...</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} {author.title && `- ${author.title}`}
            </option>
          ))}
        </select>
      </div>

      <AuthorFormCard
        onSubmit={async (data) => {
          // Create new author and assign to article
          const result = await createAuthor(data);
          if (result.success) {
            setSelectedAuthor(result.data.id);
            onSave({ ...article, authorId: result.data.id });
          }
        }}
        onCancel={() => {}}
      />
    </div>
  );
}
```

### 3. Profile Management

```tsx
import { useAuthors } from "@/hooks/use-authors";

export function AuthorProfilePage({ authorId }) {
  const { getAuthor, updateAuthor, trackAuthorEvent } = useAuthors();
  const [author, setAuthor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadAuthor();
  }, [authorId]);

  const loadAuthor = async () => {
    const result = await getAuthor(authorId);
    if (result.success) {
      setAuthor(result.data);
      // Track profile view
      await trackAuthorEvent(authorId, "profile_view");
    }
  };

  const handleUpdate = async (data) => {
    const result = await updateAuthor(authorId, data);
    if (result.success) {
      setAuthor(result.data);
      setIsEditing(false);
      await trackAuthorEvent(authorId, "profile_updated");
    }
  };

  if (!author) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            {author.title && (
              <p className="text-muted-foreground">{author.title}</p>
            )}
          </div>
        </div>

        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {isEditing ? (
        <AuthorFormCard
          initialData={author}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <AuthorProfile author={author} />
      )}
    </div>
  );
}
```

## Error Handling

### API Error Responses

The component handles various error scenarios:

```typescript
// Validation errors
{
  success: false,
  error: "Validation error",
  details: [
    { field: "name", message: "Name is required" },
    { field: "email", message: "Invalid email format" }
  ]
}

// Database errors
{
  success: false,
  error: "Failed to create author",
  details: "Connection timeout"
}

// Not found errors
{
  success: false,
  error: "Author not found"
}
```

### Form Validation

Built-in client-side validation:

- **Required fields**: Name is mandatory
- **Email format**: Must be valid email address
- **URL format**: Website must start with http:// or https://
- **Length limits**: Bio max 500 characters, etc.

## Analytics Integration

### Tracking Events

```tsx
import { useAuthors } from "@/hooks/use-authors";

function AuthorCard({ author }) {
  const { trackAuthorEvent } = useAuthors();

  const handleSocialClick = async (platform) => {
    await trackAuthorEvent(author.id, "social_click", "website", {
      platform,
      url: author.socialLinks?.[platform]
    });
  };

  const handleArticleRead = async () => {
    await trackAuthorEvent(author.id, "article_read", "website");
  };

  return (
    <div>
      <h3>{author.name}</h3>

      {author.socialLinks?.twitter && (
        <button onClick={() => handleSocialClick("twitter")}>
          Twitter
        </button>
      )}

      <Link href={`/articles?author=${author.id}`} onClick={handleArticleRead}>
        View Articles
      </Link>
    </div>
  );
}
```

## Best Practices

### 1. Error Boundaries

Wrap your author components in error boundaries:

```tsx
import { ErrorBoundary } from "react-error-boundary";

function AuthorSection() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AuthorManagementModal />
    </ErrorBoundary>
  );
}
```

### 2. Loading States

Always show loading indicators:

```tsx
function AuthorList() {
  const { getAuthors, isLoading } = useAuthors();

  if (isLoading) {
    return <div>Loading authors...</div>;
  }

  return <AuthorGrid authors={authors} />;
}
```

### 3. Optimistic Updates

For better UX, implement optimistic updates:

```tsx
const handleDelete = async (id) => {
  // Optimistically remove from UI
  setAuthors(prev => prev.filter(a => a.id !== id));

  try {
    await deleteAuthor(id);
  } catch (error) {
    // Revert on error
    setAuthors(prev => [...prev, originalAuthor]);
    toast.error("Failed to delete author");
  }
};
```

### 4. Form Reset

Reset form state after successful operations:

```tsx
const handleSubmit = async (data) => {
  const result = await createAuthor(data);
  if (result.success) {
    form.reset(); // Reset form fields
    setIsOpen(false);
  }
};
```

## Migration from Basic to Full Implementation

If you started with the basic version, here's how to upgrade:

1. **Install dependencies** (already done):
   ```bash
   npm install lucide-react framer-motion @radix-ui/react-slot class-variance-authority @radix-ui/react-icons @radix-ui/react-dialog @radix-ui/react-avatar @radix-ui/react-tooltip sonner
   ```

2. **Run database migration**:
   ```bash
   npm run db:push
   ```

3. **Update imports**:
   ```tsx
   // Before
   import { AuthorFormCard } from "@/components/ui/author-form-card";

   // After (add hook)
   import { AuthorFormCard } from "@/components/ui/author-form-card";
   import { useAuthors } from "@/hooks/use-authors";
   ```

4. **Add error handling**:
   ```tsx
   // Before
   <AuthorFormCard onSubmit={handleSubmit} onCancel={handleCancel} />

   // After
   <AuthorFormCard
     onSubmit={handleSubmit}
     onCancel={handleCancel}
     isLoading={isLoading}
     error={error}
   />
   ```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthorFormCard } from "@/components/ui/author-form-card";

test("creates author successfully", async () => {
  const mockSubmit = jest.fn();

  render(
    <AuthorFormCard
      onSubmit={mockSubmit}
      onCancel={() => {}}
    />
  );

  fireEvent.change(screen.getByLabelText(/author name/i), {
    target: { value: "John Doe" }
  });

  fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: "John Doe",
      // other expected data
    });
  });
});
```

### Integration Tests

```tsx
import { render, screen } from "@testing-library/react";
import { AuthorManagementModal } from "./AuthorManagementModal";

test("integrates with API", async () => {
  // Mock API responses
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data: mockAuthor })
  });

  render(<AuthorManagementModal />);

  fireEvent.click(screen.getByText("Add New Author"));

  // Fill form and submit
  // Verify API call and UI updates
});
```

## Deployment Checklist

- [ ] Database migration applied (`npm run db:push`)
- [ ] API routes accessible at `/api/authors`
- [ ] Error handling tested
- [ ] Loading states working
- [ ] Form validation functional
- [ ] Analytics tracking enabled
- [ ] Responsive design verified
- [ ] Accessibility tested

## Support

For issues or questions:
1. Check the error messages in browser console
2. Verify database connection in `.env.local`
3. Ensure all migrations are applied
4. Check API endpoint responses in browser dev tools

The component is production-ready and follows all modern React and TypeScript best practices!
