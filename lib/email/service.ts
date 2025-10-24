import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
	subject: string;
	html: string;
	text?: string;
}

export interface EmailRecipient {
	email: string;
	name?: string;
}

export interface SendEmailOptions {
	to: EmailRecipient | EmailRecipient[];
	subject: string;
	html: string;
	text?: string;
	replyTo?: string;
}

export class EmailService {
	/**
	 * Send a transactional email
	 */
	static async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
		try {
			const recipients = Array.isArray(options.to) ? options.to : [options.to];

			const emailData = {
				from: `Financbase <${process.env.RESEND_FROM_EMAIL || 'noreply@financbase.com'}>`,
				to: recipients.map(r => r.email),
				subject: options.subject,
				html: options.html,
				text: options.text,
				reply_to: options.replyTo,
			};

			const result = await resend.emails.send(emailData);

			if (result.error) {
				console.error('Email send error:', result.error);
				return {
					success: false,
					error: result.error.message || 'Failed to send email'
				};
			}

			return {
				success: true,
				messageId: result.data?.id,
			};

		} catch (error) {
			console.error('Email service error:', error);
			return {
				success: false,
				error: 'Failed to send email'
			};
		}
	}

	/**
	 * Send invoice email to client
	 */
	static async sendInvoiceEmail(
		clientEmail: string,
		invoiceData: {
			invoiceNumber: string;
			amount: number;
			dueDate: string;
			description?: string;
		}
	): Promise<{ success: boolean; messageId?: string; error?: string }> {
		const subject = `Invoice ${invoiceData.invoiceNumber} - $${invoiceData.amount.toLocaleString()}`;

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">🏦 Financbase</h1>
		<p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Financial Management</p>
	</div>

	<div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
		<h2 style="color: #333; margin-top: 0;">Invoice ${invoiceData.invoiceNumber}</h2>

		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
			<h3 style="margin-top: 0; color: #495057;">Invoice Details</h3>
			<table style="width: 100%; border-collapse: collapse;">
				<tr>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; color: #6c757d;">Invoice Number:</td>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; text-align: right;">${invoiceData.invoiceNumber}</td>
				</tr>
				<tr>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; color: #6c757d;">Amount:</td>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; text-align: right; color: #28a745;">$${invoiceData.amount.toLocaleString()}</td>
				</tr>
				<tr>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; color: #6c757d;">Due Date:</td>
					<td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; text-align: right;">${new Date(invoiceData.dueDate).toLocaleDateString()}</td>
				</tr>
				${invoiceData.description ? `
				<tr>
					<td style="padding: 8px 0; color: #6c757d;">Description:</td>
					<td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoiceData.description}</td>
				</tr>
				` : ''}
			</table>
		</div>

		<div style="text-align: center; margin: 30px 0;">
			<a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceData.invoiceNumber}"
			   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				View Invoice Details
			</a>
		</div>

		<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center; color: #6c757d; font-size: 14px;">
			<p>Thank you for your business!</p>
			<p>Financbase - Professional Financial Management</p>
		</div>
	</div>
</body>
</html>
		`.trim();

		const text = `
Financbase Invoice ${invoiceData.invoiceNumber}

Invoice Details:
- Amount: $${invoiceData.amount.toLocaleString()}
- Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}
${invoiceData.description ? `- Description: ${invoiceData.description}` : ''}

View invoice: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceData.invoiceNumber}

