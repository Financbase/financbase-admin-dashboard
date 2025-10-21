import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, File, Info, Loader2, Plus, X, XCircle } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// --- Required shadcn/ui components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/core/ui/layout/tooltip";

// --- Component Props Interface ---
interface AuthorFormCardProps {
	initialData?: {
		id?: string;
		name: string;
		title: string;
		email?: string;
		bio?: string;
		avatar?: string;
		website?: string;
		status?: string;
		isFeatured?: boolean;
	};
	onSubmit: (data: {
		name: string;
		title?: string;
		email?: string;
		bio?: string;
		avatar?: string;
		website?: string;
		status?: string;
		isFeatured?: boolean;
	}) => void;
	onCancel: () => void;
	className?: string;
	isLoading?: boolean;
	error?: string | null;
}

// --- Main Component ---
export const AuthorFormCard: React.FC<AuthorFormCardProps> = ({
	initialData,
	onSubmit,
	onCancel,
	className,
	isLoading = false,
	error = null,
}) => {
	const [name, setName] = React.useState(initialData?.name || "");
	const [title, setTitle] = React.useState(initialData?.title || "");
	const [email, setEmail] = React.useState(initialData?.email || "");
	const [bio, setBio] = React.useState(initialData?.bio || "");
	const [avatar, setAvatar] = React.useState<string | undefined>(
		initialData?.avatar,
	);
	const [website, setWebsite] = React.useState(initialData?.website || "");
	const [status, setStatus] = React.useState(initialData?.status || "active");
	const [isFeatured, setIsFeatured] = React.useState(
		initialData?.isFeatured || false,
	);
	const [formError, setFormError] = React.useState<string | null>(null);

	// Clear form error when user starts typing
	React.useEffect(() => {
		if (error) {
			setFormError(error);
		}
	}, [error]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Clear any previous errors
		setFormError(null);

		// Basic validation
		if (!name.trim()) {
			setFormError("Author name is required");
			return;
		}

		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setFormError("Please enter a valid email address");
			return;
		}

		if (website && !/^https?:\/\/.+/.test(website)) {
			setFormError("Website URL must start with http:// or https://");
			return;
		}

		onSubmit({
			name: name.trim(),
			title: title.trim() || undefined,
			email: email.trim() || undefined,
			bio: bio.trim() || undefined,
			avatar,
			website: website.trim() || undefined,
			status,
			isFeatured,
		});
	};

	// --- Animation Variants for Framer Motion ---
	const FADE_IN_VARIANTS = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0, transition: { type: "spring" } },
	};

	return (
		<motion.div
			initial="hidden"
			animate="show"
			viewport={{ once: true }}
			variants={{
				hidden: {},
				show: {
					transition: {
						staggerChildren: 0.15,
					},
				},
			}}
			className={cn(
				"relative w-full max-w-lg rounded-xl bg-background p-6 shadow-xl",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<motion.h3
					variants={FADE_IN_VARIANTS}
					className="text-xl font-semibold text-foreground"
				>
					{initialData?.id ? "Edit Author" : "Add a writer"}
				</motion.h3>
				<Button
					variant="ghost"
					size="icon"
					onClick={onCancel}
					aria-label="Close"
					disabled={isLoading}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{/* Error Display */}
			{(formError || error) && (
				<motion.div
					variants={FADE_IN_VARIANTS}
					className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
				>
					{formError || error}
				</motion.div>
			)}

			<form
				onSubmit={handleSubmit}
				className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3"
			>
				{/* --- Image Upload Section --- */}
				<motion.div
					variants={FADE_IN_VARIANTS}
					className="flex flex-col items-center gap-3 md:col-span-1"
				>
					<div className="relative">
						<Avatar className="h-24 w-24 border-2 border-dashed border-border">
							<AvatarImage src={avatar} alt={name || "Author"} />
							<AvatarFallback className="bg-muted">
								<span className="text-xs text-muted-foreground">
									{name ? name.charAt(0).toUpperCase() : "A"}
								</span>
							</AvatarFallback>
						</Avatar>
						<button
							type="button"
							className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:opacity-50"
							aria-label="Upload Image"
							disabled={isLoading}
							onClick={() => {
								// Placeholder for image upload functionality
								// In a real implementation, this would open a file picker or image URL input
								const imageUrl = prompt("Enter image URL:");
								if (imageUrl) {
									setAvatar(imageUrl);
								}
							}}
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							) : (
								<Plus className="h-4 w-4 text-muted-foreground" />
							)}
						</button>
					</div>
					<div className="text-center">
						<p className="text-sm font-medium text-foreground">Author Image</p>
						<p className="text-xs text-muted-foreground">
							Click + to add image
						</p>
					</div>
				</motion.div>

				{/* --- Form Fields Section --- */}
				<div className="flex flex-col gap-4 md:col-span-2">
					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-name">
							Author name <span className="text-red-500">*</span>
						</Label>
						<Input
							type="text"
							id="author-name"
							placeholder="James Brown"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isLoading}
							required
						/>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-title">Title/Role</Label>
						<Input
							type="text"
							id="author-title"
							placeholder="Senior Writer, Marketing Manager"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={isLoading}
						/>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-email">Email</Label>
						<Input
							type="email"
							id="author-email"
							placeholder="author@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
						/>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-bio">Bio</Label>
						<textarea
							id="author-bio"
							placeholder="Brief biography or description..."
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							disabled={isLoading}
							className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
							rows={3}
						/>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-website">Website</Label>
						<Input
							type="url"
							id="author-website"
							placeholder="https://author-website.com"
							value={website}
							onChange={(e) => setWebsite(e.target.value)}
							disabled={isLoading}
						/>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="grid w-full items-center gap-1.5"
					>
						<Label htmlFor="author-status">Status</Label>
						<select
							id="author-status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							disabled={isLoading}
							className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="pending">Pending</option>
							<option value="archived">Archived</option>
						</select>
					</motion.div>

					<motion.div
						variants={FADE_IN_VARIANTS}
						className="flex items-center space-x-2"
					>
						<input
							type="checkbox"
							id="author-featured"
							checked={isFeatured}
							onChange={(e) => setIsFeatured(e.target.checked)}
							disabled={isLoading}
							className="h-4 w-4 rounded border border-input text-primary focus:ring-ring focus:ring-2 focus:ring-offset-2"
						/>
						<Label
							htmlFor="author-featured"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Featured Author
						</Label>
					</motion.div>
				</div>

				{/* --- Form Actions --- */}
				<motion.div
					variants={FADE_IN_VARIANTS}
					className="flex justify-end gap-3 md:col-span-3"
				>
					<Button
						type="button"
						variant="ghost"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{initialData?.id ? "Update Author" : "Save Changes"}
					</Button>
				</motion.div>
			</form>
		</motion.div>
	);
};
