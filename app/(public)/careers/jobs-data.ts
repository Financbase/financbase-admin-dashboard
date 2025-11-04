/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export interface JobOpening {
	id: number;
	title: string;
	department: string;
	location: string;
	type: string;
	experience: string;
	description: string;
	requirements: string[];
	posted: string;
	applicants: number;
	featured?: boolean;
	fullDescription?: string;
	responsibilities?: string[];
	qualifications?: string[];
	salary?: string;
	benefits?: string[];
}

export const jobOpenings: JobOpening[] = [
	{
		id: 1,
		title: "Senior Full Stack Engineer",
		department: "Engineering",
		location: "San Francisco, CA",
		type: "Full-time",
		experience: "5+ years",
		description:
			"Join our engineering team to build scalable financial applications using modern technologies.",
		requirements: [
			"React, Node.js, TypeScript",
			"Financial services experience",
			"AWS/Cloud infrastructure",
		],
		posted: "2 days ago",
		applicants: 24,
		featured: true,
		fullDescription:
			"We're looking for an experienced Full Stack Engineer to join our platform team. You'll work on building scalable financial applications that handle millions of transactions, design robust APIs, and create intuitive user interfaces. You'll collaborate with product managers, designers, and other engineers to deliver high-quality software that impacts thousands of businesses.",
		responsibilities: [
			"Design and implement scalable backend services using Node.js and TypeScript",
			"Build responsive frontend applications with React and Next.js",
			"Develop and maintain RESTful APIs and GraphQL endpoints",
			"Write comprehensive tests and ensure code quality",
			"Collaborate with cross-functional teams to deliver features",
			"Participate in code reviews and mentor junior engineers",
			"Optimize application performance and troubleshoot issues",
		],
		qualifications: [
			"5+ years of experience in full-stack development",
			"Strong proficiency in React, Node.js, and TypeScript",
			"Experience with cloud platforms (AWS, GCP, or Azure)",
			"Knowledge of financial services or fintech industry",
			"Experience with database design and optimization",
			"Strong problem-solving and communication skills",
			"Bachelor's degree in Computer Science or related field",
		],
		salary: "$140,000 - $180,000",
		benefits: [
			"Competitive salary and equity package",
			"Comprehensive health, dental, and vision insurance",
			"Unlimited PTO and flexible work arrangements",
			"$2,000 annual learning and development budget",
			"Remote work options",
			"Stock options",
		],
	},
	{
		id: 2,
		title: "Product Designer",
		department: "Design",
		location: "Remote",
		type: "Full-time",
		experience: "3+ years",
		description:
			"Design intuitive user experiences for our financial platform and mobile applications.",
		requirements: [
			"Figma, Sketch",
			"Financial UX experience",
			"Prototyping skills",
		],
		posted: "1 week ago",
		applicants: 18,
		fullDescription:
			"We're seeking a talented Product Designer to join our design team. You'll be responsible for creating beautiful, intuitive user experiences for our financial platform. You'll work closely with product managers and engineers to design features that help businesses manage their finances more effectively.",
		responsibilities: [
			"Design user interfaces and experiences for web and mobile applications",
			"Create wireframes, prototypes, and high-fidelity designs",
			"Conduct user research and usability testing",
			"Collaborate with product and engineering teams",
			"Maintain and evolve our design system",
			"Present design concepts and iterate based on feedback",
		],
		qualifications: [
			"3+ years of experience in product design",
			"Proficiency in Figma, Sketch, or similar design tools",
			"Strong portfolio demonstrating UX/UI design skills",
			"Experience with financial products or B2B SaaS",
			"Knowledge of design systems and component libraries",
			"Excellent communication and collaboration skills",
		],
		salary: "$110,000 - $140,000",
	},
	{
		id: 3,
		title: "Product Manager",
		department: "Product",
		location: "New York, NY",
		type: "Full-time",
		experience: "4+ years",
		description:
			"Lead product strategy and roadmap for our core financial services platform.",
		requirements: [
			"Product management experience",
			"Financial services background",
			"Analytics skills",
		],
		posted: "3 days ago",
		applicants: 31,
		fullDescription:
			"We're looking for an experienced Product Manager to lead our core financial services platform. You'll work with engineering, design, and business teams to define product strategy, prioritize features, and deliver solutions that drive business growth.",
		responsibilities: [
			"Define product vision and strategy",
			"Create and maintain product roadmap",
			"Write detailed product requirements and user stories",
			"Collaborate with engineering and design teams",
			"Analyze user data and metrics to inform decisions",
			"Communicate product updates to stakeholders",
		],
		qualifications: [
			"4+ years of product management experience",
			"Experience with financial services or fintech",
			"Strong analytical and problem-solving skills",
			"Excellent communication and leadership abilities",
			"Experience with agile development methodologies",
		],
		salary: "$130,000 - $160,000",
	},
	{
		id: 4,
		title: "Sales Engineer",
		department: "Sales",
		location: "Austin, TX",
		type: "Full-time",
		experience: "3+ years",
		description:
			"Help enterprise customers integrate our financial APIs and solutions.",
		requirements: [
			"Technical sales experience",
			"API integration knowledge",
			"Customer-facing skills",
		],
		posted: "5 days ago",
		applicants: 12,
		fullDescription:
			"We're seeking a Sales Engineer to help enterprise customers integrate our financial APIs and solutions. You'll work closely with our sales team to understand customer needs, demonstrate our platform, and provide technical guidance throughout the sales process.",
		responsibilities: [
			"Support sales team with technical product demonstrations",
			"Help customers integrate our APIs and solutions",
			"Create technical documentation and integration guides",
			"Answer technical questions from prospects and customers",
			"Collaborate with product and engineering teams",
		],
		qualifications: [
			"3+ years of experience in technical sales or sales engineering",
			"Strong technical background and API integration experience",
			"Excellent customer-facing and communication skills",
			"Experience with financial services or SaaS products",
		],
		salary: "$100,000 - $130,000",
	},
	{
		id: 5,
		title: "Marketing Manager",
		department: "Marketing",
		location: "Remote",
		type: "Full-time",
		experience: "4+ years",
		description:
			"Drive growth through digital marketing campaigns and content strategy.",
		requirements: [
			"Digital marketing experience",
			"Content creation",
			"Analytics proficiency",
		],
		posted: "1 week ago",
		applicants: 22,
		fullDescription:
			"We're looking for a Marketing Manager to drive growth through digital marketing campaigns and content strategy. You'll be responsible for developing and executing marketing initiatives that attract and engage our target audience.",
		responsibilities: [
			"Develop and execute digital marketing campaigns",
			"Create content for blog, social media, and email marketing",
			"Manage marketing analytics and reporting",
			"Collaborate with sales and product teams",
			"Optimize conversion funnels and user acquisition",
		],
		qualifications: [
			"4+ years of experience in digital marketing",
			"Strong content creation and copywriting skills",
			"Experience with marketing analytics and tools",
			"Knowledge of SEO, SEM, and social media marketing",
		],
		salary: "$90,000 - $120,000",
	},
	{
		id: 6,
		title: "DevOps Engineer",
		department: "Engineering",
		location: "Seattle, WA",
		type: "Full-time",
		experience: "4+ years",
		description:
			"Build and maintain our cloud infrastructure and deployment pipelines.",
		requirements: [
			"AWS, Kubernetes",
			"CI/CD experience",
			"Infrastructure as Code",
		],
		posted: "4 days ago",
		applicants: 15,
		fullDescription:
			"We're seeking a DevOps Engineer to build and maintain our cloud infrastructure and deployment pipelines. You'll work on ensuring our platform is scalable, reliable, and secure while enabling rapid development and deployment.",
		responsibilities: [
			"Design and maintain cloud infrastructure on AWS",
			"Build and optimize CI/CD pipelines",
			"Implement monitoring, logging, and alerting systems",
			"Ensure system security and compliance",
			"Automate infrastructure provisioning and management",
			"Collaborate with engineering teams on deployment strategies",
		],
		qualifications: [
			"4+ years of experience in DevOps or infrastructure engineering",
			"Strong experience with AWS, Kubernetes, and Docker",
			"Proficiency in Infrastructure as Code (Terraform, CloudFormation)",
			"Experience with CI/CD tools (GitHub Actions, Jenkins, etc.)",
			"Knowledge of monitoring and logging tools",
		],
		salary: "$130,000 - $160,000",
	},
];

export function getJobById(id: number): JobOpening | undefined {
	return jobOpenings.find((job) => job.id === id);
}

