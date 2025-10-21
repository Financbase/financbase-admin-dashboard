import { AIService } from "@/lib/ai-service";
import {
	Bot,
	Briefcase,
	CheckCircle,
	Clock,
	CreditCard,
	MessageCircle,
	XCircle,
} from "lucide-react";

export interface InvoiceData {
	clientId: string;
	projectDescription: string;
	timeEntries: Array<{
		description: string;
		hours: number;
		rate: number;
	}>;
	expenses: Array<{
		description: string;
		amount: number;
	}>;
}

export interface ClientData {
	clientId: string;
	paymentHistory: Array<{
		amount: number;
		paidOnTime: boolean;
		daysToPay: number;
	}>;
	totalOwed: number;
}

export interface InvoiceContent {
	description: string;
	lineItems: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		amount: number;
	}>;
	notes: string;
	terms: string;
}

export interface PaymentTerms {
	terms: string;
	reasoning: string;
}

export class AIInvoiceGeneratorService {
	private aiService: AIService;

	constructor() {
		this.aiService = new AIService();
	}

	/**
	 * Generate invoice content using AI
	 */
	async generateInvoiceContent(
		invoiceData: InvoiceData,
	): Promise<InvoiceContent> {
		try {
			const prompt = `Generate professional invoice content for:
Project: ${invoiceData.projectDescription}
Time Entries: ${JSON.stringify(invoiceData.timeEntries)}
Expenses: ${JSON.stringify(invoiceData.expenses)}

Please respond with a JSON object containing:
- description: professional project description
- lineItems: array of line items with description, quantity, unitPrice, amount
- notes: professional thank you message
- terms: payment terms (e.g., "Net 30")

Example response:
{
  "description": "Website development services including frontend and backend development",
  "lineItems": [
    {
      "description": "Frontend Development - 20 hours",
      "quantity": 20,
      "unitPrice": 100,
      "amount": 2000
    }
  ],
  "notes": "Thank you for your business. Payment is due within 30 days.",
  "terms": "Net 30"
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "generate",
				maxTokens: 500,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			return JSON.parse(response.result);
		} catch (error) {
			// Fallback content
			return {
				description: invoiceData.projectDescription,
				lineItems: [
					{
						description: "Consultation Services",
						quantity: 1,
						unitPrice: 500,
						amount: 500,
					},
				],
				notes: "Thank you for your business.",
				terms: "Net 30",
			};
		}
	}

	/**
	 * Generate payment terms based on client history
	 */
	async generatePaymentTerms(clientData: ClientData): Promise<PaymentTerms> {
		try {
			const prompt = `Based on this client's payment history, suggest appropriate payment terms:
Payment History: ${JSON.stringify(clientData.paymentHistory)}
Total Currently Owed: $${clientData.totalOwed}

Please respond with a JSON object containing:
- terms: payment terms (e.g., "Net 15", "Net 30", "Due on Receipt")
- reasoning: explanation for the recommendation

Example response:
{
  "terms": "Net 30",
  "reasoning": "Client has good payment history with on-time payments"
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "suggest",
				maxTokens: 200,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			return JSON.parse(response.result);
		} catch (error) {
			// Fallback terms
			return {
				terms: "Net 30",
				reasoning: "Standard payment terms applied due to insufficient data",
			};
		}
	}
}