Thank you for your business!
Financbase - Professional Financial Management
		`.trim();

		return this.sendEmail({
			to: { email: clientEmail },
			subject,
			html,
			text,
		});
	}

	/**
	 * Send expense report email
	 */
	static async sendExpenseReportEmail(
		recipientEmail: string,
		reportData: {
			period: string;
			totalExpenses: number;
			topCategories: Array<{ category: string; amount: number }>;
			insights: string[];
		}
	): Promise<{ success: boolean; messageId?: string; error?: string }> {
		const subject = `Expense Report - ${reportData.period}`;

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">🏦 Financbase</h1>
		<p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Expense Report - ${reportData.period}</p>
	</div>

	<div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
		<h2 style="color: #333; margin-top: 0;">Expense Summary</h2>

		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
			<h3 style="margin-top: 0; color: #495057;">Total Expenses</h3>
			<div style="font-size: 36px; font-weight: bold; color: #dc3545;">$${reportData.totalExpenses.toLocaleString()}</div>
		</div>

		<h3>Top Categories</h3>
		<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
			${reportData.topCategories.map(cat => `
			<tr style="border-bottom: 1px solid #dee2e6;">
				<td style="padding: 10px 0; font-weight: bold;">${cat.category}</td>
				<td style="padding: 10px 0; text-align: right; color: #6c757d;">$${cat.amount.toLocaleString()}</td>
			</tr>
			`).join('')}
		</table>

		${reportData.insights.length > 0 ? `
		<h3>Key Insights</h3>
		<ul style="color: #495057; margin: 15px 0;">
			${reportData.insights.map(insight => `<li style="margin: 8px 0;">• ${insight}</li>`).join('')}
		</ul>
		` : ''}

		<div style="text-align: center; margin: 30px 0;">
			<a href="${process.env.NEXT_PUBLIC_APP_URL}/expenses"
			   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				View Detailed Report
			</a>
		</div>
	</div>
</body>
</html>
		`.trim();

		return this.sendEmail({
			to: { email: recipientEmail },
			subject,
			html,
		});
	}

	/**
	 * Send welcome email to new users
	 */
	static async sendWelcomeEmail(
		userEmail: string,
		userName: string
	): Promise<{ success: boolean; messageId?: string; error?: string }> {
		const subject = 'Welcome to Financbase!';

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">🏦 Welcome to Financbase!</h1>
	</div>

	<div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
		<h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>

		<p>Welcome to Financbase, your professional financial management platform. We're excited to help you take control of your business finances.</p>

		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
			<h3 style="margin-top: 0; color: #495057;">Get Started</h3>
			<ul style="text-align: left; color: #495057;">
				<li>Set up your business profile and preferences</li>
				<li>Add your first clients and create invoices</li>
				<li>Track expenses and monitor cash flow</li>
				<li>Explore AI-powered financial insights</li>
			</ul>
		</div>

		<div style="text-align: center; margin: 30px 0;">
			<a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
			   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				Get Started
			</a>
		</div>

		<p>Need help? Our support team is here for you at support@financbase.com</p>
	</div>
</body>
</html>
		`.trim();

		return this.sendEmail({
			to: { email: userEmail, name: userName },
			subject,
			html,
		});
	}

	/**
	 * Send persona-specific welcome email
	 */
	static async sendPersonaWelcomeEmail(
		userEmail: string,
		userName: string,
		persona: 'digital_agency' | 'real_estate' | 'tech_startup' | 'freelancer'
	): Promise<{ success: boolean; messageId?: string; error?: string }> {
		const templates = {
			digital_agency: {
				subject: 'Welcome to Financbase—Your Agency\'s Growth Command Center 🚀',
				icon: '🏢',
				title: 'Your Agency\'s Growth Command Center',
				description: 'Financbase is designed to empower your agency with instant clarity on client profitability, billable hours, and seamless invoicing—no spreadsheets required.',
				benefits: [
					'Import your clients/projects and see profit margins instantly',
					'Track billable hours and project profitability',
					'Generate professional invoices with automated reminders',
					'Invite your team for full transparency and collaboration'
				],
				ctaText: 'Login to your dashboard',
				ctaUrl: '/onboarding?persona=digital_agency',
				helpText: 'If you need help, reply to this email or check out our agency onboarding guide.'
			},
			real_estate: {
				subject: 'Welcome to Financbase—Your Real Estate Portfolio HQ 🏠',
				icon: '🏠',
				title: 'Your Real Estate Portfolio HQ',
				description: 'You\'re ready to simplify rental income tracking and investment analytics. Here\'s how to get up and running:',
				benefits: [
					'Add your first property and import from spreadsheet',
					'Log rental income & expenses for real-time cash flow',
					'Generate automated owner statements for co-owners',
					'Monitor portfolio performance and upcoming lease expiries'
				],
				ctaText: 'Log in to Financbase',
				ctaUrl: '/onboarding?persona=real_estate',
				helpText: 'Questions about setup? Our support team (and guides) are just a click away.'
			},
			tech_startup: {
				subject: 'Get Ready to Unlock Your Startup\'s Financial Edge with Financbase',
				icon: '🚀',
				title: 'Your Startup\'s Financial Edge',
				description: 'Financbase is built to help high-growth startups like yours:',
				benefits: [
					'Instantly track your burn rate and runway',
					'Automate monthly reporting and investor-ready insights',
					'Connect Stripe for real-time revenue tracking',
					'Onboard your whole team in under 5 minutes'
				],
				ctaText: 'Login now to begin',
				ctaUrl: '/onboarding?persona=tech_startup',
				helpText: 'Get ready to focus on growth, not bookkeeping.'
			},
			freelancer: {
				subject: 'Welcome to Financbase—Financial Peace of Mind for Freelancers',
				icon: '💼',
				title: 'Financial Peace of Mind for Freelancers',
				description: 'We\'re excited to make your freelance finances easier than ever:',
				benefits: [
					'Create and send your first invoice with built-in reminders',
					'Log expenses on the go and snap photos of receipts',
					'Monitor your business health with real-time income/expenses',
					'Get estimated taxes owed to plan for tax season'
				],
				ctaText: 'Get started here',
				ctaUrl: '/onboarding?persona=freelancer',
				helpText: 'Ready to get organized—and stay that way?'
			}
		};

		const template = templates[persona];
		const subject = template.subject;

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">${template.icon} ${template.title}</h1>
		<p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Financbase Financial Management</p>
	</div>

	<div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
		<h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>

		<p>${template.description}</p>

		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
			<h3 style="margin-top: 0; color: #495057;">Next Steps:</h3>
			<ul style="text-align: left; color: #495057; margin: 0; padding-left: 20px;">
				${template.benefits.map(benefit => `<li style="margin: 8px 0;">${benefit}</li>`).join('')}
			</ul>
		</div>

		<div style="text-align: center; margin: 30px 0;">
			<a href="${process.env.NEXT_PUBLIC_APP_URL}${template.ctaUrl}"
			   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				${template.ctaText}
			</a>
		</div>

		<p style="color: #6c757d; font-size: 14px;">${template.helpText}</p>

		<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center; color: #6c757d; font-size: 14px;">
			<p>Cheers,<br>The Financbase Team</p>
		</div>
	</div>
</body>
</html>
		`.trim();

		return this.sendEmail({
			to: { email: userEmail, name: userName },
			subject,
			html,
		});
	}

	/**
	 * Send milestone celebration email
	 */
	static async sendMilestoneEmail(
		userEmail: string,
		userName: string,
		milestone: string,
		persona: 'digital_agency' | 'real_estate' | 'tech_startup' | 'freelancer'
	): Promise<{ success: boolean; messageId?: string; error?: string }> {
		const subject = `🎉 ${milestone} - Keep up the great work!`;

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
		<p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${milestone}</p>
	</div>

	<div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
		<h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>

		<p>Great job on completing this step! You're making excellent progress with your Financbase setup.</p>

		<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
			<h3 style="margin-top: 0; color: #155724;">Ready for the next step?</h3>
			<p style="color: #155724; margin: 0;">Continue your onboarding to unlock more powerful features.</p>
		</div>

		<div style="text-align: center; margin: 30px 0;">
			<a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding"
			   style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				Continue Setup
			</a>
		</div>

		<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center; color: #6c757d; font-size: 14px;">
			<p>Keep up the great work!<br>The Financbase Team</p>
		</div>
	</div>
</body>
</html>
		`.trim();

		return this.sendEmail({
			to: { email: userEmail, name: userName },
			subject,
			html,
		});
	}
}

export default EmailService;
