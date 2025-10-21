import { render } from "@react-email/render";
import {
	Bell,
	Briefcase,
	Calendar,
	Database,
	Settings,
	Users,
	XCircle,
} from "lucide-react";
import { ProposalStatusChangeEmail } from "../emails/proposal-status-change";
import { sendEmail } from "./email-service";

export interface ProposalNotificationData {
	proposalId: string;
	proposalTitle: string;
	oldStatus: string;
	newStatus: string;
	clientName?: string;
	updatedBy: string;
	recipientEmails: string[];
	proposalUrl: string;
}

export class ProposalNotificationService {
	/**
	 * Send email notification for proposal status change
	 */
	static async sendStatusChangeNotification(
		data: ProposalNotificationData,
	): Promise<void> {
		try {
			const {
				proposalTitle,
				oldStatus,
				newStatus,
				clientName,
				updatedBy,
				recipientEmails,
				proposalUrl,
			} = data;

			// Render email template
			const emailHtml = render(
				ProposalStatusChangeEmail({
					proposalTitle,
					oldStatus,
					newStatus,
					clientName,
					updatedBy,
					proposalUrl,
				}),
			);

			// Send email to all recipients
			await sendEmail({
				to: recipientEmails,
				subject: `Proposal "${proposalTitle}" status changed to ${newStatus}`,
				html: emailHtml,
				text: `Proposal "${proposalTitle}" has been updated from ${oldStatus} to ${newStatus} by ${updatedBy}. View details: ${proposalUrl}`,
			});

			console.log(
				`✅ Proposal status change notification sent to ${recipientEmails.length} recipients`,
			);
		} catch (error) {
			console.error(
				"❌ Failed to send proposal status change notification:",
				error,
			);
			throw error;
		}
	}

	/**
	 * Send email notification for new proposal created
	 */
	static async sendProposalCreatedNotification(data: {
		proposalTitle: string;
		proposalUrl: string;
		recipientEmails: string[];
		createdBy: string;
	}): Promise<void> {
		try {
			const { proposalTitle, proposalUrl, recipientEmails, createdBy } = data;

			const emailHtml = render(
				ProposalStatusChangeEmail({
					proposalTitle,
					oldStatus: "Draft",
					newStatus: "Created",
					updatedBy: createdBy,
					proposalUrl,
				}),
			);

			await sendEmail({
				to: recipientEmails,
				subject: `New Proposal Created: "${proposalTitle}"`,
				html: emailHtml,
				text: `A new proposal "${proposalTitle}" has been created by ${createdBy}. View details: ${proposalUrl}`,
			});

			console.log(
				`✅ Proposal created notification sent to ${recipientEmails.length} recipients`,
			);
		} catch (error) {
			console.error("❌ Failed to send proposal created notification:", error);
			throw error;
		}
	}

	/**
	 * Send email notification for proposal deadline approaching
	 */
	static async sendDeadlineReminder(data: {
		proposalTitle: string;
		deadline: Date;
		proposalUrl: string;
		recipientEmails: string[];
		daysUntilDeadline: number;
	}): Promise<void> {
		try {
			const {
				proposalTitle,
				deadline,
				proposalUrl,
				recipientEmails,
				daysUntilDeadline,
			} = data;

			const subject = `Proposal Deadline Reminder: "${proposalTitle}" (${daysUntilDeadline} days)`;
			const urgencyLevel =
				daysUntilDeadline <= 1
					? "URGENT"
					: daysUntilDeadline <= 3
						? "HIGH PRIORITY"
						: "REMINDER";

			const emailHtml = render(
				ProposalStatusChangeEmail({
					proposalTitle,
					oldStatus: "Active",
					newStatus: `${urgencyLevel} - Due ${deadline.toLocaleDateString()}`,
					updatedBy: "System",
					proposalUrl,
				}),
			);

			await sendEmail({
				to: recipientEmails,
				subject,
				html: emailHtml,
				text: `Proposal "${proposalTitle}" is due in ${daysUntilDeadline} days (${deadline.toLocaleDateString()}). ${proposalUrl}`,
			});

			console.log(
				`✅ Proposal deadline reminder sent to ${recipientEmails.length} recipients`,
			);
		} catch (error) {
			console.error("❌ Failed to send deadline reminder:", error);
			throw error;
		}
	}

	/**
	 * Get notification recipients for a proposal
	 */
	static async getNotificationRecipients(
		proposalId: string,
		userId: string,
	): Promise<string[]> {
		// In a real implementation, this would query the database for:
		// - Proposal owner
		// - Assigned team members
		// - Client contacts (if notification preferences allow)
		// - Admin users who should be notified

		// For now, return a basic list - this should be expanded based on business needs
		return [
			`user-${userId}@example.com`, // Proposal owner
			"admin@financbase.com", // Admin notification
		];
	}
}
