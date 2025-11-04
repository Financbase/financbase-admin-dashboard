/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	ArrowLeft,
	CheckCircle,
	HelpCircle,
	MessageCircle,
	Plus,
	Save,
} from "lucide-react";
/**
 * AuthorFormCard Integration Example
 *
 * This component is designed for creating and editing author/writer profiles.
 * It can be integrated into various parts of the application where author management is needed.
 *
 * Features:
 * - Form validation for required fields
 * - Image upload functionality (placeholder for now)
 * - Responsive design that works on mobile and desktop
 * - Smooth animations with Framer Motion
 * - Accessible with proper ARIA labels and keyboard navigation
 * - Tooltip for additional help text
 *
 * Integration Options:
 * 1. Modal/Dialog Integration (as shown in demo)
 * 2. Page-level Integration (full page form)
 * 3. Sidebar Integration (collapsible form panel)
 * 4. Dashboard Widget Integration
 */

// Example 1: Modal Integration (Most Common)
export function AuthorManagementModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [authors, setAuthors] = useState([]);

	const handleCreateAuthor = (data) => {
		// Here you would typically make an API call to save the author
		console.log("Creating author:", data);
		setAuthors((prev) => [...prev, { id: Date.now(), ...data }]);
		setIsOpen(false);
		toast.success(`Author "${data.name}" has been created!`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Add New Author</Button>
			</DialogTrigger>
			<DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
				<AuthorFormCard
					onSubmit={handleCreateAuthor}
					onCancel={() => setIsOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

// Example 2: Edit Existing Author
export function EditAuthorModal({ author, onUpdate }) {
	const handleUpdateAuthor = (data) => {
		onUpdate(author.id, data);
		toast.success(`Author "${data.name}" has been updated!`);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
				<AuthorFormCard
					initialData={author}
					onSubmit={handleUpdateAuthor}
					onCancel={() => {}} // Dialog handles the cancel
				/>
			</DialogContent>
		</Dialog>
	);
}

// Example 3: Page-level Integration
export function CreateAuthorPage() {
	const handleCreateAuthor = (data) => {
		// API call to create author
		console.log("Creating author:", data);
		// Redirect or show success message
	};

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Create New Author</h1>
				<AuthorFormCard
					onSubmit={handleCreateAuthor}
					onCancel={() => window.history.back()}
				/>
			</div>
		</div>
	);
}

// Example 4: Dashboard Widget Integration
export function AuthorQuickAdd() {
	const [showForm, setShowForm] = useState(false);

	const handleQuickAdd = (data) => {
		console.log("Quick add author:", data);
		setShowForm(false);
		toast.success("Author added successfully!");
	};

	return (
		<Card className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Quick Add Author</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowForm(!showForm)}
				>
					{showForm ? "Cancel" : "Add"}
				</Button>
			</div>

			{showForm && (
				<div className="mt-4">
					<AuthorFormCard
						onSubmit={handleQuickAdd}
						onCancel={() => setShowForm(false)}
						className="border rounded-lg"
					/>
				</div>
			)}
		</Card>
	);
}
