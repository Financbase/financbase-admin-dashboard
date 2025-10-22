// This file contains email templates only - no server imports
// Server-side email sending is handled in API routes

export async function sendNotificationEmail(userId: string, notification: any) {
	// Placeholder function - in production, this would send actual emails
	console.log('Sending notification email to user:', userId, notification);
	return true;
}

export function getEmailTemplate(type: string, notification: any) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://financbase.com';

	switch (type) {
		case 'invoice':
			return {
				subject: `Invoice ${notification.data?.invoiceNumber || 'Update'} - Financbase`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
							<h1 style="color: white; margin: 0; font-size: 28px;">Invoice Update</h1>
							<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Financbase Financial Management</p>
						</div>

						<div style="padding: 30px 20px; background: #f9f9f9;">
							<h2 style="color: #333; margin: 0 0 20px 0;">Invoice ${notification.data?.invoiceNumber || 'Notification'}</h2>

							<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
								<p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>

								${notification.data?.amount ? `
									<div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Amount:</strong> $${notification.data.amount.toLocaleString()}
									</div>
								` : ''}

								${notification.data?.dueDate ? `
									<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Due Date:</strong> ${new Date(notification.data.dueDate).toLocaleDateString()}
									</div>
								` : ''}

								<div style="text-align: center; margin: 30px 0;">
									<a href="${baseUrl}${notification.actionUrl}"
									   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
										View Invoice
									</a>
								</div>
							</div>

							<div style="margin: 30px 0; text-align: center;">
								<p style="color: #666; font-size: 14px; margin: 0;">
									This is an automated notification from Financbase.<br>
									Please do not reply to this email.
								</p>
							</div>
						</div>

						<div style="background: #333; padding: 20px; text-align: center;">
							<p style="color: white; margin: 0; font-size: 12px;">
								© 2024 Financbase. All rights reserved.<br>
								<a href="${baseUrl}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
							</p>
						</div>
					</div>
				`,
				text: `
Financbase - Invoice Update

${notification.message}

${notification.data?.amount ? `Amount: $${notification.data.amount.toLocaleString()}` : ''}
${notification.data?.dueDate ? `Due Date: ${new Date(notification.data.dueDate).toLocaleDateString()}` : ''}

View Invoice: ${baseUrl}${notification.actionUrl}

This is an automated notification from Financbase.
Manage your notification preferences: ${baseUrl}/settings/notifications
				`,
			};

		case 'expense':
			return {
				subject: `Expense ${notification.data?.status || 'Update'} - Financbase`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
							<h1 style="color: white; margin: 0; font-size: 28px;">Expense Update</h1>
							<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Financbase Financial Management</p>
						</div>

						<div style="padding: 30px 20px; background: #f9f9f9;">
							<h2 style="color: #333; margin: 0 0 20px 0;">Expense Notification</h2>

							<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
								<p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>

								${notification.data?.amount ? `
									<div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Amount:</strong> $${notification.data.amount.toLocaleString()}
									</div>
								` : ''}

								${notification.data?.category ? `
									<div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Category:</strong> ${notification.data.category}
									</div>
								` : ''}

								<div style="text-align: center; margin: 30px 0;">
									<a href="${baseUrl}${notification.actionUrl}"
									   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
										View Expense
									</a>
								</div>
							</div>
						</div>

						<div style="background: #333; padding: 20px; text-align: center;">
							<p style="color: white; margin: 0; font-size: 12px;">
								© 2024 Financbase. All rights reserved.<br>
								<a href="${baseUrl}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
							</p>
						</div>
					</div>
				`,
				text: `
Financbase - Expense Update

${notification.message}

${notification.data?.amount ? `Amount: $${notification.data.amount.toLocaleString()}` : ''}
${notification.data?.category ? `Category: ${notification.data.category}` : ''}

View Expense: ${baseUrl}${notification.actionUrl}

This is an automated notification from Financbase.
Manage your notification preferences: ${baseUrl}/settings/notifications
				`,
			};

		case 'alert':
			return {
				subject: `⚠️ ${notification.title} - Financbase Alert`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
							<h1 style="color: white; margin: 0; font-size: 28px;">System Alert</h1>
							<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Financbase Financial Management</p>
						</div>

						<div style="padding: 30px 20px; background: #f9f9f9;">
							<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #ff6b6b;">
								<h2 style="color: #333; margin: 0 0 20px 0;">${notification.title}</h2>
								<p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>

								${notification.priority === 'urgent' ? `
									<div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong style="color: #c62828;">🚨 URGENT:</strong> This requires immediate attention.
									</div>
								` : ''}

								${notification.actionUrl ? `
									<div style="text-align: center; margin: 30px 0;">
										<a href="${baseUrl}${notification.actionUrl}"
										   style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
											Resolve Issue
										</a>
									</div>
								` : ''}
							</div>
						</div>

						<div style="background: #333; padding: 20px; text-align: center;">
							<p style="color: white; margin: 0; font-size: 12px;">
								© 2024 Financbase. All rights reserved.<br>
								<a href="${baseUrl}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
							</p>
						</div>
					</div>
				`,
				text: `
URGENT: Financbase Alert

${notification.title}

${notification.message}

${notification.priority === 'urgent' ? 'This requires immediate attention.' : ''}

${notification.actionUrl ? `Resolve: ${baseUrl}${notification.actionUrl}` : ''}

This is an automated alert from Financbase.
Manage your notification preferences: ${baseUrl}/settings/notifications
				`,
			};

		case 'report':
			return {
				subject: `📊 Report Ready - ${notification.data?.reportName || 'Financial Report'}`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); padding: 40px 20px; text-align: center;">
							<h1 style="color: white; margin: 0; font-size: 28px;">Report Ready</h1>
							<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Financbase Financial Management</p>
						</div>

						<div style="padding: 30px 20px; background: #f9f9f9;">
							<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #4ecdc4;">
								<h2 style="color: #333; margin: 0 0 20px 0;">${notification.data?.reportName || 'Your Report'} is Ready</h2>
								<p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>

								${notification.data?.period ? `
									<div style="background: #e8f8f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Period:</strong> ${notification.data.period}
									</div>
								` : ''}

								${notification.data?.metrics ? `
									<div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
										<strong>Key Metrics:</strong><br>
										${Object.entries(notification.data.metrics).map(([key, value]) => `${key}: ${value}`).join('<br>')}
									</div>
								` : ''}

								<div style="text-align: center; margin: 30px 0;">
									<a href="${baseUrl}${notification.actionUrl}"
									   style="background: #4ecdc4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
										View Report
									</a>
								</div>
							</div>
						</div>

						<div style="background: #333; padding: 20px; text-align: center;">
							<p style="color: white; margin: 0; font-size: 12px;">
								© 2024 Financbase. All rights reserved.<br>
								<a href="${baseUrl}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
							</p>
						</div>
					</div>
				`,
				text: `
Financbase - Report Ready

${notification.data?.reportName || 'Your Report'} is Ready

${notification.message}

${notification.data?.period ? `Period: ${notification.data.period}` : ''}

View Report: ${baseUrl}${notification.actionUrl}

This is an automated notification from Financbase.
Manage your notification preferences: ${baseUrl}/settings/notifications
				`,
			};

		default:
			return {
				subject: `Financbase Notification - ${notification.title}`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
							<h1 style="color: white; margin: 0; font-size: 28px;">Financbase</h1>
							<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Financial Management Platform</p>
						</div>

						<div style="padding: 30px 20px; background: #f9f9f9;">
							<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
								<h2 style="color: #333; margin: 0 0 20px 0;">${notification.title}</h2>
								<p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>

								${notification.actionUrl ? `
									<div style="text-align: center; margin: 30px 0;">
										<a href="${baseUrl}${notification.actionUrl}"
										   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
											Take Action
										</a>
									</div>
								` : ''}
							</div>
						</div>

						<div style="background: #333; padding: 20px; text-align: center;">
							<p style="color: white; margin: 0; font-size: 12px;">
								© 2024 Financbase. All rights reserved.<br>
								<a href="${baseUrl}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
							</p>
						</div>
					</div>
				`,
				text: `
Financbase Notification

${notification.title}

${notification.message}

${notification.actionUrl ? `Action: ${baseUrl}${notification.actionUrl}` : ''}

This is an automated notification from Financbase.
Manage your notification preferences: ${baseUrl}/settings/notifications
				`,
			};
	}
}