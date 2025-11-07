/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface JobPosting {
	id: number;
	title: string;
	department: string;
	location: string;
	type: string;
	experience: string;
	description: string;
	fullDescription?: string;
	requirements: string[];
	responsibilities?: string[];
	qualifications?: string[];
	salary?: string;
	benefits?: string[];
	status: 'draft' | 'published' | 'closed' | 'archived';
	isFeatured: boolean;
	applicants: number;
	postedAt?: string;
	createdAt: string;
	updatedAt: string;
}

const departments = [
	'Engineering',
	'Design',
	'Product',
	'Sales',
	'Marketing',
	'Operations',
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export function CareersTable() {
	const [jobs, setJobs] = useState<JobPosting[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [formData, setFormData] = useState({
		title: '',
		department: '',
		location: '',
		type: '',
		experience: '',
		description: '',
		fullDescription: '',
		requirements: [] as string[],
		responsibilities: [] as string[],
		qualifications: [] as string[],
		salary: '',
		benefits: [] as string[],
		status: 'draft' as const,
		isFeatured: false,
	});
	const [requirementInput, setRequirementInput] = useState('');
	const [responsibilityInput, setResponsibilityInput] = useState('');
	const [qualificationInput, setQualificationInput] = useState('');
	const [benefitInput, setBenefitInput] = useState('');

	useEffect(() => {
		fetchJobs();
	}, [statusFilter]);

	const fetchJobs = async () => {
		try {
			setLoading(true);
			const url = statusFilter === 'all' 
				? '/api/admin/careers'
				: `/api/admin/careers?status=${statusFilter}`;
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setJobs(data.jobs || []);
			} else {
				toast.error('Failed to fetch job postings');
			}
		} catch (error) {
			toast.error('Error fetching job postings');
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (job: JobPosting) => {
		setEditingJob(job);
		setFormData({
			title: job.title,
			department: job.department,
			location: job.location,
			type: job.type,
			experience: job.experience,
			description: job.description,
			fullDescription: job.fullDescription || '',
			requirements: job.requirements || [],
			responsibilities: job.responsibilities || [],
			qualifications: job.qualifications || [],
			salary: job.salary || '',
			benefits: job.benefits || [],
			status: (job.status === 'draft' || job.status === 'published' || job.status === 'closed' || job.status === 'archived') ? job.status : 'draft',
			isFeatured: job.isFeatured,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to archive this job posting?')) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/careers/${id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Job posting archived successfully');
				fetchJobs();
			} else {
				toast.error('Failed to archive job posting');
			}
		} catch (error) {
			toast.error('Error archiving job posting');
		}
	};

	const addArrayItem = (
		array: string[],
		value: string,
		setter: (arr: string[]) => void
	) => {
		if (value.trim()) {
			setter([...array, value.trim()]);
		}
	};

	const removeArrayItem = (
		array: string[],
		index: number,
		setter: (arr: string[]) => void
	) => {
		setter(array.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const url = editingJob
				? `/api/admin/careers/${editingJob.id}`
				: '/api/admin/careers';
			const method = editingJob ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				toast.success(`Job posting ${editingJob ? 'updated' : 'created'} successfully`);
				setIsDialogOpen(false);
				setEditingJob(null);
				resetForm();
				fetchJobs();
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to save job posting');
			}
		} catch (error) {
			toast.error('Error saving job posting');
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			department: '',
			location: '',
			type: '',
			experience: '',
			description: '',
			fullDescription: '',
			requirements: [],
			responsibilities: [],
			qualifications: [],
			salary: '',
			benefits: [],
			status: 'draft',
			isFeatured: false,
		});
		setRequirementInput('');
		setResponsibilityInput('');
		setQualificationInput('');
		setBenefitInput('');
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<string, string> = {
			draft: 'bg-gray-100 text-gray-800',
			published: 'bg-green-100 text-green-800',
			closed: 'bg-yellow-100 text-yellow-800',
			archived: 'bg-red-100 text-red-800',
		};
		return <Badge className={variants[status] || ''}>{status}</Badge>;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<RefreshCw className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="published">Published</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => { setEditingJob(null); resetForm(); }}>
							<Plus className="mr-2 h-4 w-4" />
							New Job Posting
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
							</DialogTitle>
							<DialogDescription>
								{editingJob
									? 'Update the job posting details below.'
									: 'Fill in the details to create a new job posting.'}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										value={formData.title}
										onChange={(e) =>
											setFormData({ ...formData, title: e.target.value })
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="department">Department *</Label>
									<Select
										value={formData.department}
										onValueChange={(value) =>
											setFormData({ ...formData, department: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select department" />
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem key={dept} value={dept}>
													{dept}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="location">Location *</Label>
									<Input
										id="location"
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="type">Type *</Label>
									<Select
										value={formData.type}
										onValueChange={(value) =>
											setFormData({ ...formData, type: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{jobTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="experience">Experience *</Label>
									<Input
										id="experience"
										value={formData.experience}
										onChange={(e) =>
											setFormData({ ...formData, experience: e.target.value })
										}
										placeholder="e.g., 5+ years"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="salary">Salary</Label>
									<Input
										id="salary"
										value={formData.salary}
										onChange={(e) =>
											setFormData({ ...formData, salary: e.target.value })
										}
										placeholder="e.g., $140,000 - $180,000"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									required
									rows={3}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="fullDescription">Full Description</Label>
								<Textarea
									id="fullDescription"
									value={formData.fullDescription}
									onChange={(e) =>
										setFormData({ ...formData, fullDescription: e.target.value })
									}
									rows={5}
								/>
							</div>

							<div className="space-y-2">
								<Label>Requirements</Label>
								<div className="flex gap-2">
									<Input
										value={requirementInput}
										onChange={(e) => setRequirementInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addArrayItem(
													formData.requirements,
													requirementInput,
													(arr) => setFormData({ ...formData, requirements: arr })
												);
												setRequirementInput('');
											}
										}}
										placeholder="Add requirement and press Enter"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											addArrayItem(
												formData.requirements,
												requirementInput,
												(arr) => setFormData({ ...formData, requirements: arr })
											);
											setRequirementInput('');
										}}
									>
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.requirements.map((req, idx) => (
										<Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem(formData.requirements, idx, (arr) => setFormData({ ...formData, requirements: arr }))}>
											{req} ×
										</Badge>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label>Responsibilities</Label>
								<div className="flex gap-2">
									<Input
										value={responsibilityInput}
										onChange={(e) => setResponsibilityInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addArrayItem(
													formData.responsibilities,
													responsibilityInput,
													(arr) => setFormData({ ...formData, responsibilities: arr })
												);
												setResponsibilityInput('');
											}
										}}
										placeholder="Add responsibility and press Enter"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											addArrayItem(
												formData.responsibilities,
												responsibilityInput,
												(arr) => setFormData({ ...formData, responsibilities: arr })
											);
											setResponsibilityInput('');
										}}
									>
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.responsibilities.map((resp, idx) => (
										<Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem(formData.responsibilities, idx, (arr) => setFormData({ ...formData, responsibilities: arr }))}>
											{resp} ×
										</Badge>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label>Qualifications</Label>
								<div className="flex gap-2">
									<Input
										value={qualificationInput}
										onChange={(e) => setQualificationInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addArrayItem(
													formData.qualifications,
													qualificationInput,
													(arr) => setFormData({ ...formData, qualifications: arr })
												);
												setQualificationInput('');
											}
										}}
										placeholder="Add qualification and press Enter"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											addArrayItem(
												formData.qualifications,
												qualificationInput,
												(arr) => setFormData({ ...formData, qualifications: arr })
											);
											setQualificationInput('');
										}}
									>
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.qualifications.map((qual, idx) => (
										<Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem(formData.qualifications, idx, (arr) => setFormData({ ...formData, qualifications: arr }))}>
											{qual} ×
										</Badge>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label>Benefits</Label>
								<div className="flex gap-2">
									<Input
										value={benefitInput}
										onChange={(e) => setBenefitInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addArrayItem(
													formData.benefits,
													benefitInput,
													(arr) => setFormData({ ...formData, benefits: arr })
												);
												setBenefitInput('');
											}
										}}
										placeholder="Add benefit and press Enter"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											addArrayItem(
												formData.benefits,
												benefitInput,
												(arr) => setFormData({ ...formData, benefits: arr })
											);
											setBenefitInput('');
										}}
									>
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.benefits.map((benefit, idx) => (
										<Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem(formData.benefits, idx, (arr) => setFormData({ ...formData, benefits: arr }))}>
											{benefit} ×
										</Badge>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value: any) =>
											setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
											<SelectItem value="closed">Closed</SelectItem>
											<SelectItem value="archived">Archived</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2 pt-8">
									<Switch
										id="featured"
										checked={formData.isFeatured}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, isFeatured: checked })
										}
									/>
									<Label htmlFor="featured">Featured</Label>
								</div>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsDialogOpen(false);
										setEditingJob(null);
										resetForm();
									}}
								>
									Cancel
								</Button>
								<Button type="submit">
									{editingJob ? 'Update' : 'Create'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Department</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Featured</TableHead>
							<TableHead>Applicants</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
									No job postings found
								</TableCell>
							</TableRow>
						) : (
							jobs.map((job) => (
								<TableRow key={job.id}>
									<TableCell className="font-medium">{job.title}</TableCell>
									<TableCell>{job.department}</TableCell>
									<TableCell>{job.location}</TableCell>
									<TableCell>{getStatusBadge(job.status)}</TableCell>
									<TableCell>
										{job.isFeatured ? (
											<Badge variant="default">Featured</Badge>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell>{job.applicants}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												asChild
											>
												<Link href={`/careers/${job.id}`} target="_blank">
													<Eye className="h-4 w-4" />
												</Link>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEdit(job)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(job.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

