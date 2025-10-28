import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { LeadManagementService } from '@/lib/services/lead-management-service';

// Clerk webhook secret - should be set in environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const svix_id = request.headers.get('svix-id');
    const svix_timestamp = request.headers.get('svix-timestamp');
    const svix_signature = request.headers.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    const payload = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
      };
    };

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Handle the webhook
    const { type, data } = evt;

    if (type === 'user.created') {
      try {
        // Extract user information from Clerk webhook
        const user = data;
        const email = user.email_addresses?.[0]?.email_address;
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const userId = user.id;

        if (!email) {
          console.error('No email found in user.created webhook');
          return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Create a lead from the signup
        const lead = await LeadManagementService.createLead({
          userId: userId, // Use the actual Clerk user ID
          firstName,
          lastName,
          email,
          source: 'signup',
          priority: 'high', // New signups are high priority
          notes: 'Lead created from user signup',
          metadata: {
            clerkUserId: userId,
            signupMethod: 'email',
            createdAt: new Date().toISOString(),
            webhookEvent: 'user.created',
          },
        });

        console.log('Lead created from signup:', lead.id);

        return NextResponse.json({ 
          success: true, 
          message: 'Lead created from signup',
          leadId: lead.id 
        });

      } catch (leadError) {
        console.error('Error creating lead from signup:', leadError);
        // Don't fail the webhook if lead creation fails
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create lead from signup' 
        }, { status: 500 });
      }
    }

    // Handle other webhook events if needed
    console.log(`Received webhook event: ${type}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
